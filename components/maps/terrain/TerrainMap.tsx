"use client";

// The MapLibre half of the 3D terrain pilot. Loaded only by TerrainFlyover, through next/dynamic (ssr: false), once
// the section is near the viewport: MapLibre, its worker and its CSS never reach the main bundle or other pages.
// Free sources by default (OpenFreeMap + AWS Terrarium); MapTiler when NEXT_PUBLIC_MAPTILER_KEY is set in Vercel env.
// The key is read here only, never logged (errors are redacted), and must be domain-restricted in MapTiler.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AttributionControl, Map as MLMap, Marker, NavigationControl, addProtocol, setWorkerUrl, type GeoJSONSource, type LayerSpecification, type LngLatLike, type RasterDEMSourceSpecification, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ATTRIBUTION, AWS_TERRARIUM, DEM_PROTOCOL, MAPTILER, OFM_STYLE, SKY, SKY_SATELLITE, TILE_CACHE, fontOf, groundStyle, houseStyle, pixelRatioFor, redact, satelliteIndex, satelliteLayer, viewOps } from "./style";
import { boundsOf, frameBounds, clampSeabed, dayLabel, headingAt, isAir, legsOf, lengthKm, lngLat, partOf, smoothLine, cutFor, type LngLat, type TerrainKind, type TerrainRoute, type TerrainStop } from "./geo";
import { CRIMSON, HOUSE } from "@/lib/palette";

const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";
const MAX_PITCH = 65; // MapTiler's limit; the free stack keeps the same cap
const LEG_MS = 3500; // a points view: one pin to the next
const HOME = { pitch: 58, bearing: -14 };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const turn = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180;
/** Sailing time for a leg, by its routed length: long enough to read the islands going by, never a slog. */
const legMs = (leg: LngLat[], air: boolean) => { const km = lengthKm(leg); return air ? Math.min(7000, Math.max(3800, 3000 + km * 4)) : Math.min(9000, Math.max(3800, 2600 + km * 90)); };

