"use client";

// The MapLibre half of the country atlas. Loaded only by AtlasShell, through next/dynamic (ssr: false), when
// the section nears the viewport or a phone visitor taps the poster. It shares the 3D pilot's engine (boot, base style,
// sea-level elevation) from TerrainMap, so the basemap is the same House Standard restyle.
import { useCallback, useEffect, useRef, useState } from "react";
import { AttributionControl, Map as MLMap, NavigationControl, type GeoJSONSource, type LayerSpecification, type MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ATTRIBUTION, MAPTILER, SKY, SKY_SATELLITE, TILE_CACHE, fontOf, pixelRatioFor, redact, satelliteIndex, satelliteLayer, viewOps } from "./style";
import { baseStyle, boot, demSource } from "./TerrainMap";
import { DIVE_FLAG, boundsOfPoints, pinsOf, signed, type AtlasData, type AtlasEntry, type AtlasLayer, type AtlasPoint } from "./atlas";
import { volumeMark } from "@/lib/volumes";
import { HOUSE } from "@/lib/palette";

const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";
const FLY_MS = 4200;
const fc = (features: GeoJSON.Feature[]): GeoJSON.FeatureCollection => ({ type: "FeatureCollection", features });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pointsFc = (pts: AtlasPoint[]) => fc(pts.map((p) => ({ type: "Feature", properties: { id: p.id, name: p.name }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } })));

/** The layer marks, drawn once on a canvas: a square (parks and World Heritage), a diamond (dive sites), a triangle
 *  (volcanoes). House tones only. */
function icon(shape: "square" | "diamond" | "triangle" | "flag"): { width: number; height: number; data: Uint8Array } | null {
  const s = 40, c = document.createElement("canvas");
  c.width = s; c.height = s;
  const g = c.getContext("2d");
  if (!g) return null;
  if (shape === "flag") {
    // The diver-down flag: a red square with a white diagonal, top left to bottom right, edged in Paper to read on any ground.
    g.fillStyle = HOUSE.paper; g.fillRect(4, 4, 32, 32);
    g.fillStyle = DIVE_FLAG.red; g.fillRect(7, 7, 26, 26);
    g.save(); g.beginPath(); g.rect(7, 7, 26, 26); g.clip();
    g.strokeStyle = DIVE_FLAG.stripe; g.lineWidth = 6; g.beginPath(); g.moveTo(7, 7); g.lineTo(33, 33); g.stroke(); g.restore();
    return { width: s, height: s, data: new Uint8Array(g.getImageData(0, 0, s, s).data.buffer) };
  }
  g.lineJoin = "miter";
  g.beginPath();
  if (shape === "square") g.rect(9, 9, 22, 22);
  if (shape === "diamond") { g.moveTo(20, 5); g.lineTo(35, 20); g.lineTo(20, 35); g.lineTo(5, 20); g.closePath(); }
  if (shape === "triangle") { g.moveTo(20, 5); g.lineTo(36, 34); g.lineTo(4, 34); g.closePath(); }
  g.fillStyle = shape === "square" ? HOUSE.mist : shape === "diamond" ? HOUSE.paper : HOUSE.graphite;
  g.fill();
  g.lineWidth = 4;
  g.strokeStyle = shape === "triangle" ? HOUSE.paper : HOUSE.graphite;
  g.stroke();
  if (shape === "square") { g.fillStyle = HOUSE.graphite; g.fillRect(16, 16, 8, 8); }
  if (shape === "diamond") { g.beginPath(); g.arc(20, 20, 4, 0, Math.PI * 2); g.fillStyle = HOUSE.ink; g.fill(); }
  return { width: s, height: s, data: new Uint8Array(g.getImageData(0, 0, s, s).data.buffer) };
}

type Card = { type: "pins"; ids: string[] } | { type: "point"; layer: Exclude<AtlasLayer, "pins">; point: AtlasPoint };
const LAYER_NAMES: Record<AtlasLayer, string> = { pins: "Stays and voyages", parks: "Parks and UNESCO", dives: "Dive sites", volcanoes: "Volcanoes" };
const LAYER_IDS: Record<AtlasLayer, string[]> = {
  pins: ["jw-routes", "jw-cluster", "jw-cluster-n", "jw-pin", "jw-pin-label"],
  parks: ["jw-parks", "jw-parks-label"],
  dives: ["jw-dives", "jw-dives-label"],
  volcanoes: ["jw-volcanoes", "jw-volcanoes-label"],
};

export type AtlasMapProps = { data: AtlasData; title: string; reduced: boolean; onFail: () => void; initial?: Partial<Record<AtlasLayer, boolean>> };

