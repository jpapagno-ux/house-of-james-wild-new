"use client";

// The MapLibre half of the 3D terrain pilot. Loaded only by TerrainFlyover, through next/dynamic (ssr: false), once
// the section is near the viewport: MapLibre, its worker and its CSS never reach the main bundle or other pages.
// Free sources by default (OpenFreeMap + AWS Terrarium); MapTiler when NEXT_PUBLIC_MAPTILER_KEY is set in Vercel env.
// The key is read here only, never logged (errors are redacted), and must be domain-restricted in MapTiler.
import { useCallback, useEffect, useRef, useState } from "react";
import { AttributionControl, Map as MLMap, NavigationControl, addProtocol, setWorkerUrl, type GeoJSONSource, type LayerSpecification, type RasterDEMSourceSpecification, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ATTRIBUTION, AWS_TERRARIUM, DEM_PROTOCOL, MAPTILER, OFM_STYLE, fontOf, groundStyle, houseStyle, redact } from "./style";
import { bearingOf, boundsOf, clampSeabed, dayLabel, legsOf, lngLat, partOf, type LngLat, type TerrainKind, type TerrainRoute, type TerrainStop } from "./geo";
import { CRIMSON, HOUSE } from "@/lib/palette";

const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";
const MAX_PITCH = 65; // MapTiler's limit; the free stack keeps the same cap
const LEG_MS = 3500;

// ---------- one-time globals: the worker (emitted by webpack as an asset) and the sea-level DEM protocol ----------
let booted = false;
function boot() {
  if (booted) return;
  booted = true;
  setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);
  addProtocol(DEM_PROTOCOL, async (params, abort) => {
    // jwdem://<encoding>/<https url>: fetch the elevation tile, flatten the seabed to sea level, hand back a bitmap.
    const rest = params.url.slice(`${DEM_PROTOCOL}://`.length);
    const cut = rest.indexOf("/");
    const enc = rest.slice(0, cut) === "mapbox" ? "mapbox" : "terrarium";
    const res = await fetch(rest.slice(cut + 1), { signal: abort.signal });
    if (!res.ok) throw new Error(`elevation tile ${res.status}`);
    const bmp = await createImageBitmap(await res.blob());
    try {
      const c = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(bmp.width, bmp.height) : Object.assign(document.createElement("canvas"), { width: bmp.width, height: bmp.height });
      const ctx = c.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
      if (!ctx) return { data: bmp };
      ctx.drawImage(bmp, 0, 0);
      const img = ctx.getImageData(0, 0, bmp.width, bmp.height);
      clampSeabed(img.data, enc);
      bmp.close();
      return { data: await createImageBitmap(img) };
    } catch {
      return { data: bmp };
    }
  });
}

async function demSource(): Promise<RasterDEMSourceSpecification> {
  if (KEY) {
    try {
      const tj = await (await fetch(MAPTILER.terrain(KEY))).json() as { tiles?: string[]; encoding?: string; tileSize?: number; minzoom?: number; maxzoom?: number; attribution?: string };
      const enc = tj.encoding === "terrarium" ? "terrarium" : "mapbox";
      if (tj.tiles?.length) return { type: "raster-dem", tiles: tj.tiles.map((t) => `${DEM_PROTOCOL}://${enc}/${t}`), encoding: enc, tileSize: tj.tileSize ?? 512, minzoom: tj.minzoom ?? 0, maxzoom: tj.maxzoom ?? 14, attribution: ATTRIBUTION.maptiler };
    } catch { /* fall back to the free tiles */ }
  }
  return { type: "raster-dem", tiles: [`${DEM_PROTOCOL}://terrarium/${AWS_TERRARIUM}`], encoding: "terrarium", tileSize: 256, maxzoom: 15, attribution: ATTRIBUTION.aws };
}

async function baseStyle(): Promise<{ style: StyleSpecification; maptiler: boolean }> {
  const tries: [string, boolean, string][] = [...(KEY ? [[MAPTILER.style(KEY), true, `${ATTRIBUTION.maptiler} ${ATTRIBUTION.osm}`] as [string, boolean, string]] : []), [OFM_STYLE, false, `${ATTRIBUTION.ofm} ${ATTRIBUTION.osm}`]];
  for (const [url, mt, attribution] of tries) {
    try {
      const res = await fetch(url);
      if (res.ok) return { style: houseStyle(await res.json(), { demSource: "jw-dem-shade", attribution }), maptiler: mt };
    } catch { /* next */ }
  }
  return { style: groundStyle("jw-dem-shade"), maptiler: false };
}

