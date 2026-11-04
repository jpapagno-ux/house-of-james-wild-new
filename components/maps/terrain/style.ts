// The basemap for the 3D terrain pilot, restyled in code to the House Standard (lib/palette.ts TERRAIN).
// No MapLibre runtime import here (types only), so plain Node tests can read it.
//
// Sources (no key, no cost): OpenFreeMap vector tiles (OpenMapTiles schema, OpenStreetMap data) and the AWS open
// elevation tiles (Terrarium, from Mapzen's Joerd). With NEXT_PUBLIC_MAPTILER_KEY set (Vercel env only), MapTiler's
// outdoor-v2 base, terrain-rgb-v2 and satellite-v2 take over; the restyle is the same because both use the
// OpenMapTiles schema.
import type { LayerSpecification, SkySpecification, StyleSpecification } from "maplibre-gl";
import { TERRAIN } from "../../../lib/palette.ts";

export const OFM_STYLE = "https://tiles.openfreemap.org/styles/positron";
export const AWS_TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
export const MAPTILER = {
  style: (key: string) => `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${encodeURIComponent(key)}`,
  terrain: (key: string) => `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${encodeURIComponent(key)}`,
  satellite: (key: string) => `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${encodeURIComponent(key)}`,
};
/** The protocol the pilot reads elevation through, to keep the sea flat (see geo.ts clampSeabed). */
export const DEM_PROTOCOL = "jwdem";

export const ATTRIBUTION = {
  osm: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">&copy; OpenStreetMap contributors</a>',
  ofm: '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">&copy; OpenMapTiles</a>',
  aws: 'Terrain: <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener">Mapzen, AWS Terrain Tiles</a>',
  maptiler: '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">&copy; MapTiler</a>',
};

export const SKY: SkySpecification = {
  "sky-color": TERRAIN.sky, "horizon-color": TERRAIN.horizon, "fog-color": TERRAIN.fog,
  "sky-horizon-blend": 0.6, "horizon-fog-blend": 0.7, "fog-ground-blend": 0.35, "atmosphere-blend": 0,
};

/** Satellite view (fix for the white tile flash, 3 Nov 2026): while satellite tiles load, the map shows its background,
 *  and at pitch the sky and fog fill the horizon. In Satellite those are a muted earth tone close to the imagery (forest,
 *  reef and deep water read dark), not Paper, so a tile still loading never flashes white. Chart keeps Stone Mist. */
export const SATELLITE = { ground: "#4B5042", sea: "#1F3A44", sky: "#C7CBC4", horizon: "#9EA49A", fog: "#5F6556" };
export const SKY_SATELLITE: SkySpecification = {
  "sky-color": SATELLITE.sky, "horizon-color": SATELLITE.horizon, "fog-color": SATELLITE.fog,
  "sky-horizon-blend": 0.6, "horizon-fog-blend": 0.7, "fog-ground-blend": 0.35, "atmosphere-blend": 0,
};
/** The background colour for each view: Stone Mist under the chart, the earth tone under satellite. */
export const groundOf = (satellite: boolean) => (satellite ? SATELLITE.ground : TERRAIN.ground);
/** The satellite raster layer: no fade-in from the background, so tiles appear at once over the earth tone, and the
 *  parent tile stays drawn while its children load (MapLibre's default, kept by a long cross-fade of 0). */
export const satelliteLayer = (): LayerSpecification => ({
  id: "jw-satellite", type: "raster", source: "jw-satellite", layout: { visibility: "none" },
  paint: { "raster-fade-duration": 0, "raster-resampling": "linear" },
});
/** Where the satellite layer sits (the pale-placeholder fix, 3 Nov 2026): above every fill and line of the base style,
 *  so the imagery covers the whole map, sea included, and only the base style's labels, then our own route, stops and
 *  pins, draw over it. Returns the index to insert at: the first symbol layer of the base style. */
export const satelliteIndex = (layers: { type: string }[]) => { const i = layers.findIndex((l) => l.type === "symbol"); return i < 0 ? layers.length : i; };

