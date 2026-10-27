import Link from "next/link";
import { requireTraveler } from "@/lib/booking-live/account";
import { RemoveButton } from "@/components/booking-live/Actions";

export const metadata = { title: "Saved stays" };

type Row = { id: string; created_at: string; property: { slug: string; name: string; country: string | null; legacy_cms_id: string } | null };

export default async function FavoritesPage() {
  const { sb } = await requireTraveler("/account/favorites");
  const { data } = await sb.from("favorites")
    .select("id, created_at, property:properties(slug, name, country, legacy_cms_id)")
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  const rows = (data ?? []).filter((r) => r.property);
  return (
    <section>
      <h1 className="ledger-display text-[2rem] md:text-[2.4rem]">Saved stays</h1>
      {rows.length === 0 ? (
        <p className="mt-4 text-[17px] max-w-xl">Nothing saved yet. On any stay in the Ledger, choose <em>Save to My Folio</em> and it lands here. <Link href="/stays" className="ledger-crimson underline">Browse stays</Link></p>
      ) : (
        <ul className="mt-6 divide-y ledger-rule border-y ledger-rule">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-4 py-4">
              <div>
                <Link href={`/stays/${r.property!.slug}`} className="ledger-display text-[20px] hover:ledger-crimson">{r.property!.name}</Link>
                <p className="text-[13px] ledger-muted">{r.property!.country ?? "The Ledger"} · {r.property!.legacy_cms_id}</p>
              </div>
              <RemoveButton path={`/api/v1/me/favorites/${r.id}`} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
