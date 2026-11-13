"use client";

import { Search } from "lucide-react";
import { openSearch, type SearchScope } from "@/lib/search-bus";

// Search inside a destination (James, 13 Nov 2026: "when they're in a destination, give the same search within the
// destination ... searching for a cruise or a stay within that country or within the region ... and explain it to the
// users"). The same house search, opened already limited to this place, with one tap to search everywhere instead.

export default function PlaceSearch({ scope, what = "stays, camps, ships and voyages", className = "" }: { scope: SearchScope; what?: string; className?: string }) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => openSearch({ scope })}
        className="group w-full flex items-center gap-3 h-14 px-4 border border-ink bg-paper text-left hover:bg-mist transition-colors"
        aria-label={`Search ${what} in ${scope.name}`}
      >
        <Search className="w-[18px] h-[18px] ledger-crimson shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span className="flex-1 min-w-0 truncate text-[15.5px] text-ink/60">Search {what} in {scope.name}</span>
        <span className="hidden sm:inline ledger-eyebrow !text-[10.5px] shrink-0 group-hover:ledger-crimson">Search here</span>
      </button>
      <p className="mt-2 text-[13px] ledger-muted leading-snug">Type a lodge, a ship or a town, or open it to see everything the house has filed in {scope.name}. One tap widens it to the whole Ledger.</p>
    </div>
  );
}
