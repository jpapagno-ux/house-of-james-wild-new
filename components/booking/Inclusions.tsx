import { Check, Minus, ScrollText } from "lucide-react";

// What's included / not included / cancellation & payment, as native
// <details> drop-downs: no JavaScript, readable by search and answer engines.
export default function Inclusions({ name, included, excluded, policies }: { name: string; included: string[]; excluded: string[]; policies: string[] }) {
  const rows: { title: string; items: string[]; icon: typeof Check; open?: boolean }[] = [
    { title: "What's included", items: included, icon: Check, open: true },
    { title: "What's not included", items: excluded, icon: Minus },
    { title: "Cancellation & payment", items: policies, icon: ScrollText },
  ];
  return (
    <section id="included" className="mt-12 md:mt-16 scroll-mt-32 lg:scroll-mt-56" aria-labelledby="included-heading">
      <p className="ledger-eyebrow ledger-crimson">Before you book</p>
      <h2 id="included-heading" className="ledger-display text-[1.6rem] md:text-3xl mt-2">What a Stay at {name} Includes</h2>
      <div className="mt-6 border-t ledger-rule">
        {rows.map((r) => (
          <details key={r.title} open={r.open} className="group border-b ledger-rule">
            <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span className="ledger-display text-xl">{r.title}</span>
              <span className="ledger-eyebrow group-open:hidden">Show</span><span className="ledger-eyebrow hidden group-open:inline">Hide</span>
            </summary>
            <ul className="pb-5 grid gap-2.5 md:grid-cols-2">
              {r.items.map((it) => <li key={it} className="flex gap-2.5 text-[15.5px]"><r.icon className="w-4 h-4 mt-1 shrink-0 ledger-crimson" strokeWidth={1.5} aria-hidden="true" />{it}</li>)}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
