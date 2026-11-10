import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type RouteCard = { key: string; href: string; eyebrow: string; title: string; sub?: string; line?: string };

// "On these routes" (James, 10 Nov 2026: "I like the fact that Ellerman House also shows routes that it's featured on.
// That's an important feature that we need to build into the logic"): every journey and voyage that includes the stay,
// found from the data (lib/content/trips.ts routesThrough, lib/content/ships/either-side.ts voyagesThrough). The rule
// takes the stay's pathway colour where the page has one.
export default function OnTheseRoutes({ routes }: { routes: RouteCard[] }) {
  if (!routes.length) return null;
  return (
    <section aria-labelledby="routes-h" className="mt-12 md:mt-16">
      <p className="ledger-eyebrow">On these routes</p>
      <h2 id="routes-h" className="ledger-display text-[1.5rem] md:text-[1.9rem] mt-1 leading-tight">Journeys That Include This Stay</h2>
      <ul className="mt-5 grid md:grid-cols-2 gap-4">
        {routes.map((t) => (
          <li key={t.key}>
            <Link href={t.href} className="group flex h-full border ledger-border bg-white/70 hover:bg-white transition-colors">
              <span aria-hidden="true" className="w-[4px] shrink-0" style={{ background: "var(--tone-path, #2E2B28)" }} />
              <span className="flex-1 p-5">
                <span className="block text-[10.5px] tracking-[0.2em] uppercase ledger-muted">{t.eyebrow}</span>
                <span className="block ledger-display text-[1.3rem] leading-snug mt-1">{t.title}</span>
                {t.sub && <span className="block text-[14px] ledger-muted mt-1">{t.sub}</span>}
                {t.line && <span className="block text-[15px] mt-2">{t.line}</span>}
              </span>
              <span className="self-center pr-5"><ArrowRight aria-hidden="true" className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={1.4} /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
