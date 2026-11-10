import data from "./stay-cloud.json";

// Stay photographs moved into Cloudinary (James, 10 Nov 2026: "Yes, move them in" — every stay gets Cloudinary's
// AI upscale, smart phone crop and quality tuning). The import (scripts/cloudinary/import-stay-photos.mjs, run by the
// Stay photo import workflow) fills stay-cloud.json; until a photograph is in it, its original address is kept.

const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474/";
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/";
type Entry = { id: string; w?: number; h?: number };
const MAP = (data as { map: Record<string, Entry> }).map;

/** The address a photograph was filed under, absolute (the /img/b44 proxy names Base44's own file). */
export const originalOf = (u: string) => (u.startsWith("/img/b44/") ? B44 + u.slice("/img/b44/".length) : u);
const entry = (u: string | null | undefined) => (u ? MAP[originalOf(u)] ?? MAP[u] : undefined);

/** The Cloudinary address of a stay photograph once imported; the original otherwise. */
export function toCloud(u: string): string;
export function toCloud(u: string | null): string | null;
export function toCloud(u: string | null) { if (!u) return u; const e = entry(u); return e ? CLD + e.id : u; }
/** The imported original's width, for the upscale rule (under 1,600px is upscaled in the frames). */
export const cloudWidthById = (() => { const m = new Map<string, number>(); for (const e of Object.values(MAP)) if (e.w) m.set(e.id, e.w); return m; })();
