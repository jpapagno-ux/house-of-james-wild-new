import Image from "next/image";
import type { ReactNode } from "react";
import type { DialogueLine } from "@/lib/content/dialogue";
import { DIALOGUE_ASSETS } from "@/lib/content/dialogue";

// One line from Iggi, as the brief draws him: a restrained monochrome icon
// and an occasional bubble, never a chat window. Renders only an approved
// line (the register gate is upstream: dialogueLine() returns null for
// anything else). The origin label is printed with the words, always.

const ORIGIN: Record<NonNullable<DialogueLine["origin"]>, string> = { ledger: "From the Ledger", james: "James's field note", founder: "Founder record", partner: "Partner-supplied", check: "Needs a current check" };
const CLOUD = "https://res.cloudinary.com/jhlnq5h5/image/upload";

export function iggiAssetUrl(id: string | undefined, w = 96) {
  const a = DIALOGUE_ASSETS.find((x) => x.id === id && x.status === "approved");
  if (!a) return null;
  if (a.src.startsWith("http") || a.src.startsWith("/")) return a.src;
  return `${CLOUD}/w_${w * 2},q_auto,f_auto/${a.src}.png`;
}

export default function IggiLine({ line, children, className = "" }: { line: DialogueLine | null; children?: ReactNode; className?: string }) {
  if (!line || line.approval.status !== "approved" || line.character !== "iggi") return null;
  const src = iggiAssetUrl(line.asset);
  return (
    <aside className={`flex items-start gap-4 ${className}`} aria-label="Iggi">
      {src ? <Image src={src} alt="" width={48} height={48} className="w-12 h-12 shrink-0 select-none" /> : <span aria-hidden="true" className="w-12 h-12 shrink-0 rounded-full border ledger-border ledger-display italic flex items-center justify-center text-[15px]">Ig</span>}
      <div className="relative border ledger-border bg-paper-card px-4 py-3 max-w-xl">
        <span aria-hidden="true" className="absolute -left-[7px] top-4 w-3 h-3 rotate-45 border-l border-b ledger-border bg-paper-card" />
        <p className="ledger-eyebrow mb-1">Iggi · {line.origin ? ORIGIN[line.origin] : "From the Ledger"}</p>
        <p className="text-[15px] leading-relaxed">{line.text}{children ? <> {children}</> : null}</p>
      </div>
    </aside>
  );
}
