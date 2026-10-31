import Link from "next/link";
import { GREEN_INK, VOLUME_HREF, VOLUME_LABEL } from "@/lib/content/advisor-desk";
import { advisorCounts, type Advisor } from "@/lib/content/advisors";
import { InkMark, LedBuilt, entryHref } from "./Desk";

// The Advisor Desk page sections, ported from advisor-profile-sample-*.html
// (James Wild & Co design): the ID card, the ledger sheet in two inks,
// where the advisor sends people, open folios, and how it ties together.

export function DeskIdCard({ a }: { a: Advisor }) {
  const d = a.desk!;
  const c = advisorCounts(a);
  return (
    <div className="ledger-paper p-6 md:p-7 grid md:grid-cols-[1fr_auto] gap-6">
      <div>
        <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>The Advisor Desk · since {d.joined}</p>
        <p className="font-mono text-[13px] tracking-[0.14em] mt-1">{d.adv}</p>
        <p className="ledger-display text-[2rem] leading-tight mt-2">{a.name}</p>
        <p className="text-[15px] ledger-muted mt-1">{a.role.replace(" · stand-in", "")}{d.agency ? ` · ${d.agency}` : ""}{d.base ? ` · ${d.base}` : ""}</p>
        <p className="ledger-display italic text-[19px] mt-4 max-w-xl">&ldquo;{d.line}&rdquo; <span className="ledger-eyebrow not-italic ml-1">— {a.firstName}</span></p>
        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[["Entries carried", c.carried], ["Guests sent", c.guests], ["Folios shared", c.folios], ["Advising since", d.since]].map(([k, v]) => (
            <div key={String(k)}><dt className="ledger-eyebrow">{k}</dt><dd className="ledger-display text-[1.7rem] leading-none mt-1">{v}</dd></div>
          ))}
        </dl>
        {d.specialties.length > 0 && <ul className="mt-5 flex flex-wrap gap-2">{d.specialties.map((s) => <li key={s} className="border ledger-border px-2.5 py-1 text-[14px]">{s}</li>)}</ul>}
      </div>
      <div className="md:w-56 md:border-l ledger-border md:pl-6 flex flex-col gap-3 text-[14px]">
        <p className="ledger-eyebrow">Carries</p>
        <ul className="flex flex-wrap gap-1.5">{d.volumes.map((v) => <li key={v}><Link href={VOLUME_HREF[v]} className="border ledger-border px-2 py-0.5 text-[12.5px] hover:ledger-crimson">{VOLUME_LABEL[v]}</Link></li>)}</ul>
        <p className="ledger-eyebrow mt-2">Languages</p>
        <p>{d.languages.join(" · ")}</p>
        <p className="ledger-eyebrow mt-2">Quote {a.firstName} by number</p>
        <p className="font-mono text-[12px] tracking-[0.1em]">{d.adv}</p>
        {a.sample && <p className="mt-auto pt-3 text-[12px] ledger-muted leading-snug">Stand-in advisor for testing · name, agency, contact details, photograph (AI-generated) and bookings are invented · James&rsquo;s marks and Ledger IDs are real</p>}
      </div>
    </div>
  );
}

