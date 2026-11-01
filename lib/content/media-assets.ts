// Media Assets: house-wide image references, exported from the Airtable editorial
// layer (scripts/export-editorial-layer.mjs → media-assets.json). The pixels stay in
// Cloudinary (one library, cloud jhlnq5h5); this file only knows each placement's
// public_id, role, alt text, credit and rights. Nothing here is hard-coded per page:
// a page asks for an entity's assets by Ledger ID and role.
//
// Rights: a page shows an asset only when its rights are in the allowed set. The
// default is "approved" (the house rule); a noindex preview may pass to_verify
// explicitly so a prototype can be looked at before the owner's media kit clears.
import data from "./media-assets.json";

export type MediaRights = "approved" | "hold" | "to_verify";
export type MediaRole = "ef_hero" | "ef_why_still" | "ef_place" | "ef_story_arrival" | "ef_story_interior" | "ef_story_human" | "ef_story_night" | "ef_experience" | "room" | "hero" | "gallery" | "full_frame";
export type MediaAsset = {
  mediaId: string; entityId: string; entityType: string; publicId: string; role: MediaRole | string;
  caption?: string; alt: string; credit: string; creditUrl?: string; photographer?: string;
  rights: MediaRights; licence?: string; orientation: "landscape" | "portrait" | "square";
  crop?: string; sort: number; active: boolean; width?: number; height?: number;
};

export const MEDIA_ASSETS: MediaAsset[] = (data.assets as MediaAsset[]);

export function assetsFor(entityId: string | null | undefined, role?: string, allow: MediaRights[] = ["approved"]): MediaAsset[] {
  if (!entityId) return [];
  return MEDIA_ASSETS
    .filter((a) => a.entityId === entityId && a.active && allow.includes(a.rights) && (!role || a.role === role))
    .sort((a, b) => a.sort - b.sort);
}
export const assetFor = (entityId: string | null | undefined, role: string, allow?: MediaRights[]) => assetsFor(entityId, role, allow)[0] ?? null;

/* Cloudinary delivery ------------------------------------------------------------ */
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
// Sources under 1200px wide go through the house upscaler before the crop, as lib/content/sharpen.ts does for full frames.
const UPSCALE = "c_limit,w_1200,h_1200/e_upscale/e_improve";

export type Ratio = "21:9" | "16:10" | "3:2" | "4:5" | "1:1" | "4:3";
/** The crop the photography plan assigns each role (docs: Exceptional Few report, F). */
export const ROLE_RATIO: Record<string, { desktop: Ratio; mobile: Ratio }> = {
  ef_hero: { desktop: "21:9", mobile: "4:5" },
  ef_why_still: { desktop: "16:10", mobile: "16:10" },
  ef_place: { desktop: "3:2", mobile: "3:2" },
  ef_story_arrival: { desktop: "16:10", mobile: "16:10" },
  ef_story_interior: { desktop: "3:2", mobile: "4:5" },
  ef_story_human: { desktop: "4:5", mobile: "4:5" },
  ef_story_night: { desktop: "4:5", mobile: "4:5" },
  ef_experience: { desktop: "3:2", mobile: "3:2" },
  room: { desktop: "16:10", mobile: "16:10" },
};

/** A delivery URL for one asset: optional ratio crop, width cap, auto format and quality. */
export function mediaUrl(a: MediaAsset, opts: { ratio?: Ratio; width?: number; gravity?: string } = {}): string {
  const small = (a.width ?? 0) < 1200;
  const g = opts.gravity ?? a.crop ?? "g_auto";
  const parts = [
    ...(small ? [UPSCALE] : []),
    ...(opts.ratio ? [`c_fill,${g.startsWith("g_") ? g : `g_${g}`},ar_${opts.ratio.replace(":", ":")}`] : []),
    `c_limit,w_${opts.width ?? 2560}`,
    "q_auto:good",
    "f_auto",
  ];
  return `${CLD}/${parts.join("/")}/${a.publicId}`;
}

/** Hero and mobile hero from the same asset: never a second upload. */
export const heroUrls = (a: MediaAsset) => ({ desktop: mediaUrl(a, { ratio: "21:9", width: 2560 }), mobile: mediaUrl(a, { ratio: "4:5", width: 1080 }) });
