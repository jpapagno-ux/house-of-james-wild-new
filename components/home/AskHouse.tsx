"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import SearchPanel from "@/components/ledger/SearchPanel";

// Board 8, "Ask the house" as the front door (James approved, 3 Nov 2026). One question box on the homepage that
// opens the house search with the words already typed; the answers are the house's own pages, nothing written here.
const ASKS = ["The Exceptional Few", "Botswana", "Kenya", "Galápagos", "Tahiti", "Private island", "Honeymoon"];

export default function AskHouse() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className="bg-mist border-y ledger-border" aria-labelledby="ask-house-h">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-10 md:py-14">
        <p className="ledger-eyebrow ledger-crimson">Ask the house</p>
        <h2 id="ask-house-h" className="ledger-display text-[1.9rem] md:text-[2.6rem] leading-tight mt-2">Where do you want to wake up?</h2>
        <form className="mt-6 flex items-stretch max-w-3xl border border-ink bg-paper" onSubmit={(e) => { e.preventDefault(); setOpen(q.trim()); }} role="search">
          <label htmlFor="ask-house-q" className="sr-only">Ask the house</label>
          <span className="pl-4 flex items-center"><Search className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /></span>
          <input id="ask-house-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="A country, a camp, a ship, a feeling" className="flex-1 min-w-0 h-14 px-3 bg-transparent text-[16px] outline-none" />
          <button type="submit" className="ledger-btn ledger-btn--house !h-14 !border-0 shrink-0">Show me</button>
        </form>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Try one">
          {ASKS.map((a) => <li key={a}><button type="button" className="house-chip min-h-[44px]" onClick={() => { setQ(a); setOpen(a); }}>{a}</button></li>)}
        </ul>
        <p className="mt-3 text-[13px] ledger-muted">Every answer is a page in the Ledger: a stay, a camp, a ship or a route the house has vetted.</p>
      </div>
      {open !== null && <SearchPanel open onClose={() => setOpen(null)} initialQuery={open} />}
    </section>
  );
}
