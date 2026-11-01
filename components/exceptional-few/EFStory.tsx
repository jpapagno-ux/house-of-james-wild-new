import Image from "next/image";
import { mediaUrl, ROLE_RATIO, type MediaAsset, type Ratio } from "@/lib/content/media-assets";

// The photographic story: fewer, stronger frames in the brief's order (arrival,
// interior, human detail, night), laid out asymmetrically, never as a uniform
// grid. Every frame prints its caption and its credit from the asset record.
// This is the Exceptional Few variant of FullFrame: it sits inside the page
// column rather than breaking out, so the credits stay legible.
const ASPECT: Record<Ratio, string> = { "21:9": "aspect-[21/9]", "16:10": "aspect-[16/10]", "3:2": "aspect-[3/2]", "4:5": "aspect-[4/5]", "1:1": "aspect-square", "4:3": "aspect-[4/3]" };

export function EFFrame({ a, ratio, sizes, priority = false, className = "" }: { a: MediaAsset; ratio?: Ratio; sizes: string; priority?: boolean; className?: string }) {
  const r = ratio ?? ROLE_RATIO[a.role]?.desktop ?? "3:2";
  return (
    <figure className={`min-w-0 ${className}`}>
      <div className={`relative ${ASPECT[r]} overflow-hidden border ledger-border bg-paper-card`}>
        <Image src={mediaUrl(a, { ratio: r, width: 1800 })} alt={a.alt} fill sizes={sizes} quality={85} priority={priority} className="object-cover" />
      </div>
      <figcaption className="mt-2 flex items-baseline justify-between gap-4 text-[12.5px] leading-snug">
        <span className="ledger-display italic text-[15px] text-ink">{a.caption ?? a.alt}</span>
        <Credit a={a} />
      </figcaption>
    </figure>
  );
}

export function Credit({ a, className = "" }: { a: MediaAsset; className?: string }) {
  const text = a.photographer ? `${a.credit} · ${a.photographer}` : a.credit;
  return a.creditUrl
    ? <a href={a.creditUrl} rel="noopener" className={`ef-caption shrink-0 text-[11px] tracking-[0.08em] hover:text-crimson ${className}`}>{text}</a>
    : <span className={`ef-caption shrink-0 text-[11px] tracking-[0.08em] ${className}`}>{text}</span>;
}

export default function EFStory({ name, frames, id = "story" }: { name: string; frames: { arrival?: MediaAsset | null; interior?: MediaAsset | null; human?: MediaAsset | null; night?: MediaAsset | null }; id?: string }) {
  const { arrival, interior, human, night } = frames;
  if (!arrival && !interior && !human && !night) return null;
  return (
    <section id={id} className="mt-16 md:mt-24 border-t ef-rule pt-8 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby={`${id}-heading`}>
      <p className="ledger-eyebrow ef-eyebrow">The photographic story</p>
      <h2 id={`${id}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">{name}, in Four Frames</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-12 md:grid-rows-[auto_auto]">
        {arrival && <EFFrame a={arrival} ratio="16:10" sizes="(min-width: 768px) 60vw, 100vw" className="md:col-span-7 md:row-span-2" />}
        {interior && <EFFrame a={interior} ratio="3:2" sizes="(min-width: 768px) 40vw, 100vw" className="md:col-span-5" />}
        <div className="grid grid-cols-2 gap-5 md:col-span-5">
          {human && <EFFrame a={human} ratio="4:5" sizes="(min-width: 768px) 20vw, 50vw" />}
          {night && <EFFrame a={night} ratio="4:5" sizes="(min-width: 768px) 20vw, 50vw" />}
        </div>
      </div>
    </section>
  );
}
