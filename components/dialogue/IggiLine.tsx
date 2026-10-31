import type { ReactNode } from "react";
import type { DialogueLine } from "@/lib/content/dialogue";
import IggiMark from "@/components/iggi/IggiMark";

// One line from Iggi, as the brief draws him: a restrained monochrome icon
// and an occasional bubble, never a chat window. The icon is the house's
// IggiMark (the chameleon with the compass tail, chosen by James 30 Oct 2026),
// drawn in ink so Iggi never introduces a colour the page doesn't have (James,
// 31 Oct 2026: no stray green). Renders only an approved line (the register
// gate is upstream: dialogueLine() returns null for anything else). The origin
// label is printed with the words, always.

const ORIGIN: Record<NonNullable<DialogueLine["origin"]>, string> = { ledger: "From the Ledger", james: "James's field note", founder: "Founder record", partner: "Partner-supplied", check: "Needs a current check" };
export default function IggiLine({ line, children, className = "" }: { line: DialogueLine | null; children?: ReactNode; className?: string }) {
  if (!line || line.approval.status !== "approved" || line.character !== "iggi") return null;
  return (
    <aside className={`flex items-start gap-4 ${className}`} aria-label="Iggi">
      <span className="text-ink shrink-0 mt-0.5"><IggiMark size={44} decorative /></span>
      <div className="relative border ledger-border bg-paper-card px-4 py-3 max-w-xl">
        <span aria-hidden="true" className="absolute -left-[7px] top-4 w-3 h-3 rotate-45 border-l border-b ledger-border bg-paper-card" />
        <p className="ledger-eyebrow mb-1">Iggi · {line.origin ? ORIGIN[line.origin] : "From the Ledger"}</p>
        <p className="text-[15px] leading-relaxed">{line.text}{children ? <> {children}</> : null}</p>
      </div>
    </aside>
  );
}
