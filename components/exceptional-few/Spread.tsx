import Image from "next/image";
import type { ReactNode } from "react";
import { SIGNAL_LABEL, type ExceptionalFew } from "@/lib/content/exceptional-few";
import { mediaUrl, type MediaAsset } from "@/lib/content/media-assets";
import { Credit } from "./EFStory";

// The magazine spread: Why It Made the Cut as three short paragraphs, each paired
// with its own photograph, alternating sides. Signals ride on the photographs as
// thin typographic captions rather than a chip row. Half the words, twice the air.
export default function Spread({ ef, frames, heading = "Why It Made the Cut", after }: { ef: ExceptionalFew; frames: (MediaAsset | null)[]; heading?: string; after?: ReactNode }) {
  const paras = ef.whyItMadeTheCut;
  const sigs = ef.signals;
  return (
    <section id="why" className="mt-14 md:mt-20 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="why-heading">
      <p className="ledger-eyebrow ef-eyebrow">The Exceptional Few</p>
      <h2 id="why-heading" className="ledger-display text-[2.2rem] md:text-[3.4rem] leading-[1.02] mt-2 max-w-3xl">{heading}</h2>
      <div className="mt-10 md:mt-16 space-y-16 md:space-y-28">
        {paras.map((text, i) => {
          const a = frames[i] ?? null;
          const sig = sigs.slice(i * 2, i * 2 + 2);
          const flip = i % 2 === 1;
          return (
            <div key={i} className={`grid md:grid-cols-12 gap-6 md:gap-10 items-end ${flip ? "md:[&>*:first-child]:order-2" : ""}`}>
              {a ? (
                <figure className="md:col-span-7">
                  <div className={`relative ${i === 1 ? "aspect-[4/5] md:aspect-[3/4]" : "aspect-[16/10]"} overflow-hidden bg-paper-card`}>
                    <Image src={mediaUrl(a, { ratio: i === 1 ? "4:5" : "16:10", width: 1800 })} alt={a.alt} fill sizes="(min-width: 768px) 58vw, 100vw" quality={85} className="object-cover" />
                    {sig.length > 0 && (
                      <ul className="absolute left-4 bottom-4 md:left-6 md:bottom-6 flex flex-col gap-1.5">
                        {sig.map((s) => <li key={s.key} className="inline-flex items-baseline gap-2 text-white drop-shadow"><span className="ledger-eyebrow !text-white/80 !text-[9.5px]">{SIGNAL_LABEL[s.key]}</span><span className="h-px w-5 bg-white/60 self-center" aria-hidden="true" /><span className="text-[13px] leading-snug max-w-[26ch]">{s.line}</span></li>)}
                      </ul>
                    )}
                  </div>
                  <figcaption className="mt-2 flex items-baseline justify-between gap-4 text-[12.5px]"><span className="ledger-display italic text-[15px]">{a.caption ?? a.alt}</span><Credit a={a} /></figcaption>
                </figure>
              ) : <div className="hidden md:block md:col-span-7" />}
              <div className="md:col-span-5 md:pb-10">
                <span className="ledger-display text-[3rem] md:text-[4.2rem] leading-none text-ef-sand" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-3 ledger-display text-[1.25rem] md:text-[1.5rem] leading-[1.35]">{text}</p>
              </div>
            </div>
          );
        })}
      </div>
      {after}
    </section>
  );
}

/** The editorial row without boxes: James' Note · Pathways · signals, separated by hairline rules. */
export function OpenRow({ children }: { children: ReactNode }) {
  return <section aria-label="James' note, pathways and at a glance" className="mt-16 md:mt-24 grid md:grid-cols-3 gap-8 md:gap-0 border-t ef-rule pt-8 md:divide-x md:[&>*]:px-8 md:[&>*:first-child]:pl-0 md:[&>*:last-child]:pr-0 [&>*]:border-ef-sand">{children}</section>;
}
