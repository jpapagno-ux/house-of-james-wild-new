import type { ReactNode } from "react";

// JWC-STYLE-01 primitive. Label and value pairs set as a ledger. Two layouts:
//  "strip": cells side by side under one strong rule (the ledger strip beneath the overview);
//  "rows":  one pair per line with hairlines between (getting there, the plot, a reservation slip).
// Every value is passed in by the page from the existing loaders; this component prints, it never looks up.
export type LedgerItem = {
  label: string;
  value: ReactNode;
  /** Set the value in House Crimson mono: Ledger IDs and key dates only. */
  id?: boolean;
};

type Props = {
  items: LedgerItem[];
  layout?: "strip" | "rows";
  /** A mono heading above the rows. */
  heading?: string;
  /** Number the rows 01, 02, 03 in the margin (rows layout). */
  numbered?: boolean;
  className?: string;
};

const LABEL = "font-mono text-[10px] tracking-[0.22em] uppercase text-stone-text";

export default function LedgerList({ items, layout = "rows", heading, numbered = false, className = "" }: Props) {
  if (layout === "strip") {
    return (
      <dl className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-[color:var(--jw-hairline)] border-t-2 border-t-[color:var(--jw-stone)] ${className}`}>
        {items.map((it, i) => (
          <div key={it.label} className={`px-6 py-5 border-[color:var(--jw-hairline)] ${i ? "border-t sm:border-t-0 lg:border-l" : ""} ${i % 2 ? "sm:border-l" : ""} ${i > 1 ? "sm:max-lg:border-t" : ""}`}>
            <dt className={LABEL}>{it.label}</dt>
            <dd className={it.id ? "ledger-id text-[15px] mt-2" : "font-display text-[21px] leading-snug text-graphite mt-1.5"}>{it.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <div className={`bg-white border border-[color:var(--jw-hairline)] border-t-2 border-t-[color:var(--jw-stone)] px-6 py-5 ${className}`}>
      {heading && <p className={`${LABEL} pb-3`}>{heading}</p>}
      <dl>
        {items.map((it, i) => (
          <div key={it.label} className="grid grid-cols-[auto_5.5rem_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,2fr)_minmax(0,3fr)] gap-x-4 items-baseline py-3 border-t border-[color:var(--jw-hairline)]">
            <span aria-hidden className={`font-mono text-[10.5px] text-house ${numbered ? "w-6" : "w-0 overflow-hidden"}`}>{numbered ? String(i + 1).padStart(2, "0") : ""}</span>
            <dt className={LABEL}>{it.label}</dt>
            <dd className={it.id ? "ledger-id text-[13px] sm:text-[14px] whitespace-nowrap" : "font-display text-[19px] leading-snug text-graphite"}>{it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