export function DeskSheet({ a }: { a: Advisor }) {
  const d = a.desk!;
  const c = advisorCounts(a);
  const pro = a.firstName;
  return (
    <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="sheet-heading">
      <p className="ledger-eyebrow ledger-crimson">01 · {pro}&rsquo;s ledger page</p>
      <h2 id="sheet-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Two inks, one page</h2>
      <p className="mt-3 text-[15.5px] ledger-muted max-w-2xl">Every entry {pro} carries, with James&rsquo;s mark beside {pro}&rsquo;s own. Oxblood is James. Green is the advisor. Dashed grey is pencil.</p>
      <div className="mt-6 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
        <table className="w-full min-w-[820px] text-[14px] border-t ledger-rule">
          <thead>
            <tr className="text-left">
              {["Nº", "Ledger ID", "Stay / voyage", "Place", "James's mark", `${pro}'s mark`, "Guests", "Folios", "Last"].map((h) => <th key={h} className="ledger-eyebrow py-2.5 pr-4 font-medium border-b ledger-border">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {d.entries.map((e, i) => {
              const href = entryHref(e);
              return (
                <tr key={`${e.ledgerId}-${i}`} className="border-b ledger-border align-top">
                  <td className="py-3 pr-4 font-mono text-[12px]">{String(i + 1).padStart(3, "0")}</td>
                  <td className="py-3 pr-4 font-mono text-[12px] whitespace-nowrap">{e.ledgerId}</td>
                  <td className="py-3 pr-4">
                    {href ? <Link href={href} className="ledger-display text-[16px] hover:ledger-crimson">{e.name}</Link> : <span className="ledger-display text-[16px]">{e.name}</span>}
                    {e.note && <span className="block text-[12.5px] ledger-muted leading-snug mt-0.5">{e.note}</span>}
                  </td>
                  <td className="py-3 pr-4 ledger-muted whitespace-nowrap">{e.place}<span className="block ledger-eyebrow !text-[9px] mt-0.5">{VOLUME_LABEL[e.volume]}</span></td>
                  <td className="py-3 pr-4"><InkMark by="james" mark={e.james.mark} when={e.james.year ? String(e.james.year) : undefined} favourite={e.james.favourite} /></td>
                  <td className="py-3 pr-4">{e.theirs ? <InkMark by="advisor" mark={`${pro} ${e.theirs.mark.toLowerCase()}`} when={e.theirs.when} /> : <InkMark by="advisor" mark="Sent guests" />}</td>
                  <td className="py-3 pr-4 font-mono text-[12px]">{e.guests || "—"}</td>
                  <td className="py-3 pr-4 font-mono text-[11px] leading-relaxed">{e.folios.length ? e.folios.map((f) => f.replace("FOL·", "")).join(" · ") : "—"}</td>
                  <td className="py-3 font-mono text-[12px] whitespace-nowrap">{e.last}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 ledger-eyebrow">{c.carried} entries carried · {c.guests} guests sent · {c.folios} folios · folio numbers shortened to their last three digits</p>
    </section>
  );
}

export function DeskSends({ a }: { a: Advisor }) {
  const d = a.desk!;
  const picks = d.entries.filter((e) => e.note).slice(0, 3);
  if (!picks.length) return null;
  return (
    <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="sends-heading">
      <p className="ledger-eyebrow ledger-crimson">02 · Where {a.firstName} sends people</p>
      <h2 id="sends-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Vetted twice, or once and honestly</h2>
      <ul className="mt-8 grid md:grid-cols-3 gap-5">
        {picks.map((e) => {
          const href = entryHref(e);
          return (
            <li key={e.ledgerId} className="bg-paper border ledger-border p-5 flex flex-col gap-3">
              <p className="font-mono text-[11px] tracking-[0.1em] ledger-muted">{e.ledgerId}</p>
              {href ? <Link href={href} className="ledger-display text-[1.5rem] leading-tight hover:ledger-crimson">{e.name}</Link> : <p className="ledger-display text-[1.5rem] leading-tight">{e.name}</p>}
              <p className="text-[14px] ledger-muted -mt-1">{e.place}</p>
              <div className="flex flex-col gap-1.5"><InkMark by="james" mark={e.james.mark} when={e.james.year ? String(e.james.year) : undefined} favourite={e.james.favourite} />{e.theirs && <InkMark by="advisor" mark={`${a.firstName} ${e.theirs.mark.toLowerCase()}`} when={e.theirs.when} />}</div>
              <p className="ledger-display italic text-[17px] leading-snug mt-1">&ldquo;{e.note}&rdquo;</p>
              <p className="ledger-eyebrow mt-auto">— {a.name.split(" ").map((w) => w[0] + ".").join("")}, {d.adv}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function DeskFolios({ a }: { a: Advisor }) {
  const d = a.desk!;
  if (!d.folios.length) return null;
  return (
    <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="folios-heading">
      <p className="ledger-eyebrow ledger-crimson">03 · {a.firstName}&rsquo;s open folios</p>
      <h2 id="folios-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">One trip, one folio, one shelf</h2>
      <ul className="mt-6 divide-y ledger-border border-t border-b ledger-rule">
        {d.folios.map((f) => (
          <li key={f.id} className="py-4 grid sm:grid-cols-[110px_1fr_auto] gap-2 sm:gap-6 items-baseline">
            <span className="font-mono text-[12px] tracking-[0.1em]">{f.id}</span>
            <span><span className="ledger-display text-[18px]">{f.title}</span><span className="block text-[14px] ledger-muted">{f.route}</span></span>
            <span className="ledger-eyebrow" style={{ color: f.status === "Booked" ? GREEN_INK : undefined }}>{f.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DeskTies({ a }: { a: Advisor }) {
  return (
    <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="ties-heading">
      <p className="ledger-eyebrow ledger-crimson">04 · How it ties together</p>
      <h2 id="ties-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">The Ledger, the Advisor&rsquo;s page, the Folio</h2>
      <div className="mt-8"><LedBuilt /></div>
      <ol className="mt-8 grid md:grid-cols-3 gap-5 text-[15px]">
        {[["The Ledger", "Every place James has vetted, with a permanent ID and how it was vetted."], ["The Advisor's page", `${a.firstName}'s entries, marks and guests sent, quoted by number: ${a.desk!.adv}.`], ["The Folio", "A traveller's trip, kept as one folio on their own shelf, built with their advisor and the house."]].map(([t, l], i) => (
          <li key={t} className="ledger-paper p-5"><p className="ledger-eyebrow">0{i + 1}</p><p className="ledger-display text-xl mt-1">{t}</p><p className="mt-2 ledger-muted leading-relaxed">{l}</p></li>
        ))}
      </ol>
    </section>
  );
}
