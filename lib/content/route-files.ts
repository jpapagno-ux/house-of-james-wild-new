import fs from "node:fs";
import path from "node:path";

// Route files (public/maps/routes/<id>.json) for a route or voyage page. The page slug can carry the
// vessel or operator ahead of the route id (aliikai-10-day-raja-ampat-north,
// antarctica21-polar-circle-air-cruise); the file is filed under the route id alone.
const DIR = () => path.join(process.cwd(), "public/maps/routes");

/** The route file's id for a page path, or null when no route file is on file. */
export function routeIdFor(href: string): string | null {
  const last = href.split("/").filter(Boolean).pop() ?? "";
  for (const id of [last, last.replace(/^(aliikai|antarctica21)-/, "")]) if (fs.existsSync(path.join(DIR(), `${id}.json`))) return id;
  return null;
}

/** The first stop on a route (a voyage pins at its first port). */
export function routeStart(href: string): { lat: number; lng: number; name: string } | null {
  const id = routeIdFor(href);
  if (!id) return null;
  const r = JSON.parse(fs.readFileSync(path.join(DIR(), `${id}.json`), "utf8")) as { stops?: { name: string; lat: number; lng: number }[] };
  const s = r.stops?.[0];
  return s ? { lat: s.lat, lng: s.lng, name: s.name.split(" — ")[0] } : null;
}
