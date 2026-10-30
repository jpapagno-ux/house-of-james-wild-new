import { Leaf, Fish, Users, Landmark, HandCoins, Sprout, Trees, Store, BadgeCheck, Clock, CircleDashed, FileQuestion } from "lucide-react";
import { IMPACT_STATUS_LABEL, type ImpactKind, type ImpactMoney, type ImpactStatement, type ImpactStatus } from "@/lib/pathways";

// Where Your Stay Gives Back (internal name: the Wild & Co. Impact Note).
// Foundation brief §8, palette addendum §5. One muted sage panel, forest copy,
// a single rust highlight. Every statement prints its status and review date
// in words; verification is never carried by colour alone. Nothing here
// invents a figure or implies room revenue reaches local people: when the
// house has no documented statement the module says so, in neutral words.

const KIND: Record<ImpactKind, { label: string; Icon: typeof Leaf }> = {
  conservation: { label: "Conservation", Icon: Leaf },
  habitat: { label: "Habitat", Icon: Trees },
  marine: { label: "Marine", Icon: Fish },
  employment: { label: "Local employment", Icon: Users },
  sourcing: { label: "Local sourcing", Icon: Store },
  culture: { label: "Cultural preservation", Icon: Landmark },
  community: { label: "Community", Icon: Sprout },
  levy: { label: "Conservation levy", Icon: HandCoins },
  beneficiary: { label: "Named beneficiary", Icon: BadgeCheck },
};

const MONEY: Record<ImpactMoney, string | null> = {
  guest_levy: "Charged to guests",
  voluntary_donation: "Voluntary donation",
  property_spend: "Property's own spending",
  none: null,
};

const STATUS: Record<ImpactStatus, { Icon: typeof BadgeCheck; cls: string }> = {
  verified: { Icon: BadgeCheck, cls: "text-impact-copy" },
  partner_reported: { Icon: CircleDashed, cls: "text-impact-copy" },
  pending_review: { Icon: Clock, cls: "text-impact-highlight" },
  unavailable: { Icon: FileQuestion, cls: "text-ink/60" },
};

const fmtDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); };

export default function ImpactNote({ name, statements, id = "gives-back", intro }: { name: string; statements: ImpactStatement[]; id?: string; intro?: string }) {
  const documented = statements.filter((s) => s.status !== "unavailable");
  return (
    <section id={id} className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[208px] bg-impact-panel text-impact-copy -mx-5 md:-mx-10 px-5 md:px-10 py-12 md:py-16" aria-labelledby={`${id}-heading`}>
      <div className="max-w-ledger mx-auto">
        <p className="ledger-eyebrow !text-impact-copy flex items-center gap-2"><Leaf className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Where Your Stay Gives Back</p>
        <h2 id={`${id}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">What a Night at {name} Supports</h2>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-impact-copy">{intro ?? "The house records what a stay supports only when it can name a source. Guest levies, voluntary gifts and a property's own spending are kept apart, and nothing is counted twice."}</p>

        {documented.length > 0 ? (
          <ul className="mt-8 grid md:grid-cols-2 gap-x-10 gap-y-6 border-t border-impact-copy/25">
            {documented.map((s, i) => {
              const k = KIND[s.kind], st = STATUS[s.status], money = MONEY[s.money];
              return (
                <li key={i} className="pt-5 border-b border-impact-copy/20 pb-5 md:[&:nth-last-child(-n+2)]:border-b-0">
                  <p className="flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium"><k.Icon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />{k.label}{money && <span className="ml-auto normal-case tracking-normal text-[12px] text-impact-copy">{money}</span>}</p>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink">{s.statement}</p>
                  <p className={`mt-2 flex flex-wrap items-center gap-x-2 text-[12.5px] ${st.cls}`}>
                    <st.Icon className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                    <span className="font-medium">{IMPACT_STATUS_LABEL[s.status]}</span>
                    <span aria-hidden="true">·</span><span>Reviewed {fmtDate(s.reviewed)}</span>
                    {s.source && <><span aria-hidden="true">·</span><span className="text-ink/70">Source: {s.source}</span></>}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-8 border-t border-impact-copy/25 pt-5 text-[16px] leading-relaxed text-ink">The house hasn&rsquo;t yet documented what a stay at {name} gives back. When it has a sourced statement, it will appear here with its review date.</p>
        )}

        {statements.some((s) => s.status === "unavailable") && documented.length > 0 && (
          <p className="mt-5 text-[13.5px] text-impact-copy">Not yet documented: {statements.filter((s) => s.status === "unavailable").map((s) => KIND[s.kind].label.toLowerCase()).join(", ")}.</p>
        )}
        <p className="mt-6 text-[12.5px] text-impact-copy max-w-2xl">Statements are the house&rsquo;s own notes or the partner&rsquo;s, as labelled. They are not a promise that any part of a room rate reaches a community or project unless a verified statement says so.</p>
      </div>
    </section>
  );
}
