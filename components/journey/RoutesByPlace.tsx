import Link from "next/link";
import { Anchor, ArrowRight, Route as RouteIcon } from "lucide-react";
import { journeysFor } from "@/lib/content/preview/journeys";
import { GUARD_ON, isBuilt } from "@/lib/routes";
import { VOLUME_STYLES } from "@/lib/volumes";

// Routes and voyages by destination (navigation audit, 30 Oct 2026): the bridge between the
// tours and the places, both ways. Each destination opens its own guide, with every built
// route or voyage there one click away, inked by volume (land olive, sea navy).
const PLACES: { key: string; name: string; href: string }[] = [
  { key: "costa-rica", name: "Costa Rica", href: "/destinations/central-america/costa-rica" },
  { key: "south-africa", name: "South Africa", href: "/destinations/africa/south-africa" },
  { key: "botswana", name: "Botswana", href: "/destinations/africa/botswana" },
  { key: "indonesia", name: "Indonesia", href: "/destinations/asia/indonesia" },
];

const ok = (href: string) => !GUARD_ON || isBuilt(href);

export default function RoutesByPlace({ only }: { only?: string[] }) {
  const rows = PLACES.filter((p) => !only || only.includes(p.key))
    .map((p) => ({ ...p, list: journeysFor(p.key).filter((j) => ok(j.href)) }))
    .filter((p) => p.list.length && ok(p.href));
  if (!rows.length) return null;
  return (
    <ul className="grid gap-px bg-[var(--ledger-rule,#e5e0d6)] border ledger-rule sm:grid-cols-2">
      {rows.map((p) => (
        <li key={p.key} className="bg-paper p-5 md:p-6">
          <Link href={p.href} className="group inline-flex items-baseline gap-2">
            <span className="ledger-display text-[1.6rem] leading-tight group-hover:underline underline-offset-4">{p.name}</span>
            <ArrowRight className="w-4 h-4 translate-y-0.5" strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <p className="ledger-eyebrow mt-1">The destination guide: stays, months, and the journeys below</p>
          <ul className="mt-4 space-y-2">
            {p.list.map((j) => {
              const sea = j.kind !== "route";
              const ink = sea ? VOLUME_STYLES.voyages.pad : VOLUME_STYLES.overland.pad;
              const Icon = sea ? Anchor : RouteIcon;
              return (
                <li key={j.ledgerId}>
                  <Link href={j.href} className="group flex items-start gap-2.5 text-[15px] leading-snug">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.75} style={{ color: ink }} aria-hidden="true" />
                    <span><span className="group-hover:underline underline-offset-4">{j.title}</span><span className="ledger-muted"> · {j.nights ? `${j.nights} nights · ` : ""}{sea ? "voyage" : "overland route"}</span></span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}