type Lyr = { id: string; type: string; "source-layer"?: string; layout?: Record<string, unknown> };
export type ViewOp = { id: string; kind: "layout" | "paint"; prop: string; value: unknown };
/** The changes that switch the base style between Chart and Satellite. Under satellite, while a tile is still loading,
 *  land shows the earth tone (the background) and sea a deep ocean tone (the vector water), never the chart's pale
 *  fills; the chart's other fills, its hillshade and its lines step aside. Back in Chart every layer returns to the
 *  visibility it had in the built style (`base`). */
export function viewOps(base: Lyr[], on: boolean, relief: "terrain" | "flat" | undefined): ViewOp[] {
  const ops: ViewOp[] = [];
  const vis = (l: Lyr) => (l.layout?.visibility === "none" ? "none" : "visible");
  for (const l of base) {
    if (l.id === "jw-satellite") ops.push({ id: l.id, kind: "layout", prop: "visibility", value: on ? "visible" : "none" });
    else if (l.id === "jw-hillshade") ops.push({ id: l.id, kind: "layout", prop: "visibility", value: on || relief === "flat" ? "none" : vis(l) });
    else if (l.id.startsWith("jw-")) continue; // our own route, stops and pins stay as they are
    else if (l.type === "background") ops.push({ id: l.id, kind: "paint", prop: "background-color", value: groundOf(on) });
    else if (l.type === "fill" && l["source-layer"] === "water") {
      ops.push({ id: l.id, kind: "paint", prop: "fill-color", value: on ? SATELLITE.sea : TERRAIN.water });
      ops.push({ id: l.id, kind: "paint", prop: "fill-outline-color", value: on ? SATELLITE.sea : TERRAIN.water });
    } else if (l.type === "fill" || l.type === "line" || l.type === "fill-extrusion") ops.push({ id: l.id, kind: "layout", prop: "visibility", value: on ? "none" : vis(l) });
  }
  return ops;
}

/** Tile cache and canvas: a larger cache (more zoom levels kept) so panning back and toggling views reuse tiles instead
 *  of refetching them, and the pixel ratio capped (1.5 on phones, 2 elsewhere) so fewer, faster tiles are drawn. */
export const TILE_CACHE = { maxTileCacheSize: 1024, maxTileCacheZoomLevels: 8 };
export const pixelRatioFor = (dpr: number, width: number) => Math.min(dpr || 1, width < 640 ? 1.5 : 2);

/** Hillshade in warm graphite shadows and paper highlights. */
export const hillshadeLayer = (source: string): LayerSpecification => ({
  id: "jw-hillshade", type: "hillshade", source,
  paint: {
    "hillshade-shadow-color": TERRAIN.shadow, "hillshade-highlight-color": TERRAIN.highlight, "hillshade-accent-color": TERRAIN.accent,
    "hillshade-exaggeration": 0.55, "hillshade-illumination-direction": 315,
  },
});

type AnyLayer = LayerSpecification & { "source-layer"?: string; layout?: Record<string, unknown>; paint?: Record<string, unknown> };
const hide = (l: AnyLayer): AnyLayer => ({ ...l, layout: { ...(l.layout ?? {}), visibility: "none" } } as AnyLayer);
const paint = (l: AnyLayer, p: Record<string, unknown>): AnyLayer => ({ ...l, paint: { ...(l.paint ?? {}), ...p } } as AnyLayer);

const HIDE_SOURCE_LAYERS = new Set(["building", "housenumber", "poi", "aerodrome_label", "aeroway", "transportation_name", "park_label"]);
const MAJOR_ROAD = /motorway|trunk|primary|major/;
const MINOR_PLACE = /village|suburb|neighbo|hamlet|quarter|locality|dwelling/;

