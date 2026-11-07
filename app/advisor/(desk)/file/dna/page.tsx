import { requireAdvisorFile } from "@/lib/platform/advisor";
import { dnaProposals, publishedDna } from "@/lib/platform/advisor-file-data";
import { fromLibrary, type DnaInput } from "@/lib/platform/advisor-dna";
import { niceDate } from "@/lib/platform/labels";
import { ADVISORS } from "@/lib/content/advisors";
import { DESTINATION_COUNTRIES } from "@/lib/content/destination-countries";
import { PATHWAY_LIST } from "@/lib/pathways";
import staysData from "@/lib/content/stays.json";
import { DnaForm, type DnaOptions } from "@/components/advisor/DnaForm";
import { PageHead, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Your Advisor DNA" };

// Part five of the file. Starts from what the advisor last sent, else what the house approved, else the
// Library's copy the website shows today, so nobody types from nothing.
export default async function AdvisorDna() {
  const a = await requireAdvisorFile("/advisor/file/dna");
  const [pub, props] = await Promise.all([publishedDna(a.sb, a.advisor.id), dnaProposals(a.sb, a.advisor.id)]);
  const latest = props[0];
  const waiting = latest?.status === "submitted";
  const returned = latest?.status === "returned" ? latest : null;
  const library = ADVISORS.find((x) => x.slug === a.advisor.slug && !x.sample)?.dna;
  const initial: DnaInput = latest && latest.status !== "approved" ? latest.payload : pub ? { ...pub } : fromLibrary(library);
  const options: DnaOptions = {
    pathways: PATHWAY_LIST.map((p) => ({ id: p.id, name: p.name, setting: p.setting })),
    countries: [...DESTINATION_COUNTRIES].sort((x, y) => x.regionName.localeCompare(y.regionName) || x.name.localeCompare(y.name)).map((c) => ({ slug: c.slug, name: c.name, region: c.region, regionName: c.regionName })),
    stays: (staysData as { stays: { ledgerId: string | null; name: string; countrySlug: string | null }[] }).stays
      .filter((s): s is { ledgerId: string; name: string; countrySlug: string } => !!s.ledgerId && !!s.countrySlug)
      .map((s) => ({ ledgerId: s.ledgerId, name: s.name, countrySlug: s.countrySlug }))
      .sort((x, y) => x.name.localeCompare(y.name)),
  };
  return (
    <>
      <PageHead eyebrow="My file · Step 5" title="Your Advisor DNA"
        lead="What the website knows about you: the journeys you plan, the countries you know first-hand and the stays you have slept at. Approved by the house, it puts your card on those pages."
        actions={<TextLink href="/advisor/file">My file</TextLink>} />
      <div className="mt-6 max-w-3xl grid gap-3">
        {waiting && <p className="border-l-2 border-[#2E2B28] bg-white px-5 py-3 text-[15px]">Sent {niceDate(latest.created_at)}. The house is reviewing it; you can still change it and send again.</p>}
        {returned && <p className="border-l-2 border-[#8B2525] bg-white px-5 py-3 text-[15px]"><span className="font-medium">Returned by the house:</span> {returned.house_note}</p>}
        {pub && !waiting && !returned && <p className="border-l-2 border-[#11705A] bg-white px-5 py-3 text-[15px]">Approved {niceDate(pub.approved_at)}. {a.advisor.status === "active" ? "This is what the website shows." : "It shows on the website once your desk is active."} Change anything and send it again.</p>}
        {!pub && !latest && library && <p className="text-[14.5px] ledger-muted">We have started it from what the house holds about you today. Check every line; send it once it is true.</p>}
      </div>
      <div className="mt-8 max-w-3xl"><DnaForm initial={initial} options={options} waiting={waiting} /></div>
    </>
  );
}
