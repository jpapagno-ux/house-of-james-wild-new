import { notFound } from "next/navigation";
import { requireAdvisor } from "@/lib/platform/advisor";
import { ledgerRow } from "@/lib/platform/advisor-ledger-data";
import { RATE_LABEL, rateLine } from "@/lib/platform/advisor-ledger";
import { stayBySlug, STAYS } from "@/lib/content/stays";
import { PRICED } from "@/lib/content/priced-stays";
import { MORE } from "@/lib/content/rate-cards";
import { BASIS_LABEL } from "@/lib/rate-card";
import { isPast } from "@/lib/dates";
import { hostCard } from "@/lib/content/host-cards";
import { advisorsFor } from "@/lib/content/advisors";
import { niceDate } from "@/lib/platform/labels";
import PathwayChip from "@/components/advisor/PathwayChip";
import { DataList, PageHead, Section, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "The Ledger" };

// One Ledger record as an advisor needs it: how it is priced, the offers running, what the stay
// includes, the host, the founder's testimony and who else in the house knows it. Read-only: quotes
// and holds come with the next step.
export default async function AdvisorLedgerRecord({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) notFound();
  const a = await requireAdvisor(`/advisor/ledger/${slug}`);
  const r = ledgerRow(a.advisor.slug, slug);
  if (!r) notFound();
  const s = stayBySlug(slug) ?? STAYS.find((x) => x.slug === slug)!;
  const priced = s.engine ? PRICED[slug] : undefined;
  const page = MORE.pages[`stay:${slug}`];
  const years = page ? Object.entries(MORE.properties[page.property]?.years ?? {}).filter(([, y]) => !isPast(y.validTo)) : [];
  const host = await hostCard(`stay:${slug}`, { optional: true }).catch(() => null);
  const others = r.ledgerId ? advisorsFor({ ledgerId: r.ledgerId, countrySlug: r.countrySlug, regionSlug: r.regionSlug }).advisors.filter((x) => x.slug !== a.advisor.slug).slice(0, 6) : [];
  const facts: [string, React.ReactNode][] = [
    ["Country", r.country ?? "Not filed"],
    ...(s.bestMonths ? [["Best months", s.bestMonths] as [string, React.ReactNode]] : []),
    ...(s.airport ? [["Fly into", s.airport] as [string, React.ReactNode]] : []),
    ...(s.airportDirections ? [["Getting there", s.airportDirections] as [string, React.ReactNode]] : []),
    ...(r.volumes.length ? [["Volumes", r.volumes.join(", ")] as [string, React.ReactNode]] : []),
  ];
  return (
    <>
      <PageHead eyebrow={`The Ledger · ${r.ledgerId ?? "no Ledger ID"}`} title={r.name} lead={r.tagline ?? undefined}
        actions={<span className="flex flex-wrap gap-4"><TextLink href="/advisor/ledger">The Ledger</TextLink>{r.href && <TextLink href={r.href}>The public page</TextLink>}</span>} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {r.pathways.map((p) => <PathwayChip key={p.id} {...p} />)}
        <StatusPill label={RATE_LABEL[r.rate.kind]} tone={r.rate.kind === "request" ? "neutral" : "good"} />
        {r.mine && <StatusPill label={`You: ${r.mine}`} tone="progress" />}
      </div>

      {(r.founder || s.founderNote) && (
        <blockquote className="mt-8 max-w-3xl border-l-2 border-[#8B2525] bg-white px-5 py-4">
          {r.founder && <p className="text-[15.5px]">{r.founder}</p>}
          {s.founderNote && <p className="mt-2 font-serif italic text-[17px]">&ldquo;{s.founderNote}&rdquo;</p>}
        </blockquote>
      )}

      <Section title="How it is priced">
        <p className="text-[15px]">{rateLine(r.rate)}.</p>
        {r.rate.kind === "live" && r.href && <p className="mt-2 text-[14px]"><TextLink href={`${r.href}#live-rates`}>See live rates on the public page</TextLink></p>}
        {years.map(([year, y]) => (
          <div key={year} className="mt-4 overflow-x-auto">
            <p className="ledger-eyebrow">{year}: {niceDate(y.validFrom)} to {niceDate(y.validTo)}</p>
            <table className="mt-2 w-full min-w-[560px] text-[14px]">
              <thead><tr className="text-left border-b ledger-rule"><th scope="col" className="py-2 pr-3 font-normal ledger-eyebrow">Room</th><th scope="col" className="py-2 pr-3 font-normal ledger-eyebrow">Basis</th><th scope="col" className="py-2 pr-3 font-normal ledger-eyebrow text-right">From</th><th scope="col" className="py-2 font-normal ledger-eyebrow">Note</th></tr></thead>
              <tbody>
                {y.rows.filter((row) => !page?.rows || page.rows.includes(row.key)).map((row) => (
                  <tr key={row.key} className="border-b ledger-border align-top">
                    <td className="py-2 pr-3"><span className="font-medium">{row.name}</span><span className="block text-[12.5px] ledger-muted">{row.units}</span></td>
                    <td className="py-2 pr-3">{BASIS_LABEL[row.basis]}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">US${Math.round(row.usd).toLocaleString("en-US")}</td>
                    <td className="py-2 text-[13px] ledger-muted">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <p className="mt-3 text-[13px] ledger-muted">The house&rsquo;s rates. The house confirms the exact price and availability with the property before anything is held or charged. Your share is shown on each booking.</p>
      </Section>

      <Section title={r.offers.length ? "Offers running" : "Offers"}>
        {r.offers.length ? (
          <ul className="grid gap-3">
            {r.offers.map((o, i) => (
              <li key={i} className="bg-white border ledger-border p-4">
                <p className="ledger-eyebrow">{o.program}</p>
                <p className="mt-1 text-[16px] font-medium">{o.headline}</p>
                <p className="text-[14px]">{o.travel}{o.ends ? ` · ends ${niceDate(o.ends)}` : ""}</p>
                {o.conditions && <p className="mt-1 text-[13.5px] ledger-muted">{o.conditions}</p>}
              </li>
            ))}
          </ul>
        ) : <p className="text-[15px] ledger-muted">No offer running today.</p>}
      </Section>

      {priced && (
        <Section title="What the stay includes">
          <div className="grid gap-6 md:grid-cols-2">
            <div><p className="ledger-eyebrow">Included</p><ul className="mt-2 grid gap-1 text-[14.5px] list-disc pl-5">{priced.included.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><p className="ledger-eyebrow">Not included</p><ul className="mt-2 grid gap-1 text-[14.5px] list-disc pl-5">{priced.excluded.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
          {priced.policies.length > 0 && <ul className="mt-4 grid gap-1 text-[13.5px] ledger-muted">{priced.policies.map((x) => <li key={x}>{x}</li>)}</ul>}
        </Section>
      )}

      {(s.rooms.paras.length > 0 || s.rooms.items.length > 0) && (
        <Section title="Rooms">
          {s.rooms.paras.map((p, i) => <p key={i} className="mt-2 first:mt-0 text-[15px] leading-relaxed max-w-3xl">{p}</p>)}
          {s.rooms.items.length > 0 && <ul className="mt-3 grid gap-1 text-[14.5px] list-disc pl-5">{s.rooms.items.map((x) => <li key={x}>{x}</li>)}</ul>}
        </Section>
      )}

      <Section title="On file"><DataList rows={facts} /></Section>

      <Section title="People">
        <DataList rows={[
          ["Host", host?.host ? `${host.host.name}, ${host.host.role}` : "No host on the desk for this page yet"],
          ["In the house", others.length ? others.map((x) => x.name).join(", ") : "No one else in the house has marked it yet"],
          ["You", r.mine ? `${r.mine} (from your approved Advisor DNA)` : "Not marked. Add it in your Advisor DNA if you have been."],
        ]} />
      </Section>
    </>
  );
}
