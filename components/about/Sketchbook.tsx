import Image from "next/image";
import Link from "next/link";
import { SKETCHBOOK, type Sketch } from "@/lib/content/founder-sketchbook";

// The Founder's Sketchbook: James's places as watercolours, the house hare in each, in year order. A swipe row on
// phones, a loose pinned wall on desktop. SketchPlate is the single painting on a place's own page.

export function SketchPlate({ s }: { s: Sketch }) {
  return (
    <figure className="mt-14 md:mt-20 grid md:grid-cols-[1.25fr_1fr] gap-6 md:gap-10 items-center" aria-label={`From the founder's sketchbook: ${s.place}, ${s.year}`}>
      <div className="relative aspect-[4/3] bg-white shadow-[0_18px_40px_-26px_rgba(26,24,22,0.55)] rotate-[-0.6deg]">
        <Image src={s.img} alt={s.alt} fill sizes="(min-width: 768px) 55vw, 100vw" className="object-contain" />
      </div>
      <figcaption>
        <p className="ledger-eyebrow text-house">From the founder&rsquo;s sketchbook · {s.year}</p>
        <p className="ledger-display text-[1.7rem] md:text-[2.1rem] leading-tight mt-2">James was here</p>
        <p className="mt-3 text-[16.5px] leading-relaxed ledger-muted"><span className="text-graphite">{s.place}.</span> {s.line}</p>
        <Link href="/about/founder#sketchbook" className="ledger-btn mt-5 inline-flex">Open the sketchbook</Link>
      </figcaption>
    </figure>
  );
}

export default function Sketchbook() {
  return (
    <section id="sketchbook" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-28" aria-labelledby="sketch-heading">
      <p className="ledger-eyebrow text-house">The founder&rsquo;s sketchbook · {SKETCHBOOK.length} places</p>
      <h2 id="sketch-heading" className="ledger-display text-[1.9rem] md:text-[2.6rem] leading-tight mt-2">Places James Has Been</h2>
      <p className="mt-3 text-[17px] leading-relaxed ledger-muted max-w-2xl">Forty-four years of the road as watercolours, with the house hare standing in for James: a board under his arm in 1983, a red parka in 2020. Find him in each.</p>
      <ol className="mt-10 flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 pb-4">
        {SKETCHBOOK.map((s, i) => (
          <li key={s.id} className="snap-start shrink-0 w-[82vw] sm:w-[48vw] md:w-auto">
            <figure className={`bg-white p-3 pb-4 shadow-[0_14px_34px_-24px_rgba(26,24,22,0.6)] ${["md:rotate-[-1.2deg]", "md:rotate-[0.8deg]", "md:rotate-[-0.4deg]"][i % 3]}`}>
              <div className="relative aspect-[4/3]"><Image src={s.img} alt={s.alt} fill sizes="(min-width: 768px) 30vw, 82vw" className="object-contain" /></div>
              <figcaption className="mt-3 px-1">
                <p className="font-mono text-[13px] ledger-crimson">{s.year}</p>
                <p className="ledger-display text-[1.25rem] leading-tight mt-0.5">{s.place}</p>
                <p className="mt-1 text-[14.5px] leading-relaxed ledger-muted">{s.line}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}
