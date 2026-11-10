import { stayBySlug } from "./stays";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";

// A stay's own colour for cards elsewhere on the site (James, 10 Nov 2026: "the stay cards, like the yacht cards ...
// for suggested other stays deep into the stay ... work that into the logic"): its primary pathway's accent and name.
// Nothing filed, nothing returned: the card falls back to the page's own tone.
export function stayTone(slug: string): { accent?: string; pathway?: string } {
  const s = stayBySlug(slug);
  const pid = s && typeof s.pathway === "object" && s.pathway ? (s.pathway as { primary?: string }).primary : null;
  const p = pid ? PATHWAYS[pid as PathwayId] : undefined;
  return p ? { accent: p.accent, pathway: p.name } : {};
}
