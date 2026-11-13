"use client";

import { useEffect } from "react";
import { Search } from "lucide-react";
import { openSearch } from "@/lib/search-bus";

export default function SearchLanding({ q }: { q: string }) {
  useEffect(() => { const t = setTimeout(() => openSearch({ q }), 60); return () => clearTimeout(t); }, [q]);
  return (
    <div className="max-w-2xl">
      <p className="ledger-eyebrow ledger-crimson">Search the house</p>
      <h1 className="ledger-display text-[2.2rem] md:text-[2.8rem] leading-tight mt-2">Find a lodge, stay, ship or place</h1>
      <p className="mt-3 text-[16px] ledger-muted">Type the name of a lodge, a camp, a ship or a cruise line, a country or an advisor.</p>
      <button type="button" onClick={() => openSearch({ q })} className="mt-6 w-full flex items-center gap-3 h-14 px-4 border border-ink bg-paper text-left hover:bg-mist">
        <Search className="w-[18px] h-[18px] ledger-crimson" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-[15.5px] text-ink/60">{q ? `Results for “${q}”` : "Start typing"}</span>
      </button>
    </div>
  );
}
