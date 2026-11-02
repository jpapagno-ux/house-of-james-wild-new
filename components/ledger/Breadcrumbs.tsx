import Link from "next/link";
import JsonLd from "./JsonLd";
import { breadcrumbs, graph } from "@/lib/schema";

// Visible breadcrumbs + matching BreadcrumbList schema, from one trail.
// `touch`: each link is a 44px tap target (WCAG 2.5.5), for pages read mostly on phones (Voyages).
export default function Breadcrumbs({ trail, touch = false }: { trail: { name: string; path: string }[]; touch?: boolean }) {
  const hit = touch ? "inline-flex items-center min-h-[44px]" : "";
  return (
    <>
      <nav aria-label="Breadcrumb" className="ledger-eyebrow">
        <ol className={`flex flex-wrap items-center ${touch ? "gap-x-2" : "gap-2"}`}>
          {trail.map((t, i) => (
            <li key={t.path} className="flex items-center gap-2">
              {i < trail.length - 1 ? <Link href={t.path} className={`hover:ledger-crimson ${hit}`}>{t.name}</Link> : <span aria-current="page" className={hit}>{t.name}</span>}
              {i < trail.length - 1 && <span aria-hidden="true">›</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={graph(breadcrumbs(trail))} />
    </>
  );
}
