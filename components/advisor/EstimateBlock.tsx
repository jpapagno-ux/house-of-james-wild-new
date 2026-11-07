import type { Estimate } from "@/lib/platform/advisor-estimate";

// The desk's estimate on a quote request, exactly as stored when the advisor sent it. Never a price.
export default function EstimateBlock({ e }: { e: Estimate }) {
  if (!e) return <p className="text-[14.5px] ledger-muted">No house rate card for this stay yet: the house prices it for these dates.</p>;
  return (
    <div className="grid gap-2">
      {e.options.length > 0 ? (
        <ul className="grid gap-1.5">
          {e.options.map((o) => (
            <li key={o.label} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b ledger-border py-1.5">
              <span className="text-[14.5px]">{o.label}<span className="block text-[12.5px] ledger-muted">{o.lines.join("; ")}</span></span>
              <span className="tabular-nums text-[15px] font-medium">about US${Math.round(o.usd).toLocaleString("en-US")}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-[13px] ledger-muted">Estimate from {e.source}. {e.note}</p>
    </div>
  );
}
