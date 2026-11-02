"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

// A filtered hub view (?pathway=<key>): shows only the ships on that pathway. Filtered views are
// never indexed (James, 1 Nov 2026): middleware sends X-Robots-Tag noindex for /voyages/* with a
// filter, and this adds the robots meta too. The canonical stays the unfiltered hub.
export default function HubFilter({ items, names, children }: { items: { slug: string; keys: string[]; node: ReactNode }[]; names: Record<string, string>; children: ReactNode }) {
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("pathway");
    if (!k || !names[k]) return;
    setKey(k);
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, follow";
    document.head.appendChild(m);
    return () => { m.remove(); };
  }, [names]);
  if (!key) return <>{children}</>;
  const shown = items.filter((x) => x.keys.includes(key));
  return (
    <>
      <p className="mb-5 text-[15px]">Showing {shown.length} on <strong>{names[key]}</strong>. <Link href={window.location.pathname} className="underline underline-offset-4">Show every ship</Link></p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map((x) => <li key={x.slug}>{x.node}</li>)}</ul>
    </>
  );
}