/** One layer of an OpenMapTiles style (OpenFreeMap positron or liberty, MapTiler outdoor) in the house's tones. */
export function houseLayer(layer: LayerSpecification): AnyLayer {
  const l = layer as AnyLayer, sl = l["source-layer"] ?? "", id = l.id.toLowerCase();
  if (l.type === "background") return paint(l, { "background-color": TERRAIN.ground });
  if (l.type === "fill-extrusion" || l.type === "raster" || l.type === "hillshade" || l.type === "color-relief") return hide(l);
  if (HIDE_SOURCE_LAYERS.has(sl)) return hide(l);
  if (l.type === "fill") {
    if (sl === "water") return paint(l, { "fill-color": TERRAIN.water, "fill-opacity": 1, "fill-outline-color": TERRAIN.water });
    if (sl === "landcover" || sl === "landuse" || sl === "park") {
      if (/ice|glacier/.test(id)) return paint(l, { "fill-color": TERRAIN.halo, "fill-opacity": 0.6 });
      return paint(l, { "fill-color": sl === "park" ? TERRAIN.park : TERRAIN.landcover, "fill-opacity": 0.55, "fill-outline-color": "rgba(0,0,0,0)" });
    }
    return paint(l, { "fill-color": TERRAIN.ground });
  }
  if (l.type === "line") {
    if (sl === "waterway") return paint(l, { "line-color": TERRAIN.waterLine });
    if (sl === "water") return paint(l, { "line-color": TERRAIN.waterLine });
    if (sl === "boundary") return paint(l, { "line-color": TERRAIN.boundary, "line-opacity": 0.7 });
    if (sl === "transportation") return MAJOR_ROAD.test(id) && !/casing|tunnel|bridge|rail/.test(id) ? paint(l, { "line-color": TERRAIN.road, "line-opacity": 0.6 }) : hide(l);
    return hide(l);
  }
  if (l.type === "symbol") {
    const halo = { "text-halo-color": TERRAIN.halo, "text-halo-width": 1.4, "text-halo-blur": 0.4 };
    const layout = { ...(l.layout ?? {}) } as Record<string, unknown>;
    delete layout["icon-image"];
    const s = { ...l, layout } as AnyLayer;
    if (sl === "water_name") return paint(s, { "text-color": TERRAIN.labelSoft, ...halo });
    if (sl === "mountain_peak") return paint(s, { "text-color": TERRAIN.labelSoft, ...halo });
    if (sl === "place") return MINOR_PLACE.test(id) ? hide(l) : paint(s, { "text-color": TERRAIN.label, ...halo });
    return hide(l);
  }
  if (l.type === "circle" || l.type === "heatmap") return hide(l);
  return l;
}

/** Restyle a fetched base style: house tones, sparse labels, the hillshade under the first line or label. */
export function houseStyle(base: StyleSpecification, opts: { demSource: string; attribution: string }): StyleSpecification {
  const layers = base.layers.map(houseLayer);
  const at = layers.findIndex((l) => l.type === "line" || l.type === "symbol");
  layers.splice(at < 0 ? layers.length : at, 0, hillshadeLayer(opts.demSource));
  const sources = Object.fromEntries(Object.entries(base.sources).map(([k, s]) => [k, s.type === "vector" ? { ...s, attribution: opts.attribution } : s]));
  return { ...base, sources, layers: layers as LayerSpecification[], sky: SKY };
}

/** A plain ground (no vector tiles) when the base style cannot be fetched: terrain and hillshade still show. */
export const groundStyle = (demSource: string): StyleSpecification => ({
  version: 8, sources: {}, sky: SKY,
  layers: [{ id: "background", type: "background", paint: { "background-color": TERRAIN.ground } }, hillshadeLayer(demSource)],
});

/** First font stack any symbol layer of the style uses, for our own stop labels. */
export function fontOf(style: StyleSpecification): string[] {
  for (const l of style.layers) {
    const f = (l as AnyLayer).layout?.["text-font"];
    if (Array.isArray(f) && f.every((x) => typeof x === "string")) return f as string[];
  }
  return ["Noto Sans Regular"];
}

/** Keep a MapTiler key out of anything the pilot logs. */
export const redact = (s: string) => s.replace(/([?&]key=)[^&#\s"']+/gi, "$1***");
