import { SITE, VOLUMES, REGIONS, LIVE_ROUTES } from "@/lib/site";
import { POSTS } from "@/lib/content/journal/posts";
import { TRIPS } from "@/lib/content/trips";
import { absoluteUrl } from "@/lib/seo";
import { PATHWAY_LIST } from "@/lib/pathways";
import { PATHWAYS_ON } from "@/lib/content/pathways/flag";
import { onPathway } from "@/lib/content/pathways";
import { COUNTRIES } from "@/lib/content/countries";
import { STAYS, pageReady } from "@/lib/content/stays";
import { recordHref } from "@/lib/ledger/urls";
import { IGGI_ON } from "@/lib/iggi/flag";

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
    "## The six volumes",
    ...VOLUMES.map((v) => `- [${v.label}](${absoluteUrl(v.href)}): ${v.intro}`),
    "",
    ...(PATHWAYS_ON ? [
      "## Wild Pathways (eight editorial collections across the volumes)",
      "A pathway is a collection, not a category: it gathers vetted stays by setting and intention. One stay can sit on several pathways and keeps a single Ledger ID and page.",
      ...PATHWAY_LIST.map((p) => `- [${p.name}](${absoluteUrl(`/pathways/${p.key}`)}) (${p.id}, ${p.setting.toLowerCase()}): ${p.line} ${onPathway(p.id).length} approved entries.`),
      "- Where Your Stay Gives Back: each stay page states what the house has on record about conservation, community, employment and levies, with the statement's source, review date and status. Nothing is printed without a source.",
      "",
    ] : []),
    "## Destinations",
    ...REGIONS.map((r) => `- [${r.label}](${absoluteUrl(r.href)})`),
    "",
    // Stage 3 (Iggi Intelligence Core): the records answer engines can cite —
    // every country and page-ready stay with its permanent Ledger ID, then the
    // house's own approved questions, in its own words. Same source as the
    // FAQPage markup on each page and as what Iggi answers from.
    "## Countries in the Ledger (Ledger ID · page)",
    ...COUNTRIES.filter((c) => c.ledgerId).map((c) => `- ${c.ledgerId} · [${c.name}](${absoluteUrl(`/destinations/${c.region}/${c.slug}`)})${c.bestShort ? `: ${c.bestShort}` : ""}`),
    "",
    "## Stays in the Ledger (Ledger ID · stay · country)",
    ...STAYS.filter((s) => pageReady(s) && s.ledgerId).map((s) => `- ${s.ledgerId} · [${s.name}](${absoluteUrl(recordHref("stay", s.slug))})${s.country ? ` · ${s.country}` : ""}${s.tagline ? `: ${s.tagline.replace(/^"|"$/g, "")}` : ""}`),
    "",
    "## Questions the Ledger answers (house-approved; each page carries its own)",
    ...COUNTRIES.filter((c) => c.faqs.length).flatMap((c) => c.faqs.slice(0, 4).map((f) => `- ${c.name} (${c.ledgerId ?? "country"}): ${f.q} ${f.a}`)),
    ...STAYS.filter((s) => pageReady(s) && s.ledgerId && s.faqs?.length).slice(0, 120).flatMap((s) => s.faqs!.slice(0, 2).map((f) => `- ${s.name} (${s.ledgerId}): ${f.q} ${f.a}`)),
    "",
    ...(IGGI_ON ? [
      "## Iggi, the Field Guide",
      `Iggi is the house's AI Field Guide, embedded on stay, country, reserve, pathway and advisor pages at ${absoluteUrl("/plan/iggi")}. Iggi answers only from the Ledger and cites the Ledger ID of every record it draws on; prices, availability and bookings go to a named advisor.`,
      "",
    ] : []),
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
