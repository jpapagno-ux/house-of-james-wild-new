"use client";

import Image from "next/image";
import HouseStamp from "./HouseStamp";
import { useState } from "react";
import { RotateCw } from "lucide-react";
import Signature from "@/components/record/Signature";

// The house postcard: a photograph on the front; on the back, a short note
// in James Wild's voice, his JW, a stamp and a postmark for the place and
// date. Tap (or press Enter) to turn it over. The same card is the design
// for enquiry replies and emails.
export type PostcardData = { image: string; alt: string; front: { eyebrow: string; title: string; line: string }; greeting: string; note: string[]; to: string[]; postmark: { place: string; date: string }; stampLabel: string };

export default function Postcard({ p, sample = false }: { p: PostcardData; sample?: boolean }) {
  const [back, setBack] = useState(false);
  return (
    <figure className="mx-auto w-full max-w-[640px]">
      <button type="button" onClick={() => setBack((b) => !b)} aria-pressed={back} aria-label={back ? "Turn the postcard to the photograph" : "Turn the postcard over to read the note"}
        className="relative block w-full aspect-[4/5] sm:aspect-[3/2] [perspective:1600px] cursor-pointer text-left">
        <span className="absolute inset-0 transition-transform duration-[900ms] [transform-style:preserve-3d]" style={{ transform: back ? "rotateY(180deg)" : "none", transitionTimingFunction: "cubic-bezier(.3,.7,.2,1)" }}>
          {/* front */}
          <span className="absolute inset-0 [backface-visibility:hidden] bg-[#fdfcf8] p-2.5 shadow-[0_20px_44px_-20px_rgba(40,30,15,.55)] border border-[#e7e1d4]">
            <span className="relative block w-full h-full overflow-hidden">
              <Image src={p.image} alt={p.alt} fill sizes="(min-width: 768px) 640px, 100vw" className="object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
              <span className="absolute left-5 bottom-4 right-5 text-white">
                <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-white/80">{p.front.eyebrow}</span>
                <span className="block ledger-display text-[1.9rem] md:text-[2.5rem] leading-none mt-1">{p.front.title}</span>
                <span className="block ledger-display italic text-[1rem] md:text-[1.15rem] text-white/90 mt-1.5">{p.front.line}</span>
              </span>
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 bg-black/35 backdrop-blur-sm text-white px-2.5 py-1 font-mono text-[9.5px] tracking-[0.16em] uppercase"><RotateCw className="w-3 h-3" strokeWidth={1.6} aria-hidden="true" /> Turn over</span>
            </span>
          </span>
          {/* back */}
          <span className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#fbf8f0] border border-[#e7e1d4] shadow-[0_20px_44px_-20px_rgba(40,30,15,.55)] p-5 md:p-6 grid grid-rows-[auto_1fr] sm:grid-rows-none sm:grid-cols-[1.25fr_1fr] gap-3 sm:gap-4 md:gap-6 text-[#2b2622]">
            <span className="flex flex-col min-h-0 order-2 sm:order-none">
              <span className="ledger-display italic text-[1rem] md:text-[1.15rem] leading-[1.55] overflow-hidden">
                <span className="block not-italic font-mono text-[9.5px] tracking-[0.18em] uppercase text-[#8b3a2e] mb-2">{p.greeting}</span>
                {p.note.map((t, i) => <span key={i} className="block mb-2">{t}</span>)}
              </span>
              <span className="mt-auto pt-1"><Signature className="w-20 md:w-28" /></span>
            </span>
            <span className="relative order-1 sm:order-none h-[96px] sm:h-auto sm:border-l border-b sm:border-b-0 border-[#d9cfbd] sm:pl-4 md:pl-6 flex flex-col">
              <span className="relative self-stretch h-[86px] md:h-[118px] shrink-0"><HouseStamp image={p.image} label={p.stampLabel} place={p.postmark.place} date={p.postmark.date} /></span>
              <span className="hidden sm:block mt-auto space-y-2.5 pb-1">
                {p.to.map((l, i) => <span key={i} className="block border-b border-[#cfc3ad] pb-1 ledger-display italic text-[0.85rem] md:text-[1rem] text-[#5c4a38]">{l}</span>)}
              </span>
            </span>
          </span>
        </span>
      </button>
      <figcaption className="mt-3 text-center text-[12.5px] ledger-muted">{sample ? "Sample · how a reply to your enquiry arrives. " : ""}Tap the card to turn it over.</figcaption>
    </figure>
  );
}
