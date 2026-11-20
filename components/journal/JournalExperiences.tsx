"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import SectionHead from "./SectionHead";

// JWC-STYLE-01, Stage 6. Experiences as a sideways scroll of cards, each with a favourite mark. Favourites are kept
// in this browser only for now (wrapped in try/catch; a blocked store simply forgets them); they are not yet sent to
// My Folio or to an advisor, and the page does not say they are. With no experience cards filed, the section prints
// the record's own paragraphs and a plain "coming soon" line.
export type Experience = { title: string; note?: string; image?: string; alt?: string };

export default function JournalExperiences({ no, slug, items, paragraphs, children }: { no: string; slug: string; items: Experience[]; paragraphs: string[]; /** photographs of the experiences, into the viewer */ children?: ReactNode }) {
  const key = `jw:favourites:${slug}`;
  const [fav, setFav] = useState<string[]>([]);
  useEffect(() => { try { const v = JSON.parse(window.localStorage.getItem(key) ?? "[]"); if (Array.isArray(v)) setFav(v.filter((x) => typeof x === "string")); } catch { /* no store: start empty */ } }, [key]);
  const toggle = (t: string) => setFav((cur) => { const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]; try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* kept for this visit only */ } return next; });
  return (
    <section id="experiences" aria-label="Experiences" className="bg-white">
      <SectionHead no={no} label="Experiences" title="What You Can Do From Here" lede={items.length ? "Scroll the cards and mark the ones you want." : undefined} />
      {items.length > 0 ? (
        <>
          <ul className="mt-9 -mx-5 md:-mx-10 px-5 md:px-10 flex gap-5 overflow-x-auto snap-x pb-3">
            {items.map((x, i) => {
              const on = fav.includes(x.title);
              return (
                <li key={x.title} className="snap-start shrink-0 w-[280px] md:w-[320px] flex flex-col border border-[color:var(--jw-hairline)] bg-white">
                  {x.image && <div className="relative m-2.5 mb-0 overflow-hidden" style={{ aspectRatio: "3 / 2" }}><Image src={x.image} alt={x.alt ?? x.title} fill sizes="320px" className="object-cover" /></div>}
                  <div className="px-5 pt-4 pb-5 flex flex-1 flex-col">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-house">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="font-display font-medium text-[23px] leading-tight text-graphite mt-1">{x.title}</h3>
                    {x.note && <p className="mt-2 text-[13.5px] leading-relaxed text-stone-text">{x.note}</p>}
                    <button type="button" aria-pressed={on} onClick={() => toggle(x.title)} className="house-chip mt-auto self-start !mt-5 !px-4 !py-2.5 font-semibold !text-[10.5px] tracking-[0.2em] uppercase">
                      <span aria-hidden>{on ? "♥" : "♡"}</span>{on ? "In your favourites" : "Add to favourites"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 font-hand text-[22px] text-graphite">Mark the ones you want. We plan around them.</p>
        </>
      ) : (
        <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-14 items-start">
          <div>{paragraphs.map((p) => <p key={p} className="text-[15.5px] leading-relaxed text-stone-text [&+p]:mt-4">{p}</p>)}</div>
          <p className="border border-dashed border-[color:var(--jw-keyline)] px-5 py-5 font-mono text-[10.5px] leading-relaxed tracking-[0.18em] uppercase text-stone-text">Experience cards coming soon. Until then, tell the house what you want to do and it plans around that.</p>
        </div>
      )}
      {children}
    </section>
  );
}
