import Image from "next/image";
import { mediaUrl, type MediaAsset } from "@/lib/content/media-assets";
import Signature from "@/components/record/Signature";

// The close: the night frame full-bleed, Worth Another Night™ set over it in
// ivory. The page ends in the dark, which is where the place is at its best.
// This is the one surface on an Exceptional Few page that is not white.
export default function NightClose({ a, name, copy, id = "another-night" }: { a: MediaAsset; name: string; copy: string; id?: string }) {
  return (
    <section id={id} className="mt-16 md:mt-24 mx-[calc(50%-50vw)] relative min-h-[88svh] overflow-hidden bg-ink text-[#F3EDE2] scroll-mt-32" aria-labelledby={`${id}-heading`}>
      <Image src={mediaUrl(a, { ratio: "3:2", width: 2560 })} alt={a.alt} fill sizes="100vw" quality={85} className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
      <div className="relative max-w-ledger mx-auto px-5 md:px-10 min-h-[88svh] flex flex-col justify-end pb-12 md:pb-16">
        <p className="ledger-eyebrow !text-[#E6D9C4]/85">Worth Another Night&trade;</p>
        <h2 id={`${id}-heading`} className="ledger-display text-[2.2rem] md:text-[3.6rem] leading-[1.02] mt-2 max-w-3xl">Does Staying Longer Change {name}?</h2>
        <p className="mt-6 max-w-2xl ledger-display text-[1.3rem] md:text-[1.7rem] leading-snug">{copy}</p>
        <div className="mt-8 flex items-center justify-between gap-6 max-w-2xl border-t border-[#E6D9C4]/35 pt-4">
          <span className="text-[11px] tracking-[0.16em] uppercase text-[#E6D9C4]/80">From the house</span>
          <span className="invert opacity-90"><Signature className="w-24 md:w-28" /></span>
        </div>
        <p className="mt-6 text-[10.5px] tracking-[0.08em] text-[#F3EDE2]/60">{a.caption ? `${a.caption} · ` : ""}{a.credit}</p>
      </div>
    </section>
  );
}
