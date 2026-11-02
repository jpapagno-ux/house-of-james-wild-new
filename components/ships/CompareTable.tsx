import Link from "next/link";
import { volumeInk } from "@/lib/volumes";
import type { CompareTable as T } from "@/lib/content/ships/categories";

// The category pages' comparison table (James, 2 Nov 2026): a real table on wide screens, one card
// per ship on phones (the voyages audit's rule: tables turn into cards on mobile, nothing scrolls
// sideways). Every cell is a published fact or says "Not published".
export default function CompareTable({ t, id }: { t: T; id: string }) {
  const ink = volumeInk("voyages");
  const rest = t.columns.slice(1);
  return (
    <section className="mt-10 md:mt-12" aria-labelledby={id}>
      <h2 id={id} className="ledger-display text-[1.6rem] md:text-3xl">{t.caption}</h2>
      <div className="hidden md:block mt-5 border-t-[3px]" style={{ borderTopColor: ink }}>
        <table className="w-full text-left text-[14.5px] border-collapse">
          <thead>
            <tr className="border-b ledger-rule">
              <th scope="col" className="ledger-eyebrow py-3 pr-4 font-normal">Ship</th>
              {t.columns.map((c) => <th key={c} scope="col" className="ledger-eyebrow py-3 pr-4 font-normal">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r) => (
              <tr key={r.slug} className="border-b ledger-rule align-top">
                <th scope="row" className="py-3 pr-4 font-normal"><Link href={r.href} className="ledger-display text-[18px] hover:underline underline-offset-4">{r.name}</Link></th>
                {r.cells.map((c, i) => <td key={i} className={`py-3 pr-4 ${c === "Not published" ? "ledger-muted" : ""}`}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="md:hidden mt-4 flex flex-col gap-3">
        {t.rows.map((r) => (
          <li key={r.slug} className="ledger-paper border ledger-border p-4" style={{ borderTopColor: ink, borderTopWidth: 3 }}>
            <Link href={r.href} className="ledger-display text-[20px] leading-snug hover:underline underline-offset-4">{r.name}</Link>
            <p className="text-[12.5px] ledger-muted">{r.cells[0]}</p>
            <dl className="mt-2 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[14px]">
              {rest.map((c, i) => r.cells[i + 1] ? <div key={c} className="contents"><dt className="ledger-eyebrow pt-0.5">{c}</dt><dd className={r.cells[i + 1] === "Not published" ? "ledger-muted" : ""}>{r.cells[i + 1]}</dd></div> : null)}
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12.5px] ledger-muted max-w-3xl">{t.note}</p>
    </section>
  );
}
