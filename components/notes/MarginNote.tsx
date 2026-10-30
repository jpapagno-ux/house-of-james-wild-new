import Signature from "@/components/record/Signature";

// A white slip pinned beside "Why it's in the Ledger": the verdict's opening
// line, initialled, so James's call is read first. Links down to the full note.
export default function MarginNote({ line, where, when }: { line: string; where: string; when: string }) {
  return (
    <a href="#verdict" className="group relative mt-6 ml-auto block max-w-[340px] bg-[#fdfcf8] border border-[#e7e1d4] px-5 pt-5 pb-3 rotate-[1.2deg] shadow-[0_10px_24px_-14px_rgba(60,45,25,0.45)] hover:rotate-0 transition-transform" aria-label={`James's verdict: ${line} Read the full verdict`}>
      <span className="absolute -top-2 right-8 w-10 h-4 bg-[#e9dfcb]/85 rotate-[4deg]" aria-hidden="true" />
      <span className="ledger-eyebrow !text-[9.5px] !text-[#8b3a2e]">The verdict · {where} · {when}</span>
      <span className="block mt-2 ledger-display italic text-[1.02rem] leading-snug text-[#2b2622]">&ldquo;{line}&rdquo;</span>
      <span className="mt-1 flex items-end justify-between">
        <span className="text-[11px] tracking-[0.14em] uppercase text-ink-faint group-hover:text-[#8b3a2e]">Read the verdict ↓</span>
        <Signature className="w-20" />
      </span>
    </a>
  );
}
