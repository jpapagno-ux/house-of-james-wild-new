"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PathwayChips } from "@/components/pathways/Pathway";
import { pathway, type Pathway } from "@/lib/pathways";

// The cards a country keeps folded until asked (house audit, 1 Nov 2026):
// the two largest pathway pages carried every card twice (HTML and the React
// payload). These ship as slim data and render on "Show all", with the same
// card shape as hub/Hub RecordCard. Every entry stays in the ItemList schema.
export type SlimCard = { slug: string; name: string; id: string; line: string; hero: string; alt: string; href: string; country: string | null; primary: string; secondary: string[] };

export default function MoreCards({ items, label, hrefFor }: { items: SlimCard[]; label: string; hrefFor: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  if (!open) {
    return <p className="mt-5"><button type="button" onClick={() => setOpen(true)} className="ledger-btn-ghost inline-flex items-center gap-2" aria-expanded="false">Show all {label} <ArrowRight className="w-4 h-4 rotate-90" strokeWidth={1.5} aria-hidden="true" /></button></p>;
  }
  const hf = (p: Pathway) => hrefFor[p.id] ?? "#";
  return (
    <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((r) => {
        const primary = pathway(r.primary); const secondary = r.secondary.map((s) => pathway(s)).filter((p): p is Pathway => !!p);
        return (
          <li key={r.slug} className="flex flex-col gap-3">
            <Link href={r.href} className="group h-full bg-paper border ledger-border flex flex-col hover:border-crimson">
              <div className="relative aspect-[4/3] bg-paper-card overflow-hidden"><Image src={r.hero} alt={r.alt} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /></div>
              <div className="p-4 flex flex-col flex-1">
                {r.country && <p className="ledger-eyebrow ledger-crimson">{r.country}</p>}
                <h3 className="ledger-display text-[1.3rem] leading-snug mt-0.5">{r.name}</h3>
                <p className="mt-1.5 text-[14.5px] ledger-muted leading-snug">{r.line}</p>
                <p className="mt-auto pt-3 flex items-center justify-between"><span className="font-mono text-[11px] tracking-[0.08em] ledger-muted">{r.id}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} aria-hidden="true" /></p>
              </div>
            </Link>
            {primary && <PathwayChips primary={primary} secondary={secondary} hrefFor={hf} />}
          </li>
        );
      })}
    </ul>
  );
}
