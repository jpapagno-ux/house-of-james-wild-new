"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { FieldIcon, type FieldIconName } from "@/components/ledger/FieldIcon";

export type AccordionItem = { title: string; image?: string; alt?: string; note?: string };

// A list that opens one row at a time to show a photograph and a line.
// Closed panels stay in the page (hidden, not removed) so search engines and
// answer engines still read every item.
export default function ImageAccordion({ id, eyebrow, title, intro, icon, items, start = 0 }: { id: string; eyebrow: string; title: string; intro?: string; icon?: FieldIconName; items: AccordionItem[]; start?: number | null }) {
  const [open, setOpen] = useState<number | null>(start);
  const uid = useId();
  return (
    <section id={id} className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[240px]" aria-labelledby={`${uid}-h`}>
      <div className="flex items-center gap-3">
        {icon && <FieldIcon name={icon} height={26} className="ledger-crimson" />}
        <p className="ledger-eyebrow">{eyebrow}</p>
      </div>
      <h2 id={`${uid}-h`} className="ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight">{title}</h2>
      {intro && <p className="mt-3 text-[16px] md:text-[17px] leading-relaxed ledger-muted max-w-3xl">{intro}</p>}
      <ul className="mt-6 border-t ledger-rule">
        {items.map((x, k) => {
          const on = open === k;
          return (
            <li key={x.title} className="border-b ledger-rule">
              <h3>
                <button type="button" id={`${uid}-b${k}`} aria-expanded={on} aria-controls={`${uid}-p${k}`} onClick={() => setOpen(on ? null : k)}
                  className="w-full flex items-center gap-4 py-4 md:py-5 text-left group">
                  <span className="font-mono text-[11px] tracking-[0.14em] ledger-muted tabular-nums w-6">{String(k + 1).padStart(2, "0")}</span>
                  <span className="flex-1 ledger-display text-[1.15rem] md:text-[1.35rem] leading-snug group-hover:ledger-crimson">{x.title}</span>
                  <Plus className={`w-5 h-5 shrink-0 transition-transform duration-300 ${on ? "rotate-45 ledger-crimson" : ""}`} strokeWidth={1.4} aria-hidden="true" />
                </button>
              </h3>
              <div id={`${uid}-p${k}`} role="region" aria-labelledby={`${uid}-b${k}`} className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden" inert={!on || undefined}>
                  <div className="pb-6 md:pb-8 md:pl-10 grid md:grid-cols-[1.6fr_1fr] gap-5 md:gap-8 items-end">
                    {x.image && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#e9e3d6]">
                        <Image src={x.image} alt={x.alt ?? x.title} fill sizes="(max-width: 768px) 100vw, 60vw" quality={85} loading="lazy" className={`object-cover transition-transform duration-[1600ms] ${on ? "scale-100" : "scale-105"}`} />
                      </div>
                    )}
                    {x.note && <p className="ledger-display italic text-[1.05rem] md:text-[1.2rem] leading-relaxed text-[#3b2f26]">{x.note}</p>}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
