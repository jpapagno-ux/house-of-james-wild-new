// Five hero photographs per record (scripts/hero-sets.py → hero-sets.json).
import sets from "./hero-sets.json";

const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474/";
// Base44 serves AVIF as octet-stream, so those go through the /img/b44 proxy.
const fix = (u: string) => (u.startsWith(B44) && /\.avif$/i.test(u) ? `/img/b44/${u.slice(B44.length)}` : u);

export function heroSlides(key: string, name: string, where?: string | null) {
  const list = ((sets as Record<string, string[]>)[key] ?? []).map(fix);
  return list.map((url, i) => ({ url, alt: `${name}${where ? `, ${where}` : ""}${i ? `: photograph ${i + 1} of ${list.length}` : ""}` }));
}
