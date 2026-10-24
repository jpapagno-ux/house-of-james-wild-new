import Link from "next/link";
import JsonLd from "./JsonLd";
import { breadcrumbs, graph } from "@/lib/schema";

// Visible breadcrumbs + matching BreadcrumbList schema, from one trail.
export default function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="ledger-eyebrow">
        <ol className="flex flex-wrap items-center gap-2">
          {trail.map((t, i) => (
            <li key={t.path} className="flex items-center gap-2">
              {i < trail.length - 1 ? <Link href={t.path} className="hover:ledger-crimson">{t.name}</Link> : <span aria-current="page">{t.name}</span>}
              {i < trail.length - 1 && <span aria-hidden="true">›</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={graph(breadcrumbs(trail))} />
    </>
  );
}
