"use client";

// Terra Y route map (James, 15 Nov 2026): the house terrain map engine (boot, base style and elevation from
// components/maps/terrain/TerrainMap) on a globe, so the Antarctic interior and 90° South draw true (a flat Mercator
// map stops at 85°). The whole route sits faint; the travelled part draws in signal orange; a chip names the active
// stop with its coordinates; a plane, boat or snow vehicle rides each leg as the day cards scroll by.
// Flown legs are great-circle arcs; the sea leg follows its routed lane round the islands (lib/content/terra-y.ts).
import { useEffect, useRef, useState } from "react";
import { Map as MLMap, Marker, NavigationControl, AttributionControl, type GeoJSONSource, type LngLatLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { baseStyle, boot, demSource } from "@/components/maps/terrain/TerrainMap";
import { arcOf, headingAt, partOf, type LngLat } from "@/components/maps/terrain/geo";
import type { TyStop } from "@/lib/content/terra-y";

const NIGHT = "#0D1B26", SIGNAL = "#D2531F", GLACIER = "#6F9DBA", FROST = "#F6FAFC";
const PLANE = `<svg viewBox="0 0 22 22" width="26" height="26" aria-hidden="true"><path d="M11 1.5 C11.9 1.5 12.3 2.6 12.3 4 V8.6 L20 13 V15 L12.3 12.6 V17.2 L14.6 19 V20.5 L11 19.5 L7.4 20.5 V19 L9.7 17.2 V12.6 L2 15 V13 L9.7 8.6 V4 C9.7 2.6 10.1 1.5 11 1.5 Z" fill="${NIGHT}" stroke="${FROST}" stroke-width="1.1" stroke-linejoin="round"/><circle cx="11" cy="5" r="1.1" fill="${SIGNAL}"/></svg>`;
const BOAT = `<svg viewBox="0 0 22 22" width="24" height="24" aria-hidden="true"><path d="M11 1.5 C14.6 5 15.4 9.5 15 14.5 L14.2 20 H7.8 L7 14.5 C6.6 9.5 7.4 5 11 1.5 Z" fill="${NIGHT}" stroke="${FROST}" stroke-width="1.2" stroke-linejoin="round"/><path d="M11 6 L15.8 7.6 L11 9.2 Z" fill="${SIGNAL}"/></svg>`;
const TRACK = `<svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true"><rect x="5" y="3" width="12" height="16" rx="2" fill="${NIGHT}" stroke="${FROST}" stroke-width="1.2"/><rect x="7.5" y="5.5" width="7" height="5" rx="1" fill="${SIGNAL}"/></svg>`;

const ll = (s: Pick<TyStop, "lat" | "lng">): LngLat => [s.lng, s.lat];
const legOf = (a: TyStop, b: TyStop): LngLat[] => (b.mode === "air" ? arcOf(ll(a), ll(b), 64) : b.path && b.path.length > 1 ? b.path.map((p) => [p[0], p[1]] as LngLat) : [ll(a), ll(b)]);
const fc = (f: GeoJSON.Feature[]): GeoJSON.FeatureCollection => ({ type: "FeatureCollection", features: f });
const lines = (legs: LngLat[][], air: boolean[]) => fc(legs.filter((l) => l.length > 1).map((l, i) => ({ type: "Feature", properties: { air: air[i] }, geometry: { type: "LineString", coordinates: l } })));
const dms = (v: number, pos: string, neg: string) => { const a = Math.abs(v), d = Math.floor(a), m = Math.round((a - d) * 60); return `${d}° ${String(m).padStart(2, "0")}′ ${v >= 0 ? pos : neg}`; };
const coord = (s: TyStop) => `${dms(s.lat, "N", "S")}, ${dms(s.lng, "E", "W")}`;

export type TerraYMapProps = { stops: TyStop[]; active: number; label?: (i: number) => string; onReady?: () => void; onFail?: () => void; reduced?: boolean };

export default function TerraYMap({ stops, active, label, onReady, onFail, reduced = false }: TerraYMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const chip = useRef<Marker | null>(null);
  const ride = useRef<Marker | null>(null);
  const shown = useRef(-2);
  const [ready, setReady] = useState(false);
  const legs = useRef<LngLat[][]>([]);
  legs.current = stops.slice(1).map((s, i) => legOf(stops[i], s));

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        boot();
        const [{ style }, dem] = await Promise.all([baseStyle(), demSource()]);
        if (dead || !box.current) return;
        style.sources["jw-dem"] = dem;
        style.sources["ty-all"] = { type: "geojson", data: lines(legs.current, stops.slice(1).map((s) => s.mode === "air")) };
        style.sources["ty-done"] = { type: "geojson", data: fc([]) };
        style.sources["ty-stops"] = { type: "geojson", data: fc(stops.map((s, i) => ({ type: "Feature", id: i, properties: { name: s.name }, geometry: { type: "Point", coordinates: ll(s) } }))) };
        style.layers.push(
          { id: "ty-all", type: "line", source: "ty-all", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": GLACIER, "line-width": 2, "line-opacity": 0.7, "line-dasharray": [1.5, 2] } },
          { id: "ty-done-glow", type: "line", source: "ty-done", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": SIGNAL, "line-width": 9, "line-opacity": 0.18, "line-blur": 4 } },
          { id: "ty-done", type: "line", source: "ty-done", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": SIGNAL, "line-width": 3 } },
          { id: "ty-stop", type: "circle", source: "ty-stops", paint: { "circle-radius": ["case", ["boolean", ["feature-state", "active"], false], 7, 4.5], "circle-color": ["case", ["boolean", ["feature-state", "active"], false], SIGNAL, FROST], "circle-stroke-color": NIGHT, "circle-stroke-width": 2 } },
        );
        const m = new MLMap({ container: box.current, style, center: ll(stops[0]) as LngLatLike, zoom: 1.6, pitch: 0, maxPitch: 65, attributionControl: false, cooperativeGestures: true, fadeDuration: 0 });
        map.current = m;
        m.addControl(new NavigationControl({ showCompass: true, visualizePitch: true }), "bottom-right");
        m.addControl(new AttributionControl({ compact: true }), "bottom-left");
        m.on("style.load", () => { try { m.setProjection({ type: "globe" }); } catch { /* flat fallback */ } });
        m.on("load", () => {
          if (dead) return;
          try { m.setTerrain({ source: "jw-dem", exaggeration: 1.35 }); } catch { /* no relief, still a map */ }
          try { m.setSky({ "sky-color": "#0D1B26", "horizon-color": "#B9D3E1", "fog-color": "#EAF2F6", "sky-horizon-blend": 0.5, "horizon-fog-blend": 0.6, "fog-ground-blend": 0.4, "atmosphere-blend": 0.9 }); } catch { /* older engine */ }
          const all: [number, number][] = stops.map((s) => [s.lng, s.lat]);
          const lats = all.map((p) => p[1]), lngs = all.map((p) => p[0]);
          if (Math.min(...lats) < -80) m.jumpTo({ center: [10, -62], zoom: 1.5 });
          else m.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 60, duration: 0 });
          setReady(true); onReady?.();
        });
        m.on("error", (e) => { if (!m.loaded() && String(e?.error?.message ?? "").includes("WebGL")) onFail?.(); });
      } catch { onFail?.(); }
    })();
    return () => { dead = true; map.current?.remove(); map.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = map.current;
    if (!m || !ready || active === shown.current) return;
    const from = shown.current, to = active;
    shown.current = to;
    stops.forEach((_, i) => m.setFeatureState({ source: "ty-stops", id: i }, { active: i === to }));
    const done = (src: LngLat[][]) => (m.getSource("ty-done") as GeoJSONSource | undefined)?.setData(lines(src, src.map(() => false)));
    chip.current?.remove(); chip.current = null;
    if (to < 0) {
      done([]); ride.current?.remove(); ride.current = null;
      m.flyTo({ center: [stops[0].lng, Math.min(...stops.map((s) => s.lat)) < -80 ? -62 : stops[0].lat], zoom: 1.6, pitch: 0, bearing: 0, duration: reduced ? 0 : 2400 });
      return;
    }
    const s = stops[to];
    const icon = (k: TyStop["mode"]) => (k === "sea" ? BOAT : k === "ground" ? TRACK : PLANE);
    const showChip = () => {
      const el = document.createElement("div");
      el.className = "ty-chip";
      el.innerHTML = `<span class="ty-chip__n">${label?.(to) ?? String(to + 1).padStart(2, "0")}</span><span class="ty-chip__b"><b>${s.name}</b><i>${coord(s)}</i></span>`;
      chip.current = new Marker({ element: el, anchor: "bottom", offset: [0, -14] }).setLngLat(ll(s)).addTo(m);
    };
    // Sail or fly the leg in from the previous stop (one step forward); any jump lands straight on the stop.
    const step = to === from + 1 && to > 0 && !reduced;
    const prior = legs.current.slice(0, Math.max(0, to - (step ? 1 : 0)));
    done(prior);
    if (!ride.current) { const el = document.createElement("div"); el.className = "ty-ride"; ride.current = new Marker({ element: el, rotationAlignment: "map" }).setLngLat(ll(s)).addTo(m); }
    const r = ride.current, el = r.getElement();
    el.innerHTML = icon(s.mode);
    const zoom = s.zoom ?? 7;
    if (step) {
      const leg = legs.current[to - 1];
      const t0 = performance.now(), dur = s.mode === "air" ? 3200 : 2600;
      m.flyTo({ center: ll(s) as LngLatLike, zoom: Math.min(zoom, 6.5), pitch: 50, bearing: headingAt(leg, 0.5).bearing * 0.25, duration: dur, essential: true });
      const tick = (now: number) => {
        if (shown.current !== to) return;
        const t = Math.min(1, (now - t0) / dur), e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        const h = headingAt(leg, e);
        r.setLngLat(h.at).setRotation(h.bearing);
        done([...prior, partOf(leg, e)]);
        if (t < 1) requestAnimationFrame(tick);
        else { done(legs.current.slice(0, to)); m.easeTo({ zoom, pitch: 58, duration: 1400 }); showChip(); }
      };
      requestAnimationFrame(tick);
    } else {
      done(legs.current.slice(0, to));
      r.setLngLat(ll(s)).setRotation(to > 0 ? headingAt(legs.current[to - 1], 1).bearing : 0);
      m.flyTo({ center: ll(s) as LngLatLike, zoom, pitch: 58, bearing: 0, duration: reduced ? 0 : 2600, essential: true });
      showChip();
    }
  }, [active, ready, stops, label, reduced]);

  return <div ref={box} className="absolute inset-0" />;
}
