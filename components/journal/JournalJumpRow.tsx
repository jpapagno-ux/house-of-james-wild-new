import Link from "next/link";

// JWC-STYLE-01, Stage 2. The jump row ("On this page", with Why first) and the advisor line beneath it.
export default function JournalJumpRow({ items, advisor = true }: { items: [string, string][]; advisor?: boolean }) {
  return (
    <div className="bg-white border-b border-[color:var(--jw-hairline)]">
      <nav aria-label="On this page" data-journal-jump className="max-w-ledger mx-auto px-5 md:px-10 flex items-center gap-6 overflow-x-auto py-3.5 [scrollbar-width:none]">
        <span className="shrink-0 font-mono text-[9.5px] tracking-[0.24em] uppercase text-stone-text">On this page</span>
        {items.map(([label, id]) => (
          <a key={id} href={`#${id}`} className="shrink-0 font-body font-semibold text-[11px] tracking-[0.2em] uppercase text-graphite underline-offset-8 hover:underline">{label}</a>
        ))}
      </nav>
      {advisor && (
        <div className="max-w-ledger mx-auto px-5 md:px-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[color:var(--jw-hairline)] py-3">
          <p className="font-display italic text-[16px] text-graphite">Need an advisor, or already have one?</p>
          <Link href="/advisors/match" className="font-body font-semibold text-[10.5px] tracking-[0.2em] uppercase text-graphite underline underline-offset-[6px] decoration-[color:var(--jw-crimson)]">Match me with one</Link>
          <Link href="/plan?with=my-advisor" className="font-body font-semibold text-[10.5px] tracking-[0.2em] uppercase text-graphite underline underline-offset-[6px] decoration-[color:var(--jw-crimson)]">I have an advisor</Link>
        </div>
      )}
    </div>
  );
}