const fc = (features: GeoJSON.Feature[]): GeoJSON.FeatureCollection => ({ type: "FeatureCollection", features });
const line = (coords: LngLat[]): GeoJSON.Feature => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } });
const stopsFc = (stops: TerrainStop[]) => fc(stops.map((s, i) => ({ type: "Feature", id: i, properties: { name: s.name }, geometry: { type: "Point", coordinates: lngLat(s) } })));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type TerrainMapProps = {
  routes: TerrainRoute[];
  kind: TerrainKind;
  /** The volume base for the route line and the resting pins (lib/volumes.ts volumeMark), passed in as data. */
  ink: string;
  exaggeration: number;
  reduced: boolean;
  playLabel: string;
  title: string;
  onReady: () => void;
  onFail: () => void;
};

export default function TerrainMap({ routes, kind, ink, exaggeration, reduced, playLabel, title, onReady, onFail }: TerrainMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const run = useRef(0); // play token: a new value cancels a flight in progress
  const next = useRef(1); // the next leg to fly when Play resumes
  const raf = useRef(0);
  const auto = useRef(false);
  const [ready, setReady] = useState(false);
  const [routeIx, setRouteIx] = useState(0);
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [sat, setSat] = useState(false);
  const [hasSat, setHasSat] = useState(false);
  const route = routes[routeIx] ?? routes[0];
  const stops = route.stops;
  const isRoute = kind !== "points" && stops.length > 1;

  // ---------- build the map once ----------
  useEffect(() => {
    let dead = false, map: MLMap | null = null, warned = false;
    const token = run, frame = raf;
    (async () => {
      try {
        boot();
        const [{ style, maptiler }, dem] = await Promise.all([baseStyle(), demSource()]);
        if (dead || !box.current) return;
        style.sources["jw-dem"] = dem;
        style.sources["jw-dem-shade"] = { ...dem };
        const layers = style.layers as LayerSpecification[];
        if (maptiler && KEY) {
          style.sources["jw-satellite"] = { type: "raster", url: MAPTILER.satellite(KEY), attribution: ATTRIBUTION.maptiler };
          const at = layers.findIndex((l) => l.id === "jw-hillshade");
          layers.splice(at < 0 ? layers.length : at, 0, { id: "jw-satellite", type: "raster", source: "jw-satellite", layout: { visibility: "none" } });
        }
        const font = fontOf(style);
        const first = routes[0].stops;
        style.sources["jw-route-all"] = { type: "geojson", data: fc(isRoute ? [line(legsOf(first).flat())] : []) };
        style.sources["jw-route"] = { type: "geojson", data: fc(isRoute ? [line(legsOf(first).flat())] : []) };
        style.sources["jw-stops"] = { type: "geojson", data: stopsFc(first) };
        layers.push(
          { id: "jw-route-ghost", type: "line", source: "jw-route-all", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": HOUSE.stone, "line-width": 1.4, "line-opacity": 0.7, "line-dasharray": [2, 2] } },
          { id: "jw-route-line", type: "line", source: "jw-route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ink, "line-width": ["interpolate", ["linear"], ["zoom"], 6, 2.5, 12, 4.5] } },
          { id: "jw-stops-dot", type: "circle", source: "jw-stops", paint: {
            "circle-radius": ["case", ["boolean", ["feature-state", "active"], false], 8, 5.5],
            "circle-color": ["case", ["boolean", ["feature-state", "active"], false], CRIMSON.fill, kind === "points" ? ink : HOUSE.graphite],
            "circle-stroke-color": HOUSE.paper, "circle-stroke-width": 2, "circle-pitch-alignment": "viewport",
          } },
        );
        if (style.glyphs) layers.push({ id: "jw-stops-label", type: "symbol", source: "jw-stops", layout: { "text-field": ["get", "name"], "text-font": font, "text-size": 12, "text-offset": [0, 1.1], "text-anchor": "top", "text-optional": true }, paint: { "text-color": HOUSE.graphite, "text-halo-color": HOUSE.paper, "text-halo-width": 1.6 } });
        style.terrain = { source: "jw-dem", exaggeration };

        const b = boundsOf(first);
        const single = b[0][0] === b[1][0] && b[0][1] === b[1][1];
        map = new MLMap({
          container: box.current, style,
          ...(single ? { center: lngLat(first[0]), zoom: 12 } : { bounds: b, fitBoundsOptions: { padding: 56, maxZoom: 12.5 } }),
          pitch: 58, bearing: -14, maxPitch: MAX_PITCH, cooperativeGestures: true, attributionControl: false,
          maplibreLogo: false, fadeDuration: reduced ? 0 : 300,
          locale: {
            "CooperativeGesturesHandler.WindowsHelpText": "Hold Ctrl and scroll to zoom the map",
            "CooperativeGesturesHandler.MacHelpText": "Hold Cmd and scroll to zoom the map",
            "CooperativeGesturesHandler.MobileHelpText": "Use two fingers to move the map",
          },
        });
        mapRef.current = map;
        map.addControl(new NavigationControl({ visualizePitch: true, showCompass: true, showZoom: true }), "top-right");
        map.addControl(new AttributionControl({ compact: false }), "bottom-right");
        // Errors are redacted (a MapTiler key never prints). If the elevation tiles cannot be reached, the map drops
        // to a flat chart so the route and pins still show.
        let demOk = false, demFails = 0;
        map.on("data", (e) => { if ((e as { sourceId?: string; tile?: unknown }).sourceId === "jw-dem" && (e as { tile?: unknown }).tile) demOk = true; });
        map.on("error", (e) => {
          if (!warned) { warned = true; console.warn("[terrain pilot]", redact(String(e.error?.message ?? "map error"))); }
          const src = (e as { sourceId?: string }).sourceId;
          if (!demOk && (src === "jw-dem" || src === "jw-dem-shade") && ++demFails >= 4 && map?.getTerrain()) {
            map.setTerrain(null);
            if (box.current) box.current.dataset.relief = "flat";
            if (map.getLayer("jw-hillshade")) map.setLayoutProperty("jw-hillshade", "visibility", "none");
          }
        });
        map.on("webglcontextlost", () => onFail());
        // A hand on the map takes over from the flight.
        map.on("dragstart", () => { run.current++; cancelAnimationFrame(raf.current); setPlaying(false); });
        map.once("load", () => { if (dead) return; if (box.current) box.current.dataset.relief = map?.getTerrain() ? "terrain" : "flat"; setHasSat(!!map?.getLayer("jw-satellite")); setReady(true); onReady(); });
      } catch (err) {
        console.warn("[terrain pilot] could not start", redact(String((err as Error)?.message ?? err)));
        if (!dead) onFail();
      }
    })();
    return () => { dead = true; token.current++; cancelAnimationFrame(frame.current); map?.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- helpers ----------
  const setStops = useCallback((ix: number) => {
    const m = mapRef.current;
    if (!m) return;
    stops.forEach((_, i) => m.setFeatureState({ source: "jw-stops", id: i }, { active: i === ix }));
    setActive(ix);
  }, [stops]);
  const setDrawn = (coords: LngLat[]) => (mapRef.current?.getSource("jw-route") as GeoJSONSource | undefined)?.setData(fc(coords.length > 1 ? [line(coords)] : []));
  const legZoom = useCallback(() => {
    const m = mapRef.current;
    if (!m) return 11;
    const b = boundsOf(stops);
    const z = m.cameraForBounds(b, { padding: 40 })?.zoom ?? 10;
    return Math.min(kind === "points" ? 13 : z + 1.5, 12.5);
  }, [stops, kind]);
  const overview = useCallback((animate: boolean) => {
    const m = mapRef.current;
    if (!m) return;
    const b = boundsOf(stops);
    const single = b[0][0] === b[1][0] && b[0][1] === b[1][1];
    if (single) m.easeTo({ center: lngLat(stops[0]), zoom: 12, pitch: 58, bearing: -14, duration: animate ? 1200 : 0 });
    else m.fitBounds(b, { padding: 56, maxZoom: 12.5, pitch: 58, bearing: -14, duration: animate ? 1200 : 0 });
  }, [stops]);

  // A new route (Week A / Week B): fresh data, a static pitched overview.
  useEffect(() => {
    const m = mapRef.current;
    if (!ready || !m) return;
    run.current++;
    m.stop();
    (m.getSource("jw-stops") as GeoJSONSource).setData(stopsFc(stops));
    const all = isRoute ? legsOf(stops).flat() : [];
    (m.getSource("jw-route-all") as GeoJSONSource).setData(fc(isRoute ? [line(all)] : []));
    setDrawn(all);
    setStops(-1); setPlaying(false); setDone(false); next.current = 1;
    overview(false);
  }, [ready, routeIx]); // eslint-disable-line react-hooks/exhaustive-deps

  const fly = (m: MLMap, opts: { center: LngLat; zoom: number; bearing: number }) => new Promise<void>((res) => {
    m.once("moveend", () => res());
    if (reduced) m.jumpTo({ ...opts, pitch: 60 });
    else m.flyTo({ ...opts, pitch: 60, duration: LEG_MS, curve: 1.2, essential: true });
  });
  const grow = (leg: LngLat[], before: LngLat[], token: number) => new Promise<void>((res) => {
    if (reduced) { setDrawn([...before, ...leg]); res(); return; }
    const t0 = performance.now();
    const step = (now: number) => {
      if (run.current !== token) return res();
      const t = Math.min(1, (now - t0) / LEG_MS);
      setDrawn([...before, ...partOf(leg, t)]);
      if (t < 1) raf.current = requestAnimationFrame(step); else res();
    };
    raf.current = requestAnimationFrame(step);
  });

  const play = useCallback(async (from = next.current) => {
    const m = mapRef.current;
    if (!m) return;
    const token = ++run.current;
    setPlaying(true); setDone(false);
    const z = legZoom();
    const legs = legsOf(stops);
    if (from <= 1) {
      // Back to the first stop to start the voyage.
      setDrawn([]); setStops(0);
      const b0 = stops.length > 1 ? bearingOf(lngLat(stops[0]), lngLat(stops[1])) : m.getBearing();
      await fly(m, { center: lngLat(stops[0]), zoom: z, bearing: b0 });
      if (reduced) await wait(1800);
      if (run.current !== token) return;
      if (stops.length === 1) {
        // One pin (a stay): a slow turn round it.
        if (!reduced) await new Promise<void>((res) => { m.once("moveend", () => res()); m.easeTo({ bearing: m.getBearing() + 160, duration: 9000, easing: (t) => t }); });
        if (run.current === token) { setPlaying(false); setDone(true); next.current = 1; }
        return;
      }
      from = 1;
    }
    for (let i = from; i < stops.length; i++) {
      if (run.current !== token) return;
      next.current = i;
      const before = isRoute ? legs.slice(0, i - 1).flat() : [];
      const target = lngLat(stops[i]);
      const bearing = kind === "points" ? m.getBearing() + 50 : bearingOf(lngLat(stops[i - 1]), target);
      const flight = fly(m, { center: target, zoom: z, bearing });
      const growing = isRoute ? grow(legs[i - 1], before, token) : Promise.resolve();
      await Promise.all([flight, growing]);
      if (run.current !== token) return;
      setStops(i);
      await wait(reduced ? 2200 : 700);
    }
    if (run.current !== token) return;
    next.current = 1;
    setPlaying(false); setDone(true);
    if (isRoute) setDrawn(legs.flat());
  }, [stops, isRoute, kind, reduced, legZoom, setStops]); // eslint-disable-line react-hooks/exhaustive-deps

  const pause = () => {
    run.current++;
    cancelAnimationFrame(raf.current);
    mapRef.current?.stop();
    setPlaying(false);
  };
  const replay = () => { pause(); next.current = 1; void play(1); };

  // Autoplay once, when the frame is mostly in view (never with reduced motion).
  useEffect(() => {
    if (!ready || reduced || auto.current || !box.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !auto.current) { auto.current = true; io.disconnect(); void play(1); }
    }, { threshold: 0.6 });
    io.observe(box.current);
    return () => io.disconnect();
  }, [ready, reduced, play]);

  const toggleSat = (on: boolean) => {
    const m = mapRef.current;
    if (!m?.getLayer("jw-satellite")) return;
    m.setLayoutProperty("jw-satellite", "visibility", on ? "visible" : "none");
    m.setPaintProperty("jw-hillshade", "hillshade-exaggeration", on ? 0.12 : 0.55);
    setSat(on);
  };

  const s = active >= 0 ? stops[active] : null;
  const label = s ? dayLabel(s) : null;
  return (
    <>
      {routes.length > 1 && (
        <div className="jw-relief__tabs" role="group" aria-label="Choose the route">
          {routes.map((r, i) => <button key={r.name} type="button" className="jw-relief__btn" aria-pressed={i === routeIx} onClick={() => setRouteIx(i)}>{r.name}</button>)}
        </div>
      )}
      <div className="jw-relief__frame" role="region" aria-label={`${title}, a 3D terrain map`}>
        <div ref={box} className="jw-relief__map" style={{ position: "absolute", inset: 0 }} />
        {s && (
          <p className={`jw-relief__day${label ? "" : " jw-relief__day--solo"}`} aria-live="polite">
            {label && <span className="jw-relief__day-n">{label}</span>}
            <span className="jw-relief__day-name">{s.name}</span>
          </p>
        )}
        {!ready && <p className="jw-relief__wait">Raising the terrain</p>}
      </div>
      <div className="jw-relief__bar">
        {playing
          ? <button type="button" className="jw-relief__btn jw-relief__btn--main" onClick={pause} disabled={!ready}>Pause</button>
          : <button type="button" className="jw-relief__btn jw-relief__btn--main" onClick={() => void play()} disabled={!ready}>{next.current > 1 && !done ? "Resume" : playLabel}</button>}
        <button type="button" className="jw-relief__btn" onClick={replay} disabled={!ready}>Replay</button>
        <button type="button" className="jw-relief__btn" onClick={() => { pause(); setStops(-1); overview(!reduced); }} disabled={!ready}>Overview</button>
        {hasSat && (
          <div className="jw-relief__bar-end" role="group" aria-label="Map style">
            <button type="button" className="jw-relief__btn" aria-pressed={!sat} onClick={() => toggleSat(false)}>Chart</button>
            <button type="button" className="jw-relief__btn" aria-pressed={sat} onClick={() => toggleSat(true)}>Satellite</button>
          </div>
        )}
      </div>
    </>
  );
}
