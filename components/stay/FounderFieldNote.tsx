import Signature from "@/components/record/Signature";

// A founder note, treated editorially: a short hand-set paragraph with the JW
// signature. Renders nothing when the note is empty; copy is never invented.
export default function FounderFieldNote({ note, where, when, compact = false }: { note: string | null | undefined; where?: string | null; when?: string | null; compact?: boolean }) {
  if (!note?.trim()) return null;
  const meta = [where, when].filter(Boolean).join(" · ");
  return (
    <aside className={`${compact ? "mt-8" : "mt-12 md:mt-16"} border-t ledger-rule pt-6 max-w-2xl`} aria-label="Founder note">
      <p className="ledger-eyebrow ledger-crimson">Founder&rsquo;s note</p>
      <p className={`mt-3 ledger-display ${compact ? "text-[1.35rem]" : "text-[1.6rem] md:text-[1.85rem]"} leading-[1.3] text-wrap-balance`}>{note}</p>
      <div className="mt-3 flex items-center gap-3"><Signature /><span className="text-[13px] ledger-muted">{meta}</span></div>
    </aside>
  );
}
