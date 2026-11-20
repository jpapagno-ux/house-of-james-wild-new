import type { ReactNode } from "react";
import { FieldIcon, type FieldIconName } from "@/components/ledger/FieldIcon";
import LedgerList, { type LedgerItem } from "./LedgerList";
import TapedPhoto from "./TapedPhoto";

// JWC-STYLE-01, Stage 3. Overview (the record's own quote and paragraphs beside one taped photograph), then
// "Why we vetted it" as three reasons with house icons, then the ledger strip.
const ICONS: FieldIconName[] = ["sun", "frond", "tree-ring"];

type Props = {
  quote?: string | null;
  /** The answer-first paragraph for search and answer engines. */
  answer: string;
  paragraphs: string[];
  photo?: { url: string; alt: string } | null;
  caption?: string;
  ledgerId?: string | null;
  reasons: { title: string; line: string }[];
  strip: LedgerItem[];
  whyId?: string;
  children?: ReactNode;
};

export default function JournalOverview({ quote, answer, paragraphs, photo, caption, ledgerId, reasons, strip, whyId = "why" }: Props) {
  return (
    <section id="overview" aria-labelledby="overview-h" className="bg-white">
      <div className="grid lg:grid-cols-[1fr_0.95fr] gap-10 lg:gap-16 items-center">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-stone-text">Overview</p>
          <h2 id="overview-h" className="font-display font-medium text-[1.75rem] md:text-[2.15rem] leading-[1.2] text-graphite mt-3">{quote ?? answer}</h2>
          {quote && <p className="mt-5 text-[15.5px] leading-relaxed text-stone-text">{answer}</p>}
          {paragraphs.map((p) => <p key={p} className="mt-4 text-[15.5px] leading-relaxed text-stone-text">{p}</p>)}
        </div>
        {photo && <div className="max-w-xl lg:ml-auto w-full pt-3"><TapedPhoto src={photo.url} alt={photo.alt} caption={caption} sizes="(min-width: 1024px) 520px, 92vw" /></div>}
      </div>

      {reasons.length > 0 && (
        <div id={whyId} className="mt-16 md:mt-20 border-y border-[color:var(--jw-hairline)] py-10 scroll-mt-4">
          <h2 className="text-center font-body font-semibold text-[11px] tracking-[0.3em] uppercase text-graphite">Why we vetted it{ledgerId && <> <span aria-hidden>·</span> <span className="ledger-id !tracking-[0.2em]">{ledgerId}</span></>}</h2>
          <ul className="mt-9 grid md:grid-cols-3">
            {reasons.map((r, i) => (
              <li key={r.title} className={`px-6 py-5 md:py-0 text-center ${i ? "border-t md:border-t-0 md:border-l border-[color:var(--jw-hairline)]" : ""}`}>
                <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center border border-[color:var(--jw-keyline)] text-graphite [border-radius:9999px]"><FieldIcon name={ICONS[i % ICONS.length]} height={20} /></span>
                <h3 className="font-display font-medium text-[22px] text-graphite mt-4">{r.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-stone-text max-w-xs mx-auto">{r.line}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {strip.length > 0 && <LedgerList layout="strip" items={strip} className="mt-12" />}
    </section>
  );
}
