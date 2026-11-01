import Link from "next/link";
import { requireDesk } from "@/lib/platform/membership";
import { health, portfolio, requests, submissions } from "@/lib/platform/queries";
import { portfolioScore, type HealthCheck } from "@/lib/platform/completeness";
import { REQUEST_STATUS, REQUEST_TYPE, SUBMISSION_STATUS, niceDate } from "@/lib/platform/labels";
import { VOLUME_STYLES, volumeInk, type VolumeKey } from "@/lib/volumes";
import { CheckLine, Empty, HealthRing, PageHead, Panel, Section, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Overview" };

const ORDER: VolumeKey[] = ["stays", "safaris", "gatherings", "voyages", "overland", "europe"];

/** One line per check across the whole portfolio: the worst state, and how many need a look. */
function roll(all: HealthCheck[][]): HealthCheck[] {
  const byKey = new Map<string, HealthCheck[]>();
  all.flat().forEach((c) => byKey.set(c.key, [...(byKey.get(c.key) ?? []), c]));
  const rank = { ok: 0, attention: 1, missing: 2 } as const;
  return [...byKey.values()].map((cs) => {
    const worst = cs.reduce((a, b) => (rank[b.state] > rank[a.state] ? b : a));
    const need = cs.filter((c) => c.state !== "ok").length;
    const detail = need === 0 ? (cs.length === 1 ? cs[0].detail : `In order across ${cs.length} entries`) : cs.length === 1 ? worst.detail : `${need} of ${cs.length} entries: ${worst.detail.charAt(0).toLowerCase()}${worst.detail.slice(1)}`;
    return { ...worst, detail };
  }).sort((a, b) => rank[b.state] - rank[a.state]);
}

export default async function Overview() {
  const desk = await requireDesk("/partner");
  const [entities, open, subs] = await Promise.all([portfolio(desk), requests(desk, { open: true }), submissions(desk, { limit: 20 })]);
  const h = await health(desk, entities);
  const score = portfolioScore(entities.map((e) => h.get(e.id)?.score ?? 0));
  const checks = roll(entities.map((e) => h.get(e.id)?.checks ?? []));
  const awaiting = subs.filter((s) => ["submitted", "in_review", "changes_requested"].includes(s.status)).slice(0, 5);
  const name = new Map(entities.map((e) => [e.id, e.name]));
  const byVol = ORDER.map((k) => ({ k, list: entities.filter((e) => (e.volume_key ?? "stays") === k) })).filter((g) => g.list.length);
  const rates = entities.map((e) => ({ e, c: h.get(e.id)?.checks.find((c) => c.key === "rates") })).filter((x) => x.c && x.c.state !== "ok");
  const viewing = desk.house && !desk.membership;

  return (
    <div>
      <PageHead eyebrow={viewing ? "Overview · viewing as James Wild & Co" : "Overview"} title={desk.org.name}
        lead={<>What the house holds for you, what it has asked for, and what is waiting for review. Nothing you send changes the website until James Wild &amp; Co approves it.</>} />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Panel>
          <p className="ledger-eyebrow">Portfolio Health</p>
          <div className="mt-3 flex items-center gap-6">
            <HealthRing score={score} />
            <p className="text-[14.5px] leading-relaxed ledger-muted">Across {entities.length} {entities.length === 1 ? "entry" : "entries"} in the Ledger. Built only from what the house holds on record.</p>
          </div>
          <ul className="mt-4 divide-y divide-ink/10">{checks.map((c) => <CheckLine key={c.key} state={c.state} label={c.label} detail={c.detail} />)}</ul>
        </Panel>

        <Panel>
          <div className="flex items-baseline justify-between"><p className="ledger-eyebrow">Requests from the house</p><TextLink href="/partner/requests">All requests</TextLink></div>
          {open.length === 0 ? <p className="mt-4 text-[15px]">Nothing outstanding. Thank you.</p> : (
            <ul className="mt-3 divide-y divide-ink/10">
              {open.slice(0, 6).map((r) => (
                <li key={r.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/partner/requests/${r.id}`} className="font-medium hover:underline underline-offset-2">{r.requested_item}</Link>
                    <p className="text-[13px] ledger-muted truncate">{REQUEST_TYPE[r.request_type]} · {r.property_id ? name.get(r.property_id) ?? "—" : desk.org.name}{r.due_date ? ` · due ${niceDate(r.due_date)}` : ""}</p>
                  </div>
                  <StatusPill {...REQUEST_STATUS[r.status]} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Section title="My Portfolio" aside={<TextLink href="/partner/portfolio">Open portfolio</TextLink>}>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {byVol.map(({ k, list }) => (
            <li key={k} className="border ledger-border p-4" style={{ borderTop: `3px solid ${volumeInk(k)}` }}>
              <p className="ledger-eyebrow" style={{ color: volumeInk(k) }}>Vol. {VOLUME_STYLES[k].roman} · {k === "europe" ? "The Other Europe" : VOLUME_STYLES[k].label}</p>
              <p className="ledger-display text-[1.6rem] leading-none mt-2">{list.length}</p>
              <p className="text-[13.5px] ledger-muted mt-1 line-clamp-2">{list.slice(0, 4).map((e) => e.name).join(" · ")}{list.length > 4 ? " …" : ""}</p>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
        <Section title="Updates awaiting review" aside={<TextLink href="/partner/submissions">All updates</TextLink>}>
          {awaiting.length === 0 ? <Empty title="Nothing waiting">Answer a request or propose a change from any entry in your portfolio.</Empty> : (
            <ul className="divide-y divide-ink/10 border-y ledger-border">
              {awaiting.map((s) => (
                <li key={s.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0"><p className="font-medium truncate">{s.title}</p><p className="text-[13px] ledger-muted">{s.reference} · {s.property_id ? name.get(s.property_id) ?? "—" : desk.org.name} · {niceDate(s.submitted_at ?? s.created_at)}</p></div>
                  <StatusPill {...SUBMISSION_STATUS[s.status]} />
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="Rates & Offers">
          {rates.length === 0 ? <p className="text-[15px]">Rates on file cover next year for every entry.</p> : (
            <ul className="divide-y divide-ink/10 border-y ledger-border">
              {rates.slice(0, 6).map(({ e, c }) => (
                <li key={e.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0"><Link href={`/partner/portfolio/${e.legacy_cms_id}`} className="font-medium hover:underline underline-offset-2">{c!.label} · {e.name}</Link><p className="text-[13px] ledger-muted">{c!.detail}</p></div>
                  <StatusPill label={c!.state === "missing" ? "Missing" : "Check"} tone="attention" />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[13px] ledger-muted">Send rate sheets in reply to the house&rsquo;s rate requests. Entering rates on the desk arrives in Stage 2.</p>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
        <Section title="Media & Reels"><Empty title="The Media Library opens soon">Until then, answer media requests with links to originals. Vertical 9:16 and landscape 16:9, 8–20 seconds, no logos.</Empty></Section>
        <Section title="Partner Dispatch"><Empty title="No dispatches yet">The house&rsquo;s notes to partners will appear here.</Empty></Section>
      </div>

      <aside className="mt-14 border-y ledger-rule py-8 grid gap-4 md:grid-cols-[auto_1fr] md:gap-10 items-start" aria-label="James' Field Note">
        <p className="ledger-eyebrow ledger-crimson md:pt-2">James&rsquo; Field Note</p>
        <div>
          <p className="ledger-hand text-[1.8rem] md:text-[2.1rem] leading-tight">&ldquo;Show me what changes at sunrise, not another empty lobby. If you want us to understand the property, show the road in, the people, the weather and what happens beyond the room.&rdquo;</p>
          <p className="ledger-eyebrow mt-3">James Wild · Founder &amp; Chief Expedition Officer</p>
        </div>
      </aside>
    </div>
  );
}
