import type { ReactNode } from "react";
import VideoSlot from "@/components/booking/VideoSlot";

// The opening block under every record hero: why the place is in the Ledger
// (left) beside its film (right), with the travel types it suits best.
// Why first, because that's the question everyone actually has.
export default function WhyFilm({ eyebrow = "Why it's in the Ledger", title, paragraphs, blocks, suited, status, name, video, poster, planHref, note }: {
  eyebrow?: string; title: string; paragraphs?: string[]; blocks?: { title?: string | null; body: string }[]; suited: string[]; status?: ReactNode; name: string; video?: { id: string; title: string } | null; poster?: string | null; planHref: string; note?: ReactNode;
}) {
  return (
    <section id="why" className="pt-10 md:pt-14 scroll-mt-32 lg:scroll-mt-[240px] grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-start" aria-labelledby="why-heading">
      <div>
        <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>
        <h2 id="why-heading" className="ledger-display text-[1.9rem] md:text-[2.6rem] mt-2 leading-[1.1]">{title}</h2>
        {status && <div className="mt-3">{status}</div>}
        <div className="mt-5 space-y-4 text-[16.5px] leading-relaxed">
          {(blocks ?? []).map((b, i) => <p key={i}>{b.title && <strong className="font-normal ledger-display text-[1.15rem] block mb-1">{b.title}</strong>}{b.body}</p>)}
          {(paragraphs ?? []).map((p, i) => <p key={`p${i}`}>{p}</p>)}
        </div>
        {suited.length > 0 && (
          <div className="mt-6">
            <p className="ledger-eyebrow">Best suited to</p>
            <ul className="mt-2 flex flex-wrap gap-2">{suited.map((t) => <li key={t} className="border ledger-border px-3 py-1 text-[13.5px] bg-paper">{t}</li>)}</ul>
          </div>
        )}
      </div>
      <div><div id="film" className="scroll-mt-32 lg:scroll-mt-[240px]"><VideoSlot name={name} video={video} poster={poster} planHref={planHref} /></div>{note}</div>
    </section>
  );
}
