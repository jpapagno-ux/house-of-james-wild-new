import Link from "next/link";
import { requireTraveler } from "@/lib/booking-live/account";
import { RemoveButton } from "@/components/booking-live/Actions";
import { PathwayChips } from "@/components/pathways/Pathway";
import { pathwayChipsFor } from "@/lib/content/pathways";
import { PATHWAYS_ON, pathwayHref } from "@/lib/content/pathways/flag";
import { favoriteItemType, type FavoriteItemType } from "@/lib/booking-live/validate";

export const metadata = { title: "Saved" };

type Row = { id: string; created_at: string; item_type: FavoriteItemType | null; item_path: string | null; item_title: string | null; property: { slug: string; name: string; country: string | null; legacy_cms_id: string } | null };
type StayRow = { id: string; created_at: string; property: Row["property"] };

const KIND: Record<FavoriteItemType, string> = { ship: "Ships", voyage: "Voyages", safari: "Safaris", route: "Overland routes" };
const ORDER: FavoriteItemType[] = ["ship", "voyage", "safari", "route"];

// Everything the traveler has saved: stays, then ships, voyages, safaris and overland routes (James, 18 Nov 2026).
export default async function FavoritesPage() {
  const { sb } = await requireTraveler("/account/favorites");
  const full = await sb.from("favorites")
    .select("id, created_at, item_type, item_path, item_title, property:properties(slug, name, country, legacy_cms_id)")
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  // Before the favorites_ledger_items migration is applied the item columns do not exist: fall back to stays alone.
  let data: Row[] | null = full.data;
  if (full.error) {
    const stays = await sb.from("favorites").select("id, created_at, property:properties(slug, name, country, legacy_cms_id)").order("created_at", { ascending: false }).returns<StayRow[]>();
    data = (stays.data ?? []).map((r) => ({ ...r, item_type: null, item_path: null, item_title: null }));
  }
  const all = data ?? [];
  const stays = all.filter((r) => r.property);
  // A saved page is linked only if its path still reads as a savable Ledger page.
  const items = all.filter((r) => !r.property && r.item_path && r.item_title && favoriteItemType(r.item_path) === r.item_type);
  return (
    <section>
      <h1 className="ledger-display text-[2rem] md:text-[2.4rem]">Saved</h1>
      {stays.length === 0 && items.length === 0 ? (
        <p className="mt-4 text-[17px] max-w-xl">Nothing saved yet. On any stay, ship, voyage, safari or route in the Ledger, choose <em>Save to My Folio</em> and it lands here. <Link href="/stays" className="ledger-crimson underline">Browse stays</Link> or <Link href="/voyages" className="ledger-crimson underline">browse voyages</Link>.</p>
      ) : (
        <>
          {stays.length > 0 && (
            <>
              <h2 className="ledger-eyebrow mt-8">Stays</h2>
              <ul className="mt-3 divide-y ledger-rule border-y ledger-rule">
                {stays.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-4 py-4">
                    <div>
                      <Link href={`/stays/${r.property!.slug}`} className="ledger-display text-[20px] hover:ledger-crimson">{r.property!.name}</Link>
                      <p className="text-[13px] ledger-muted">{r.property!.country ?? "The Ledger"} · {r.property!.legacy_cms_id}</p>
                      {/* Wild Pathways (Phase 2E): a saved stay carries its approved pathway chips; nothing is stored, the chips come from the Ledger export by slug. */}
                      {PATHWAYS_ON && (() => { const c = pathwayChipsFor(r.property!.slug); return c ? <div className="mt-2"><PathwayChips primary={c.primary} secondary={c.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div> : null; })()}
                    </div>
                    <RemoveButton path={`/api/v1/me/favorites/${r.id}`} />
                  </li>
                ))}
              </ul>
            </>
          )}
          {ORDER.map((kind) => {
            const list = items.filter((r) => r.item_type === kind);
            return list.length === 0 ? null : (
              <div key={kind}>
                <h2 className="ledger-eyebrow mt-8">{KIND[kind]}</h2>
                <ul className="mt-3 divide-y ledger-rule border-y ledger-rule">
                  {list.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-4 py-4">
                      <Link href={r.item_path!} className="ledger-display text-[20px] hover:ledger-crimson">{r.item_title}</Link>
                      <RemoveButton path={`/api/v1/me/favorites/${r.id}`} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}
