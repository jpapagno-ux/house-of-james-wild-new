"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { clearTrail, openSearch, trailHere, type Trail } from "@/lib/search-bus";

// The way back (James, 13 Nov 2026: "once they're in all the areas of the site ... easy to navigate back to where
// they started from"). A reader who chose a result from the house search lands with a small card, bottom left:
// reopen the same results with one tap, or go back to the page they searched from. It stays while they read inside
// that entry (a lodge within a reserve, a ship's voyages), for three hours, and goes when they close it.

export default function BackToSearch() {
  const pathname = usePathname();
  const [t, setT] = useState<Trail | null>(null);

  useEffect(() => {
    const here = trailHere(pathname);
    setT(here && here.from.split("#")[0] !== pathname ? here : null);
  }, [pathname]);

  if (!t) return null;
  const words = t.q ? `“${t.q}”` : t.scope ? t.scope.name : "your search";

  return (
    <aside
      aria-label="Back to your search"
      className="fixed z-[45] left-[max(12px,env(safe-area-inset-left,0px))] bottom-[calc(88px+env(safe-area-inset-bottom,0px))] lg:bottom-6 max-w-[calc(100vw-24px)] sm:max-w-[360px] bg-paper text-ink border ledger-border shadow-[0_10px_30px_rgba(26,24,22,0.18)] flex items-stretch"
    >
      <button
        type="button"
        onClick={() => openSearch({ q: t.q, scope: t.scope })}
        className="flex items-center gap-2.5 pl-3 pr-3 py-2.5 text-left hover:bg-mist min-w-0"
      >
        <Search className="w-4 h-4 ledger-crimson shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span className="min-w-0">
          <span className="block ledger-eyebrow !text-[10px]">Back to your search</span>
          <span className="block ledger-display text-[15.5px] leading-tight truncate">{words}{t.scope && t.q ? ` in ${t.scope.name}` : ""}</span>
        </span>
      </button>
      <Link href={t.from} className="hidden sm:flex items-center gap-1.5 px-3 border-l ledger-border text-[12.5px] hover:bg-mist whitespace-nowrap" title={`Back to ${t.fromTitle}`}>
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
        <span className="max-w-[9rem] truncate">{t.fromTitle || "Where you were"}</span>
      </Link>
      <button type="button" onClick={() => { clearTrail(); setT(null); }} className="px-2.5 border-l ledger-border hover:bg-mist" aria-label="Dismiss">
        <X className="w-4 h-4" strokeWidth={1.25} aria-hidden="true" />
      </button>
    </aside>
  );
}
