import data from "./upscaled.json";

// Full-screen photographs that were too small for the hero, re-hosted on
// Cloudinary and delivered through its AI upscaler (e_upscale) and auto
// improve (e_improve). Anything below 900px wide is dropped from hero slides
// instead: there isn't enough picture to rescue.
// Capped at 1200px before the 4x upscale so the result stays inside the plan's 25-megapixel limit.
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg/";
const MAP = data.map as Record<string, string>;
const DROP = new Set(data.drop as string[]);

export const sharpen = (url: string) => (MAP[url] ? CLD + MAP[url] : url);
export const tooSmall = (url: string) => DROP.has(url);
/** Hero slides: drop the unrescuable (keeping at least two), sharpen the rest. */
export function heroReady<T extends { url: string }>(list: T[]): T[] {
  const kept = list.filter((x) => !tooSmall(x.url));
  return (kept.length >= 2 ? kept : list).map((x) => ({ ...x, url: sharpen(x.url) }));
}