export default function AtlasMap({ data, title, reduced, onFail, initial }: AtlasMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const run = useRef(0);
  const baseLayers = useRef<{ id: string; type: string; "source-layer"?: string; layout?: Record<string, unknown> }[]>([]);
  const [ready, setReady] = useState(false);
  const [on, setOn] = useState<Record<AtlasLayer, boolean>>({ pins: true, parks: true, dives: false, volcanoes: false, ...initial });
  const [card, setCard] = useState<Card | null>(null);
  const [flying, setFlying] = useState(false);
  const [leg, setLeg] = useState<string | null>(null);
  const [sat, setSat] = useState(false);
  const [hasSat, setHasSat] = useState(false);
  const onRef = useRef(on);
  onRef.current = on;

  const all = [...data.entries, ...data.parks, ...data.dives];
  const home = boundsOfPoints(all.length ? all : [{ lat: -8.5, lng: 115 }, { lat: -0.5, lng: 131 }]);

  useEffect(() => {
    let dead = false, map: MLMap | null = null, warned = false;
    const token = run;
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
        const pins = pinsOf(data.entries);
        style.sources["jw-pins"] = {
          type: "geojson", cluster: true, clusterRadius: 42, clusterMaxZoom: 8,
          data: fc(pins.map((p) => ({ type: "Feature", properties: { key: p.key, color: p.color, n: p.ids.length, label: p.label }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } }))),
        };
        // The voyages' sailed lines (#224's routed sea lanes, from the route files), under every mark and pin.
        style.sources["jw-routes"] = { type: "geojson", data: fc(data.routes.flatMap((r) => r.legs.filter((l) => l.length > 1).map((l) => ({ type: "Feature" as const, properties: { water: r.water }, geometry: { type: "LineString" as const, coordinates: l } })))) };
        style.sources["jw-parks"] = { type: "geojson", data: pointsFc(data.parks) };
        style.sources["jw-dives"] = { type: "geojson", data: pointsFc(data.dives) };
        style.sources["jw-volcanoes"] = { type: "geojson", data: pointsFc(data.volcanoes) };
        const vis = (k: AtlasLayer) => (onRef.current[k] ? "visible" : "none") as "visible" | "none";
        const label = (id: string, source: string, minzoom: number, k: AtlasLayer, offset = 1.2): LayerSpecification => ({ id, type: "symbol", source, minzoom, layout: { visibility: vis(k), "text-field": ["get", "name"], "text-font": font, "text-size": 11.5, "text-offset": [0, offset], "text-anchor": "top", "text-optional": true, "text-max-width": 9 }, paint: { "text-color": HOUSE.graphite, "text-halo-color": HOUSE.paper, "text-halo-width": 1.6 } });
        const sym = (id: string, source: string, img: string, k: AtlasLayer, size: number): LayerSpecification => ({ id, type: "symbol", source, layout: { visibility: vis(k), "icon-image": img, "icon-size": size, "icon-allow-overlap": true, "icon-pitch-alignment": "viewport" } });
        layers.push(
          { id: "jw-routes", type: "line", source: "jw-routes", layout: { visibility: vis("pins"), "line-cap": "round", "line-join": "round" }, paint: { "line-color": volumeMark("voyages"), "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.2, 9, 2.4], "line-opacity": 0.55 } },
          sym("jw-parks", "jw-parks", "jw-square", "parks", 0.5),
          sym("jw-dives", "jw-dives", "jw-flag", "dives", 0.5),
          sym("jw-volcanoes", "jw-volcanoes", "jw-triangle", "volcanoes", 0.5),
          { id: "jw-cluster", type: "circle", source: "jw-pins", filter: ["has", "point_count"], layout: { visibility: vis("pins") }, paint: { "circle-color": HOUSE.graphite, "circle-radius": ["step", ["get", "point_count"], 13, 5, 16, 12, 19], "circle-stroke-color": HOUSE.paper, "circle-stroke-width": 2, "circle-pitch-alignment": "viewport" } },
          { id: "jw-pin", type: "circle", source: "jw-pins", filter: ["!", ["has", "point_count"]], layout: { visibility: vis("pins") }, paint: {
            "circle-color": ["get", "color"], "circle-radius": ["case", [">", ["get", "n"], 1], 8, 6.5],
            "circle-stroke-color": ["case", [">", ["get", "n"], 1], HOUSE.graphite, HOUSE.paper], "circle-stroke-width": 2, "circle-pitch-alignment": "viewport",
          } },
        );
        if (style.glyphs) layers.push(
          { id: "jw-cluster-n", type: "symbol", source: "jw-pins", filter: ["has", "point_count"], layout: { visibility: vis("pins"), "text-field": ["get", "point_count_abbreviated"], "text-font": font, "text-size": 12, "text-allow-overlap": true }, paint: { "text-color": HOUSE.paper } },
          { ...label("jw-pin-label", "jw-pins", 7, "pins"), filter: ["!", ["has", "point_count"]], layout: { ...(label("jw-pin-label", "jw-pins", 7, "pins") as { layout: object }).layout, "text-field": ["get", "label"] } } as LayerSpecification,
          label("jw-parks-label", "jw-parks", 6.5, "parks"),
          label("jw-dives-label", "jw-dives", 8, "dives"),
          label("jw-volcanoes-label", "jw-volcanoes", 6, "volcanoes"),
        );
        style.terrain = { source: "jw-dem", exaggeration: 1.3 };

        map = new MLMap({
          container: box.current, style, bounds: home, fitBoundsOptions: { padding: 36 }, pitch: 35, bearing: 0, maxPitch: 65,
          cooperativeGestures: true, attributionControl: false, maplibreLogo: false, fadeDuration: reduced ? 0 : 300, ...TILE_CACHE,
          pixelRatio: pixelRatioFor(window.devicePixelRatio, window.innerWidth),
          locale: {
            "CooperativeGesturesHandler.WindowsHelpText": "Hold Ctrl and scroll to zoom the map",
            "CooperativeGesturesHandler.MacHelpText": "Hold Cmd and scroll to zoom the map",
            "CooperativeGesturesHandler.MobileHelpText": "Use two fingers to move the map",
          },
        });
        mapRef.current = map;
        // Review hook: ?atlas-debug=1 exposes the map to the screenshot script (window.__jwAtlas); nothing otherwise.
        if (new URLSearchParams(window.location.search).has("atlas-debug")) (window as unknown as { __jwAtlas?: MLMap }).__jwAtlas = map;
        map.on("styleimagemissing", (e) => {
          const shape = e.id === "jw-square" ? "square" : e.id === "jw-flag" ? "flag" : e.id === "jw-triangle" ? "triangle" : null;
          const img = shape && icon(shape);
          if (img && map && !map.hasImage(e.id)) map.addImage(e.id, img, { pixelRatio: 2 });
        });
        map.addControl(new NavigationControl({ visualizePitch: true }), "top-right");
        map.addControl(new AttributionControl({ compact: false }), "bottom-right");
        let demOk = false, demFails = 0;
        map.on("data", (e) => { if ((e as { sourceId?: string; tile?: unknown }).sourceId === "jw-dem" && (e as { tile?: unknown }).tile) demOk = true; });
        map.on("error", (e) => {
          if (!warned) { warned = true; console.warn("[country atlas]", redact(String(e.error?.message ?? "map error"))); }
          const src = (e as { sourceId?: string }).sourceId;
          if (!demOk && (src === "jw-dem" || src === "jw-dem-shade") && ++demFails >= 4 && map?.getTerrain()) {
            map.setTerrain(null);
            if (box.current) box.current.dataset.relief = "flat";
            if (map.getLayer("jw-hillshade")) map.setLayoutProperty("jw-hillshade", "visibility", "none");
          }
        });
        map.on("webglcontextlost", () => onFail());
        map.on("dragstart", () => { run.current++; setFlying(false); setLeg(null); });

        // Clicks: a cluster opens up, a pin or a mark opens its card.
        map.on("click", "jw-cluster", async (e) => {
          const f = e.features?.[0] as MapGeoJSONFeature | undefined;
          if (!f || !map) return;
          const z = await (map.getSource("jw-pins") as GeoJSONSource).getClusterExpansionZoom(f.properties.cluster_id as number);
          map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: z + 0.3, duration: reduced ? 0 : 700 });
        });
        map.on("click", "jw-pin", (e) => {
          const key = e.features?.[0]?.properties.key as string | undefined;
          const p = key ? pins.find((x) => x.key === key) : undefined;
          if (p) setCard({ type: "pins", ids: p.ids });
        });
        const pointClick = (layer: Exclude<AtlasLayer, "pins">, list: AtlasPoint[]) => (e: { features?: MapGeoJSONFeature[] }) => {
          const id = e.features?.[0]?.properties.id as string | undefined;
          const point = list.find((x) => x.id === id);
          if (point) setCard({ type: "point", layer, point });
        };
        map.on("click", "jw-parks", pointClick("parks", data.parks));
        map.on("click", "jw-dives", pointClick("dives", data.dives));
        map.on("click", "jw-volcanoes", pointClick("volcanoes", data.volcanoes));
        for (const id of ["jw-cluster", "jw-pin", "jw-parks", "jw-dives", "jw-volcanoes"]) {
          map.on("mouseenter", id, () => { map!.getCanvas().style.cursor = "pointer"; });
          map.on("mouseleave", id, () => { map!.getCanvas().style.cursor = ""; });
        }
        map.once("load", () => { if (dead) return; if (box.current) box.current.dataset.relief = map?.getTerrain() ? "terrain" : "flat"; setHasSat(!!map?.getLayer("jw-satellite")); setReady(true); });
      } catch (err) {
        console.warn("[country atlas] could not start", redact(String((err as Error)?.message ?? err)));
        if (!dead) onFail();
      }
    })();
    return () => { dead = true; token.current++; map?.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (k: AtlasLayer) => {
    const next = !on[k];
    setOn((o) => ({ ...o, [k]: next }));
    const m = mapRef.current;
    if (m) for (const id of LAYER_IDS[k]) if (m.getLayer(id)) m.setLayoutProperty(id, "visibility", next ? "visible" : "none");
    if (!next && card && (card.type === "pins" ? k === "pins" : card.layer === k)) setCard(null);
  };

  const overview = useCallback((animate: boolean) => {
    mapRef.current?.fitBounds(home, { padding: 36, pitch: 35, bearing: 0, duration: animate ? 1400 : 0 });
  }, [home]);

  const fly = async () => {
    const m = mapRef.current;
    if (!m || !data.flight.length) return;
    const token = ++run.current;
    setFlying(true); setCard(null);
    if (!on.pins) toggle("pins");
    for (let i = 0; i < data.flight.length; i++) {
      const s = data.flight[i];
      if (run.current !== token) return;
      setLeg(s.label);
      // In Komodo and Raja Ampat the camera frames the voyages' own sailed lines there, drawn at full strength.
      const lines = s.water ? data.routes.filter((r) => r.water === s.water).flatMap((r) => r.legs.flat()) : [];
      if (m.getLayer("jw-routes")) m.setPaintProperty("jw-routes", "line-opacity", s.water ? ["case", ["==", ["get", "water"], s.water], 0.95, 0.35] : 0.55);
      const bearing = -20 + i * 18;
      await new Promise<void>((res) => {
        m.once("moveend", () => res());
        if (lines.length > 1) {
          const b = boundsOfPoints(lines.map(([lng, lat]) => ({ lng, lat })));
          const cam = m.cameraForBounds(b, { padding: 60, pitch: 55, bearing });
          const opts = { center: cam?.center ?? [s.lng, s.lat], zoom: Math.min(cam?.zoom ?? s.zoom, 10), pitch: 55, bearing };
          if (reduced) m.jumpTo(opts as never); else m.flyTo({ ...(opts as object), duration: FLY_MS, curve: 1.5, essential: true });
        } else {
          const opts = { center: [s.lng, s.lat] as [number, number], zoom: s.zoom, pitch: 58, bearing };
          if (reduced) m.jumpTo(opts); else m.flyTo({ ...opts, duration: FLY_MS, curve: 1.5, essential: true });
        }
      });
      await wait(reduced ? 2600 : 1400);
    }
    if (run.current !== token) return;
    setLeg(null); setFlying(false);
    if (m.getLayer("jw-routes")) m.setPaintProperty("jw-routes", "line-opacity", 0.55);
    overview(!reduced);
  };
  const stop = () => { run.current++; mapRef.current?.stop(); setFlying(false); setLeg(null); };

  const toggleSat = (v: boolean) => {
    const m = mapRef.current;
    if (!m?.getLayer("jw-satellite")) return;
    // The same no-white-flash switch as TerrainMap (#219, #221): imagery over sea and land, earth and ocean tones under loading tiles.
    for (const op of viewOps(baseLayers.current, v, box.current?.dataset.relief as "terrain" | "flat" | undefined)) {
      if (!m.getLayer(op.id)) continue;
      if (op.kind === "layout") m.setLayoutProperty(op.id, op.prop as never, op.value as never); else m.setPaintProperty(op.id, op.prop as never, op.value as never);
    }
    m.setSky(v ? SKY_SATELLITE : SKY);
    if (box.current) box.current.dataset.view = v ? "satellite" : "chart";
    setSat(v);
  };

  const counts: Record<AtlasLayer, number> = { pins: data.entries.length, parks: data.parks.length, dives: data.dives.length, volcanoes: data.volcanoes.length };
  const rows: AtlasEntry[] = card?.type === "pins" ? card.ids.map((id) => data.entries.find((e) => e.id === id)!).filter(Boolean) : [];
  return (
    <>
      <div className="jw-relief__tabs" role="group" aria-label="Map layers">
        {(Object.keys(LAYER_NAMES) as AtlasLayer[]).filter((k) => k === "pins" || counts[k] > 0 || (k === "volcanoes" && !!data.volcanoSource)).map((k) => (
          <button key={k} type="button" className="jw-relief__btn jw-atlas__chip" aria-pressed={on[k]} onClick={() => toggle(k)} data-layer={k}>
            <span className={`jw-atlas__key jw-atlas__key--${k}`} aria-hidden="true" />{LAYER_NAMES[k]}<span className="jw-atlas__n">{counts[k]}</span>
          </button>
        ))}
      </div>
      <div className="jw-relief__frame jw-atlas__frame" role="region" aria-label={`${title}, a 3D map`}>
        <div ref={box} className="jw-relief__map" style={{ position: "absolute", inset: 0 }} />
        {leg && <p className="jw-relief__day jw-relief__day--solo" aria-live="polite"><span className="jw-relief__day-name">{leg}</span></p>}
        {!ready && <p className="jw-relief__wait">Raising the terrain</p>}
        {card && (
          <div className="jw-atlas__card" role="dialog" aria-label={card.type === "pins" ? rows[0]?.name : card.point.name}>
            <button type="button" className="jw-atlas__close" onClick={() => setCard(null)} aria-label="Close">×</button>
            {card.type === "pins" ? (
              <ul className="jw-atlas__rows">
                {rows.length > 1 && rows[0].start && <li className="jw-atlas__from">Voyages from {rows[0].start}</li>}
                {rows.map((e) => (
                  <li key={e.id} className="jw-atlas__row">
                    {/* A small card photo from the record's own image, loaded only when the card opens. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {e.image && <img src={e.image.url} alt={e.image.alt} loading="lazy" className="jw-atlas__img" />}
                    <div className="jw-atlas__txt">
                      <p className="jw-atlas__name">{e.name}</p>
                      <p className="jw-atlas__sub">{e.sub}</p>
                      {e.mark && <p className="jw-atlas__mark">{e.mark}</p>}
                      {e.jamesNote && <blockquote className="jw-atlas__note"><p>&ldquo;{e.jamesNote.text}&rdquo;</p><footer>{signed(e.jamesNote)}</footer></blockquote>}
                      <a className="jw-atlas__link" href={e.href}>{e.kind === "stay" ? "Open the stay" : "Open the voyage"}</a>
                      {e.ask?.length ? <p className="jw-atlas__ask">{e.ask.map((a, i) => <span key={a.first}>{i > 0 ? " · " : ""}<a href={a.href}>Ask {a.first}</a></span>)}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="jw-atlas__txt">
                <p className="jw-atlas__eyebrow">{LAYER_NAMES[card.layer]}</p>
                <p className="jw-atlas__name">{card.point.name}</p>
                <p className="jw-atlas__sub">{card.point.line}</p>
                {card.point.jamesNote && <blockquote className="jw-atlas__note"><p>&ldquo;{card.point.jamesNote.text}&rdquo;</p><footer>{signed(card.point.jamesNote)}</footer></blockquote>}
                {card.layer === "volcanoes" && <p className="jw-atlas__sub">As of {data.volcanoAsOf}. Check the official status before you go.</p>}
                {card.point.url.startsWith("/") ? <a className="jw-atlas__link" href={card.point.url}>Open the voyage</a> : null}
              </div>
            )}
          </div>
        )}
        {on.volcanoes && (
          <p className="jw-atlas__strip">
            {data.volcanoes.length && data.volcanoAsOf
              ? <>Volcano alert levels from MAGMA Indonesia, as of {data.volcanoAsOf}. Check the official status before you go: </>
              : <>No volcano levels filed yet. Check the official status on MAGMA Indonesia before you go: </>}
            <span>magma.esdm.go.id</span>
          </p>
        )}
      </div>
      <div className="jw-relief__bar">
        {flying
          ? <button type="button" className="jw-relief__btn jw-relief__btn--main" onClick={stop}>Stop</button>
          : data.flight.length > 0 && <button type="button" className="jw-relief__btn jw-relief__btn--main" onClick={() => void fly()} disabled={!ready}>Fly the route</button>}
        <button type="button" className="jw-relief__btn" onClick={() => { stop(); setCard(null); overview(!reduced); }} disabled={!ready}>Overview</button>
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

