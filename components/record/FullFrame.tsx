import Image from "next/image";
import { sharpen } from "@/lib/content/sharpen";
import type { FullFrame as Frame } from "@/lib/content/stay-media";

// Full-screen photographs, edge to edge, one per viewport height. Breaks out of
// the page container; the page's <main> clips the horizontal overflow.
export default function FullFrame({ frames, name }: { frames: Frame[]; name: string }) {
  if (!frames.length) return null;
  return (
    <section id="full-frame" aria-label={`${name} in full frame`} className="mt-16 md:mt-24 mx-[calc(50%-50vw)] scroll-mt-32 lg:scroll-mt-[212px]">
      {frames.map((f, i) => (
        <figure key={f.src} className="relative h-[100svh] min-h-[520px] w-full overflow-hidden bg-ink">
          <Image src={sharpen(f.src)} alt={f.alt} fill sizes="100vw" quality={85} className="object-cover" style={f.pos ? { objectPosition: f.pos } : undefined} loading={i === 0 ? "eager" : "lazy"} />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" aria-hidden="true" />
          <figcaption className="absolute left-5 md:left-10 bottom-6 md:bottom-10 text-white">
            <span className="ledger-eyebrow !text-white/70">{name} · {String(i + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}</span>
            <span className="block ledger-display italic text-2xl md:text-4xl mt-1 drop-shadow">{f.caption}</span>
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
