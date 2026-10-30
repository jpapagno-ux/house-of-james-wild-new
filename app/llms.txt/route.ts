import { SITE, VOLUMES, REGIONS, LIVE_ROUTES } from "@/lib/site";
import { POSTS } from "@/lib/content/journal/posts";
import { TRIPS } from "@/lib/content/trips";
import { absoluteUrl } from "@/lib/seo";

// llms.txt — a plain-language map of the house for AI assistants and answer
// engines: who James is, what the Ledger standard means, where each volume
// lives. Generated from the same config as the navigation.
export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.name} (${SITE.homeOf}) is led by ${SITE.founder.name}, ${SITE.founder.jobTitle}: exploring since ${SITE.exploringSince}, designing journeys since ${SITE.designingSince}, safari advisor since ${SITE.safariSince}. Based in ${SITE.address.locality}, Florida. ${SITE.credentials.map((c) => `${c.label} ${c.value}`).join(", ")}.`,
    "",
    "## The Ledger standard",
    "- Every stay, camp, residence, ship and route is vetted in person before it is filed.",
    "- Each record carries a permanent Ledger ID.",
    "- Founder marks (\"Founder stayed · year\") appear only where James has been, with the year.",
    "",
    "## The five volumes",
    ...VOLUMES.map((v) => `- [${v.label}](${absoluteUrl(v.href)}): ${v.intro}`),
    "",
    "## Destinations",
    ...REGIONS.map((r) => `- [${r.label}](${absoluteUrl(r.href)})`),
    "",
    "## Journal (first-hand stories by James)",
    ...Object.values(POSTS).filter((p) => p.approved).map((p) => `- [${p.seoTitle}](${absoluteUrl(`/journal/${p.slug}`)}): ${p.description}`),
    "",
    "## Routes and voyages James designed",
    ...Object.values(TRIPS).filter((t) => t.copy_approved && LIVE_ROUTES.some((r) => r.path === t.seo.path)).map((t) => `- [${t.seo.title}](${absoluteUrl(t.seo.path)}): ${t.seo.description}`),
    "",
    "## Plan",
    `- [Plan with James](${absoluteUrl("/plan")})`,
    `- Phone: ${SITE.phone.display}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