// ---------- one-time globals: the worker (emitted by webpack as an asset) and the sea-level DEM protocol ----------
let booted = false;
export function boot() {
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

export async function demSource(): Promise<RasterDEMSourceSpecification> {
  if (KEY) {
    try {
      const tj = await (await fetch(MAPTILER.terrain(KEY))).json() as { tiles?: string[]; encoding?: string; tileSize?: number; minzoom?: number; maxzoom?: number; attribution?: string };
      const enc = tj.encoding === "terrarium" ? "terrarium" : "mapbox";
      if (tj.tiles?.length) return { type: "raster-dem", tiles: tj.tiles.map((t) => `${DEM_PROTOCOL}://${enc}/${t}`), encoding: enc, tileSize: tj.tileSize ?? 512, minzoom: tj.minzoom ?? 0, maxzoom: tj.maxzoom ?? 14, attribution: ATTRIBUTION.maptiler };
    } catch { /* fall back to the free tiles */ }
  }
  return { type: "raster-dem", tiles: [`${DEM_PROTOCOL}://terrarium/${AWS_TERRARIUM}`], encoding: "terrarium", tileSize: 256, maxzoom: 15, attribution: ATTRIBUTION.aws };
}

export async function baseStyle(): Promise<{ style: StyleSpecification; maptiler: boolean }> {
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
/** Route legs as features, each flagged `air` so flown legs draw dashed. */
const legsFc = (legs: LngLat[][], air: boolean[]) => fc(legs.map((l, i) => ({ type: "Feature" as const, properties: { air: !!air[i] }, geometry: { type: "LineString" as const, coordinates: l } })).filter((f) => f.geometry.coordinates.length > 1));
const airOf = (stops: TerrainStop[]) => stops.slice(1).map(isAir);
/** The legs the 3D map draws: each sea lane from the route file (the same path the engraved chart sails), its turns
 *  rounded so line and vessel sweep round the headlands; flown legs stay great-circle arcs. */
const routeLegs = (stops: TerrainStop[]) => legsOf(stops).map((l, i) => (isAir(stops[i + 1]) ? l : smoothLine(l, cutFor(stops[i + 1]))));

// The vehicle on the route, drawn pointing north and rotated to the heading: the house vessel (graphite hull, crimson
// pennant) under way, a small plane on a flown leg. About 22px, like the SVG charts' moving boat.
const VESSEL = `<svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true"><path d="M11 1.5 C14.6 5 15.4 9.5 15 14.5 L14.2 20 H7.8 L7 14.5 C6.6 9.5 7.4 5 11 1.5 Z" fill="${HOUSE.graphite}" stroke="${HOUSE.paper}" stroke-width="1.2" stroke-linejoin="round"/><path d="M11 6 V15.5" stroke="${HOUSE.paper}" stroke-width="1"/><path d="M11 6 L15.8 7.6 L11 9.2 Z" fill="${CRIMSON.fill}" stroke="${HOUSE.paper}" stroke-width=".6" stroke-linejoin="round"/></svg>`;
const PLANE = `<svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true"><path d="M11 1.5 C11.9 1.5 12.3 2.6 12.3 4 V8.6 L20 13 V15 L12.3 12.6 V17.2 L14.6 19 V20.5 L11 19.5 L7.4 20.5 V19 L9.7 17.2 V12.6 L2 15 V13 L9.7 8.6 V4 C9.7 2.6 10.1 1.5 11 1.5 Z" fill="${HOUSE.graphite}" stroke="${HOUSE.paper}" stroke-width="1.1" stroke-linejoin="round"/><circle cx="11" cy="5" r="1" fill="${CRIMSON.fill}"/></svg>`;
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
  /** Set from outside (the day log's itinerary tabs, RouteViews): the route shown, with the picker hidden. */
  routeIndex?: number;
  hideRoutePicker?: boolean;
};

export default function TerrainMap({ routes, kind, ink, exaggeration, reduced, playLabel, title, onReady, onFail, routeIndex, hideRoutePicker }: TerrainMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const run = useRef(0); // play token: a new value cancels a flight in progress
  const next = useRef(1); // the next leg to fly when Play resumes
  const raf = useRef(0);
  const auto = useRef(false);
  const vehicle = useRef<Marker | null>(null);
  const vehicleAir = useRef<boolean | null>(null);
  const activeRef = useRef(-1);
  const camFree = useRef(false); // a hand on the map: the auto camera stands down until Replay
  const baseLayers = useRef<{ id: string; type: string; "source-layer"?: string; layout?: Record<string, unknown> }[]>([]);
  const [ready, setReady] = useState(false);
  const [routeIx, setRouteIx] = useState(routeIndex ?? 0);
  useEffect(() => { if (typeof routeIndex === "number" && routeIndex >= 0 && routeIndex < routes.length) setRouteIx(routeIndex); }, [routeIndex, routes.length]);
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [sat, setSat] = useState(false);
  const [hasSat, setHasSat] = useState(false);
  const route = routes[routeIx] ?? routes[0];
  const stops = route.stops;
  const isRoute = kind !== "points" && stops.length > 1;
  const legs = useMemo(() => (isRoute ? routeLegs(stops) : []), [stops, isRoute]);

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
          layers.splice(satelliteIndex(layers), 0, satelliteLayer());
        }
        baseLayers.current = layers.map((l) => ({ ...l, layout: { ...((l as { layout?: object }).layout ?? {}) } })) as typeof baseLayers.current;
        const font = fontOf(style);
        const first = routes[0].stops;
        // The route lines are plain line layers: MapLibre drapes them on the terrain surface (sea level is flat, the
        // seabed is clamped), so they lie on the water with no walls, offsets or extrusion at any pitch.
        style.sources["jw-route-all"] = { type: "geojson", data: isRoute ? legsFc(routeLegs(first), airOf(first)) : fc([]) };
        style.sources["jw-route"] = { type: "geojson", data: isRoute ? legsFc(routeLegs(first), airOf(first)) : fc([]) };
        style.sources["jw-stops"] = { type: "geojson", data: stopsFc(first) };
        layers.push(
          { id: "jw-route-ghost", type: "line", source: "jw-route-all", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": HOUSE.stone, "line-width": 1.4, "line-opacity": 0.7, "line-dasharray": [2, 2] } },
          { id: "jw-route-line", type: "line", source: "jw-route", filter: ["!", ["get", "air"]], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ink, "line-width": ["interpolate", ["linear"], ["zoom"], 6, 2.5, 12, 4.5] } },
          { id: "jw-route-air", type: "line", source: "jw-route", filter: ["get", "air"], layout: { "line-cap": "butt", "line-join": "round" }, paint: { "line-color": ink, "line-width": 2, "line-dasharray": [2, 2] } },
          { id: "jw-stops-dot", type: "circle", source: "jw-stops", paint: {
            "circle-radius": ["case", ["boolean", ["feature-state", "active"], false], 8, 5.5],
            "circle-color": ["case", ["boolean", ["feature-state", "active"], false], CRIMSON.fill, kind === "points" ? ink : HOUSE.graphite],
            "circle-stroke-color": HOUSE.paper, "circle-stroke-width": 2, "circle-pitch-alignment": "viewport",
          } },
        );
        if (style.glyphs) layers.push({ id: "jw-stops-label", type: "symbol", source: "jw-stops", layout: { "text-field": ["get", "name"], "text-font": font, "text-size": 12, "text-offset": [0, 1.1], "text-anchor": "top", "text-optional": true }, paint: { "text-color": HOUSE.graphite, "text-halo-color": HOUSE.paper, "text-halo-width": 1.6 } });
        style.terrain = { source: "jw-dem", exaggeration };

        const b = frameBounds(first);
        const single = b[0][0] === b[1][0] && b[0][1] === b[1][1];
        map = new MLMap({
          container: box.current, style,
          ...(single ? { center: lngLat(first[0]), zoom: 12 } : { bounds: b, fitBoundsOptions: { padding: 56, maxZoom: 12.5 } }),
          pitch: reduced ? HOME.pitch : 40, bearing: HOME.bearing, maxPitch: MAX_PITCH, cooperativeGestures: true, attributionControl: false,
          maplibreLogo: false, fadeDuration: reduced ? 0 : 300, ...TILE_CACHE,
          pixelRatio: pixelRatioFor(window.devicePixelRatio, window.innerWidth),
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
        // A hand on the map (drag, zoom, turn or tilt, by mouse, wheel, touch or the buttons) takes over from the auto
        // camera until Replay; the voyage itself sails on. Moves the camera makes itself carry no originalEvent.
        const release = (e: { originalEvent?: unknown }) => { if (e.originalEvent) camFree.current = true; };
        for (const ev of ["dragstart", "zoomstart", "rotatestart", "pitchstart"] as const) map.on(ev, release);
        if (isRoute) {
          const el = document.createElement("div");
          el.className = "jw-relief__vehicle";
          el.setAttribute("aria-hidden", "true");
          el.innerHTML = VESSEL;
          vehicle.current = new Marker({ element: el, rotationAlignment: "map", pitchAlignment: "viewport" }).setLngLat(lngLat(first[0])).setRotation(headingAt(routeLegs(first)[0], 0).bearing).addTo(map);
          vehicleAir.current = false;
        }
        map.once("load", () => { if (dead) return; if (box.current) box.current.dataset.relief = map?.getTerrain() ? "terrain" : "flat"; setHasSat(!!map?.getLayer("jw-satellite")); setReady(true); onReady(); });
      } catch (err) {
        console.warn("[terrain pilot] could not start", redact(String((err as Error)?.message ?? err)));
        if (!dead) onFail();
      }
    })();
    return () => { dead = true; token.current++; cancelAnimationFrame(frame.current); vehicle.current?.remove(); vehicle.current = null; map?.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- helpers ----------
  const setStops = useCallback((ix: number) => {
    const m = mapRef.current;
    if (!m) return;
    stops.forEach((_, i) => m.setFeatureState({ source: "jw-stops", id: i }, { active: i === ix }));
    activeRef.current = ix;
    setActive(ix);
  }, [stops]);
  const setDrawn = (l: LngLat[][]) => (mapRef.current?.getSource("jw-route") as GeoJSONSource | undefined)?.setData(legsFc(l, airOf(stops)));
  /** Put the vehicle at a point with a heading; a flown leg shows the plane. */
  const moveVehicle = (at: LngLat, bearing: number, air: boolean) => {
    const v = vehicle.current;
    if (!v) return;
    if (vehicleAir.current !== air) { v.getElement().innerHTML = air ? PLANE : VESSEL; vehicleAir.current = air; }
    v.setLngLat(at).setRotation(bearing);
  };
  /** Rest the vehicle at a stop, facing along the leg that brought it there (or the first leg, at the start). */
  const restVehicle = (ix: number) => {
    if (!vehicle.current || legs.length < 1) return;
    const i = Math.max(0, Math.min(ix, stops.length - 1));
    moveVehicle(lngLat(stops[i]), headingAt(i > 0 ? legs[i - 1] : legs[0], i > 0 ? 1 : 0).bearing, false);
  };
  const legZoom = useCallback(() => {
    const m = mapRef.current;
    if (!m) return 11;
    const z = m.cameraForBounds(frameBounds(stops), { padding: 40 })?.zoom ?? 10;
    return Math.min(kind === "points" ? 13 : z + 1.8, 13); // closer at each stop, so the island's own shape fills the frame
  }, [stops, kind]);
  /** The whole route in frame: fitted to the routed lanes (boundsOf takes in every path), not just the stops. */
  const overviewCam = useCallback((pitch = HOME.pitch, bearing = HOME.bearing) => {
    const m = mapRef.current!;
    const b = frameBounds(stops);
    if (b[0][0] === b[1][0] && b[0][1] === b[1][1]) return { center: lngLat(stops[0]), zoom: 12, pitch, bearing };
    const w = box.current?.clientWidth ?? 800;
    const c = m.cameraForBounds(b, { padding: w < 600 ? 28 : 64, bearing });
    return { center: (c?.center ?? lngLat(stops[0])) as LngLatLike, zoom: Math.min(12.5, (c?.zoom ?? 10) + (pitch > 30 ? 0.35 : 0)), pitch, bearing }; // a pitched view foreshortens: come in a touch
  }, [stops]);
  /** One camera move, resolved when it lands (or is taken over). With reduced motion it is a cut. The auto camera stands
   *  down once a hand is on the map; `force` is for a move the reader asked for (Overview). */
  const cam = (opts: Parameters<MLMap["jumpTo"]>[0], ms: number, how: "fly" | "ease" = "ease", force = false) => new Promise<void>((res) => {
    const m = mapRef.current;
    if (!m || (camFree.current && !force)) return res();
    if (reduced || ms <= 0) { m.jumpTo(opts); return res(); }
    let over = false;
    const fin = () => { if (!over) { over = true; clearTimeout(to); m.off("moveend", fin); res(); } };
    const to = setTimeout(fin, ms + 500);
    m.once("moveend", fin);
    if (how === "fly") m.flyTo({ ...opts, duration: ms, curve: 1.35, easing: ease, essential: true });
    else m.easeTo({ ...opts, duration: ms, easing: ease, essential: true });
  });
  const overview = useCallback((animate: boolean, force = true) => cam(overviewCam(), animate ? 2600 : 0, "fly", force), [overviewCam]); // eslint-disable-line react-hooks/exhaustive-deps

  // A new route (Week A / Week B): fresh data, a static pitched overview.
  useEffect(() => {
    const m = mapRef.current;
    if (!ready || !m) return;
    run.current++;
    m.stop();
    (m.getSource("jw-stops") as GeoJSONSource).setData(stopsFc(stops));
    (m.getSource("jw-route-all") as GeoJSONSource).setData(legsFc(legs, airOf(stops)));
    setDrawn(legs);
    setStops(-1); setPlaying(false); setDone(false); next.current = 1;
    restVehicle(0);
    if (routeIx > 0 || reduced) void cam(overviewCam(reduced ? HOME.pitch : 40), 0, "ease", true);
  }, [ready, routeIx]); // eslint-disable-line react-hooks/exhaustive-deps

  /** One sailed (or flown) leg: the line grows with the vessel at its tip, turned through the bends, and the camera rides
   *  with it: a low-passed follow of the vessel, a slow bearing drift round it, pitch breathing between 45 and 65, and a
   *  gentle pull back mid leg to show the islands going by. Every value eases from where the camera already is. */
  const sail = (leg: LngLat[], before: LngLat[][], air: boolean, z: number, t0play: number, token: number) => new Promise<void>((res) => {
    const m = mapRef.current;
    if (!m) return res();
    if (reduced) { setDrawn([...before, leg]); moveVehicle(leg[leg.length - 1], headingAt(leg, 1).bearing, false); res(); return; }
    const ms = legMs(leg, air), km = lengthKm(leg);
    const lift = air ? Math.min(3, Math.max(0.6, Math.log2(km / 15))) : km > 25 ? 0.6 : 0.25;
    const c0 = m.getCenter();
    let cc: LngLat = [c0.lng, c0.lat], cb = m.getBearing(), cp = m.getPitch(), cz = m.getZoom(), last = performance.now();
    const start = last;
    const step = (now: number) => {
      if (run.current !== token) return res();
      const t = Math.min(1, (now - start) / ms), dt = Math.min(64, now - last);
      last = now;
      const u = ease(t);
      setDrawn([...before, partOf(leg, u)]);
      const h = headingAt(leg, u);
      moveVehicle(h.at, h.bearing, air && t < 1);
      if (!camFree.current) {
        const clock = (now - t0play) / 1000;
        const k = (tau: number) => 1 - Math.exp(-dt / tau);
        cc = [cc[0] + (h.at[0] - cc[0]) * k(260), cc[1] + (h.at[1] - cc[1]) * k(260)];
        const tb = h.bearing - 22 + 14 * Math.sin(clock * 0.45);
        cb += Math.max(-dt * 0.03, Math.min(dt * 0.03, turn(cb, tb) * k(2200)));
        cp += (Math.min(MAX_PITCH, 55 + 10 * Math.sin(clock * 0.6)) - cp) * k(1400);
        cz += (z - lift * Math.sin(Math.PI * t) - cz) * k(900);
        m.jumpTo({ center: cc, zoom: cz, bearing: cb, pitch: cp });
      }
      if (t < 1) raf.current = requestAnimationFrame(step); else res();
    };
    raf.current = requestAnimationFrame(step);
  });
  /** At an anchorage: a short pause with a slight orbit while the day label changes. */
  const anchor = async (token: number) => {
    const m = mapRef.current;
    if (!m || run.current !== token) return;
    if (reduced || camFree.current) return wait(reduced ? 2200 : 1100);
    await cam({ bearing: m.getBearing() + 24, pitch: Math.max(50, Math.min(62, m.getPitch() + 4)) }, 2000);
  };

  const play = useCallback(async (from = next.current) => {
    const m = mapRef.current;
    if (!m) return;
    const token = ++run.current;
    setPlaying(true); setDone(false);
    const z = legZoom();
    const t0 = performance.now();
    if (from <= 1) {
      camFree.current = false;
      // The establishing shot: up to a wide, high view of the region, then ease down to the first stop.
      setDrawn([]); setStops(-1); restVehicle(0);
      const b0 = isRoute ? headingAt(legs[0], 0).bearing - 22 : HOME.bearing;
      if (reduced) await cam({ center: lngLat(stops[0]), zoom: z, pitch: HOME.pitch, bearing: HOME.bearing }, 0);
      else {
        const wide = overviewCam(32, HOME.bearing - 16);
        await cam({ ...wide, zoom: wide.zoom - 0.5 }, 1600, "ease");
        if (run.current !== token) return;
        await cam({ center: lngLat(stops[0]), zoom: z, pitch: 56, bearing: b0 }, 4600, "fly");
      }
      if (run.current !== token) return;
      setStops(0);
      if (stops.length === 1) {
        // One pin (a stay): a slow turn round it.
        if (!reduced && !camFree.current) await new Promise<void>((res) => { m.once("moveend", () => res()); m.easeTo({ bearing: m.getBearing() + 160, pitch: 62, duration: 9000, easing: (t) => t }); });
        if (run.current === token) { setPlaying(false); setDone(true); next.current = 1; }
        return;
      }
      await anchor(token);
      from = 1;
    }
    for (let i = from; i < stops.length; i++) {
      if (run.current !== token) return;
      next.current = i;
      if (isRoute) await sail(legs[i - 1], legs.slice(0, i - 1), isAir(stops[i]), z, t0, token);
      else if (reduced) await cam({ center: lngLat(stops[i]), zoom: z, pitch: HOME.pitch, bearing: HOME.bearing }, 0);
      else await cam({ center: lngLat(stops[i]), zoom: z, pitch: 58, bearing: m.getBearing() + 40 }, LEG_MS, "fly");
      if (run.current !== token) return;
      if (reduced && isRoute) await cam({ center: lngLat(stops[i]), zoom: z, pitch: HOME.pitch, bearing: HOME.bearing }, 0);
      setStops(i);
      await anchor(token);
    }
    if (run.current !== token) return;
    next.current = 1;
    if (isRoute) { setDrawn(legs); restVehicle(stops.length - 1); }
    // Fly out to the whole route, fitted to the routed lanes.
    if (!camFree.current) await cam(overviewCam(50, m.getBearing() - 10), 3200, "fly");
    if (run.current !== token) return;
    setPlaying(false); setDone(true);
  }, [stops, legs, isRoute, reduced, legZoom, setStops, overviewCam]); // eslint-disable-line react-hooks/exhaustive-deps

  const pause = () => {
    run.current++;
    cancelAnimationFrame(raf.current);
    mapRef.current?.stop();
    setPlaying(false);
    // Paused, the vehicle rests at the active day's stop.
    if (activeRef.current >= 0) restVehicle(activeRef.current);
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
    // Ground, sky and fog switch with the view, so nothing still loading shows Paper under or behind the imagery.
    // The imagery covers the whole map, sea included; while a tile loads, land shows the earth tone and sea the deep
    // ocean tone (style.ts viewOps), and only labels, the route, the stops and the vessel draw above it.
    for (const op of viewOps(baseLayers.current, on, box.current?.dataset.relief as "terrain" | "flat" | undefined)) {
      if (!m.getLayer(op.id)) continue;
      if (op.kind === "layout") m.setLayoutProperty(op.id, op.prop as never, op.value as never); else m.setPaintProperty(op.id, op.prop as never, op.value as never);
    }
    m.setSky(on ? SKY_SATELLITE : SKY);
    if (box.current) box.current.dataset.view = on ? "satellite" : "chart";
    setSat(on);
  };

  const s = active >= 0 ? stops[active] : null;
  const label = s ? dayLabel(s) : null;
  return (
    <>
      {routes.length > 1 && !hideRoutePicker && (
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
        <button type="button" className="jw-relief__btn" onClick={() => { pause(); setStops(-1); void overview(!reduced); }} disabled={!ready}>Overview</button>
        {hasSat && (
          <div className="jw-relief__bar-end" role="group" aria-label="Map style">
            <button type="button" className="jw-relief__btn" aria-pressed={!sat} onClick={() => toggleSat(false)}>Terrain</button>
            <button type="button" className="jw-relief__btn" aria-pressed={sat} onClick={() => toggleSat(true)}>Satellite</button>
          </div>
        )}
      </div>
    </>
  );
}
