import type { ReactNode } from "react";

// JWC-STYLE-01 primitive. The bar that stays at the foot of the window: the record's name and one line beneath on
// the left, quiet links and the one main action on the right. Ink ground (the darkest house tone), so the house
// buttons inside it turn to their white-keyline form on their own. The price line and the action are slots: the page
// passes the figure from live rate data and the existing booking button. "inline" sets it in the flow of the page
// (the preview route, or a page that wants it between sections) instead of fixing it to the window.
// flex-nowrap on the action group is the house's own escape from the phone rule that makes a main button full width,
// so the name keeps its room beside the button on a narrow screen.
type Props = {
  title: string;
  /** One mono line under the name: the from-rate and any live offer, passed in from live data. */
  note?: ReactNode;
  /** Quiet links (the editorial line): Save, Speak with an advisor. */
  links?: ReactNode;
  /** The one main action. */
  action?: ReactNode;
  mode?: "fixed" | "inline";
  label?: string;
  className?: string;
};

export default function StickyBar({ title, note, links, action, mode = "fixed", label = "Reserve", className = "" }: Props) {
  return (
    <aside aria-label={label} data-journal-sticky className={`on-dark bg-ink-deep text-white ${mode === "fixed" ? "fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]" : ""} ${className}`}>
      <div className="max-w-ledger mx-auto px-5 md:px-10 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-[20px] leading-tight truncate">{title}</p>
          {note && <p className="font-mono text-[10.5px] tracking-[0.12em] text-white/75 mt-0.5 truncate">{note}</p>}
        </div>
        <div className="flex flex-nowrap items-center gap-6 shrink-0">
          {links && <div className="hidden md:flex items-center gap-6">{links}</div>}
          {action}
        </div>
      </div>
    </aside>
  );
}
