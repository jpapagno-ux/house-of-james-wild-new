"use client";

import { useEffect, useState } from "react";

// ChapterRail — a pinned margin label on long pages (house chrome, 30 Oct
// 2026). As the reader scrolls, the chapter number and name of the section
// under the header stay fixed at the left edge, like a running head in a
// book. It reads the same section ids the "On this page" bar uses, so the
// two never disagree. Desktop only; phones keep the top bar.
export default function ChapterRail({ items, tone }: { items: [string, string][]; tone?: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = items.map(([, id]) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  const i = items.findIndex(([, id]) => id === active);
  if (i < 0) return null;
  return (
    <aside className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3 pointer-events-none" aria-hidden="true">
      <span className="ledger-display text-[2.4rem] leading-none" style={{ color: tone ?? "var(--jw-accent-hex)" }}>{String(i + 1).padStart(2, "0")}</span>
      <span className="w-px h-10 bg-ink/25" />
      <span className="ledger-eyebrow !text-[10px] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">{items[i][0]}</span>
      <span className="w-px h-10 bg-ink/25" />
      <span className="ledger-eyebrow !text-[9px] opacity-60">{String(items.length).padStart(2, "0")}</span>
    </aside>
  );
}
