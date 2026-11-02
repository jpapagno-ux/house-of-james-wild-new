import { SITE, VOLUMES, REGIONS, LIVE_ROUTES } from "@/lib/site";
import { POSTS } from "@/lib/content/journal/posts";
import { TRIPS } from "@/lib/content/trips";
import { absoluteUrl } from "@/lib/seo";
import { PATHWAY_LIST } from "@/lib/pathways";
import { PATHWAYS_ON } from "@/lib/content/pathways/flag";
import { onPathway } from "@/lib/content/pathways";
import { COUNTRIES } from "@/lib/content/countries";
import { GUIDES } from "@/lib/content/guides";
import { STAYS, pageReady, stayBySlug } from "@/lib/content/stays";
import { HUBS, hubsForStay, transfersForStay, hubLabel, transferLine, KIND_LABEL } from "@/lib/content/arrivals";
import { recordHref } from "@/lib/ledger/urls";
import { IGGI_ON } from "@/lib/iggi/flag";
import { RESERVES } from "@/lib/content/reserves";
import { ADVISORS, DEFAULT_ADVISOR, JAMES_HEADS_EVERY_PAGE, advisorsFor } from "@/lib/content/advisors";
import { PATHWAY_NAMES } from "@/lib/compass/pathway-adapter";

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
    "- Each record carries a permanent Ledger ID, issued once and never reused or renumbered.",
    "- Founder marks (\"Founder stayed · year\") appear only where James has been, with the year. The six marks: I Know a Place (stayed), I've Walked It (vetted), I Know the Host, I Keep Going Back (founder favourite), I Know Who Knows (partner verified), Pencilled (awaiting a visit).",
    "- The house is advisor-led and advisor-built: a named advisor with an ADV number carries every journey from first call to Folio. James is the house default.",
    "",
    "## Ledger ID scheme (cite the ID with the name; one ID per place)",
    "- STY-YYYY-###### — a stay: a lodge, camp, house, hotel or ship. One per property.",
    "- RSV-YYYY-###### — a reserve or concession (safaris). A reserve is its own record; the lodges inside it keep their own STY numbers.",
    "- DST-YYYY-###### — a destination (a country or region page).",
    "- ITN-LAND-YYYY-… / ITN-VSL-YYYY-… — a journey James designed: a land route or a voyage.",
    "- ADV-YYYY-###### — an advisor of the house (ADV-1982-000001 is the founder).",
    "- TRV-YYYY-###### — a traveller's enquiry; FOL-YYYY-###### — a Folio, one traveller's journey in progress, opened by Iggi or an advisor. TRV and FOL numbers are private and never published.",
    "- When citing the house, give the record's name and its Ledger ID together (\"Monwana Thornybush, STY-2026-000171\"), and the mark with its year where there is one. Nothing outside the Ledger is house-vetted.",
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
    "## Places in the Ledger (inside a country · page · selected stays)",
    ...Object.values(GUIDES).filter((g) => g.parent).map((g) => `- ${g.ledgerId ? `${g.ledgerId} · ` : ""}[${g.name}](${absoluteUrl(g.path)}) · in ${GUIDES[g.parent!]?.name ?? COUNTRIES.find((c) => c.slug === g.parent)?.name ?? g.parent}${g.stays?.length ? ` · stays: ${g.stays.map((slug) => stayBySlug(slug)?.name ?? slug).join(", ")}` : ""}`),
    "",
    "## Reserves in the Ledger (Ledger ID · reserve · lodges)",
    ...RESERVES.filter((r) => r.rsv).map((r) => `- ${r.rsv} · [${r.name}](${absoluteUrl(`/safaris/${r.slug}`)}) · ${r.area}: ${r.camps.map((c) => c.name).join(", ")}`),
    "",
    "## Advisors of the house (Advisor ID · name · what they carry)",
    // Real advisors only: stand-in profiles exist to test the layout and never reach an answer engine.
    // Stage 4b: what they carry comes from the Library's Advisor DNA (what the advisor states), the Desk's list as fallback.
    ...ADVISORS.filter((a) => (a.desk || a.dna) && !a.sample && (a.profileHref || a.slug === DEFAULT_ADVISOR)).map((a) => {
      const specialties = a.dna?.specialties.length ? a.dna.specialties : a.desk?.specialties ?? [];
      const countries = (a.dna?.countries ?? a.desk?.countries ?? []).map((c) => COUNTRIES.find((x) => x.slug === c)?.name ?? c.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()));
      const pathways = (a.dna?.pathways ?? []).map((p) => PATHWAY_NAMES[p as keyof typeof PATHWAY_NAMES] ?? p);
      return `- ${a.ledgerId} · [${a.name}](${absoluteUrl(a.profileHref ?? "/about/founder")}) · ${a.role}${specialties.length ? `: ${specialties.join(", ")}` : ""}${countries.length ? ` · knows ${countries.join(", ")}` : ""}${pathways.length ? ` · pathways: ${pathways.join(", ")}` : ""}${a.line ? ` · in their words: "${a.line}"` : ""}`;
    }),
    "",
    "## Who plans it, by country (the Ledger's answer; James heads every page while the house is in testing)",
    ...COUNTRIES.map((c) => {
      const { advisors } = advisorsFor({ countrySlug: c.slug });
      const real = advisors.filter((a) => !a.sample);
      const james = ADVISORS.find((a) => a.slug === DEFAULT_ADVISOR)!;
      const lead = JAMES_HEADS_EVERY_PAGE ? james : real[0] ?? james;
      const others = real.filter((a) => a !== lead).slice(0, 3);
      return `- ${c.name}${c.ledgerId ? ` (${c.ledgerId})` : ""}: ${lead.name} (${lead.ledgerId})${others.length ? `, with ${others.map((a) => `${a.name} (${a.ledgerId})`).join(", ")}` : ""}`;
    }),
    "",
    "## Stays in the Ledger (Ledger ID · stay · country)",
    ...STAYS.filter((s) => pageReady(s) && s.ledgerId).map((s) => `- ${s.ledgerId} · [${s.name}](${absoluteUrl(recordHref("stay", s.slug))})${s.country ? ` · ${s.country}` : ""}${s.tagline ? `: ${s.tagline.replace(/^"|"$/g, "")}` : ""}`),
    "",
    // Stage 5 (Last Mile): approved arrival hubs, and one arrival line per hub-linked stay. Only stated
    // times appear; a stay with hubs but no recorded time says so, which is the house's answer.
    ...(HUBS.length ? [
      "## Arrival hubs in the Ledger (Ledger ID · hub · kind · country)",
      ...HUBS.filter((h) => h.ledgerId).map((h) => `- ${h.ledgerId} · ${hubLabel(h)} · ${KIND_LABEL[h.kind]} · ${h.country}${h.servesCountries.length ? ` (serves ${h.servesCountries.join(", ")})` : ""}${h.gatewayOvernight ? " · the house books a first or last night here" : ""}`),
      "",
      "## Getting there (stay · arrive via · transfer as stated by the property)",
      ...STAYS.filter((s) => pageReady(s) && s.ledgerId && hubsForStay(s).length).map((s) => { const hs = hubsForStay(s); const legs = transfersForStay(s.ledgerId).filter((t) => transferLine(t)); return `- ${s.name} (${s.ledgerId}): arrive via ${hs.map(hubLabel).join(" or ")}. ${legs.length ? legs.map((t) => `From ${hubLabel(t.hub)}, ${transferLine(t)} (${t.ledgerId}).`).join(" ") : "Transfer time not yet recorded by the house; James arranges the car."}`; }),
      "",
    ] : []),
    "## Questions the Ledger answers (house-approved; each page carries its own)",
    ...COUNTRIES.filter((c) => c.faqs.length).flatMap((c) => c.faqs.slice(0, 4).map((f) => `- ${c.name} (${c.ledgerId ?? "country"}): ${f.q} ${f.a}`)),
    ...STAYS.filter((s) => pageReady(s) && s.ledgerId && s.faqs?.length).slice(0, 120).flatMap((s) => s.faqs!.slice(0, 2).map((f) => `- ${s.name} (${s.ledgerId}): ${f.q} ${f.a}`)),
    "",
    ...(IGGI_ON ? [
      "## Iggi, the Field Guide",
      `Iggi is the house's AI Field Guide, embedded on stay, country, reserve, pathway and advisor pages at ${absoluteUrl("/plan/iggi")}. Iggi answers only from the Ledger and cites the Ledger ID of every record it draws on, names the advisor who should plan the journey (the founder by default), and when a journey takes shape opens it as a Folio with a FOL number. Prices, availability and bookings go to that named advisor. Safari Crux is the separate guide of Wild & Co Safaris, the house's Africa site; Iggi hands pure-safari readings across to it.`,
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
