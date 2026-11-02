import Link from "next/link";
import { requireDesk } from "@/lib/platform/membership";
import { health, portfolio, requests } from "@/lib/platform/queries";
import { ENTITY_TYPE, PUBLICATION, niceDate } from "@/lib/platform/labels";
import { VOLUME_STYLES, volumeInk, type VolumeKey } from "@/lib/volumes";
import { Empty, LedgerId, PageHead, StatusPill } from "@/components/platform/ui";

export const metadata = { title: "My Portfolio" };

const ORDER: VolumeKey[] = ["stays", "safaris", "gatherings", "voyages", "overland", "europe"];

export default async function Portfolio() {
  const desk = await requireDesk("/partner/portfolio");
  const [entities, open] = await Promise.all([portfolio(desk), requests(desk, { open: true })]);
  const h = await health(desk, entities);
  const parentName = new Map(entities.map((e) => [e.id, e.name]));
  const groups = ORDER.map((k) => ({ k, list: entities.filter((e) => (e.volume_key ?? "stays") === k) })).filter((g) => g.list.length);
  return (
    <div>
      <PageHead eyebrow="My Portfolio" title="Your entries in the Ledger"
        lead="Every property, lodge and residence the house files for you, by volume. Open one to see what the house holds, answer its requests, or propose a change." />
      {groups.length === 0 && <div className="mt-8"><Empty title="No entries yet">The house connects your properties to the desk. Ask your James Wild &amp; Co contact if one is missing.</Empty></div>}
      {groups.map(({ k, list }) => (
        <section key={k} className="mt-10" aria-labelledby={`vol-${k}`}>
          <h2 id={`vol-${k}`} className="flex items-baseline gap-3 border-b-2 pb-2" style={{ borderColor: volumeInk(k) }}>
            <span className="ledger-eyebrow" style={{ color: volumeInk(k) }}>Vol. {VOLUME_STYLES[k].roman}</span>
            <span className="ledger-display text-[1.5rem]">{k === "europe" ? "The Other Europe" : VOLUME_STYLES[k].label}</span>
            <span className="ml-auto text-[13px] ledger-muted">{list.length}</span>
          </h2>
          <ul className="divide-y divide-ink/10">
            {list.map((e) => {
              const score = h.get(e.id)?.score ?? 0, reqs = open.filter((r) => r.property_id === e.id).length;
              const pub = PUBLICATION[e.publication_status] ?? PUBLICATION.draft;
              return (
                <li key={e.id}>
                  <Link href={`/partner/portfolio/${e.legacy_cms_id}`} className="group grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center hover:bg-paper-card -mx-3 px-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="ledger-display text-[1.3rem] leading-tight group-hover:underline underline-offset-4 decoration-1">{e.name}</span>
                        <LedgerId id={e.legacy_cms_id} />
                      </p>
                      <p className="text-[13.5px] ledger-muted mt-1">
                        {[e.entity_type ? ENTITY_TYPE[e.entity_type] : null, e.entity_kind, e.destination?.name, e.country, e.parent_property_id ? `within ${parentName.get(e.parent_property_id) ?? "its reserve"}` : null].filter(Boolean).join(" · ")}
                      </p>
                      <p className="text-[12.5px] ledger-muted mt-1">Last verified {niceDate(e.last_verified_at)}{reqs ? ` · ${reqs} open request${reqs === 1 ? "" : "s"}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-3 sm:justify-end">
                      <StatusPill {...pub} />
                      <span className="text-[13px] tabular-nums border ledger-border px-2 py-[3px]" aria-label={`Health ${score}%`}>{score}%</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
