import Link from "next/link";
import { niceDate, requireTraveler } from "@/lib/booking-live/account";
import { NewFolioForm } from "@/components/booking-live/Actions";

export const metadata = { title: "Journeys" };

export default async function FoliosPage() {
  const { sb, user } = await requireTraveler("/account/folios");
  const { data } = await sb.from("folios")
    .select("id, title, destination_summary, start_date, end_date, status, owner_user_id, folio_items(count)")
    .order("updated_at", { ascending: false });
  const folios = data ?? [];
  return (
    <section className="grid gap-8">
      <div>
        <h1 className="ledger-display text-[2rem] md:text-[2.4rem]">Journeys</h1>
        <p className="mt-2 text-[16px] ledger-muted max-w-2xl">Each journey gathers stays, notes and ideas for one trip. Share it with the people going with you.</p>
      </div>
      {folios.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {folios.map((f) => {
            const n = (f.folio_items as unknown as { count: number }[])?.[0]?.count ?? 0;
            const dates = [niceDate(f.start_date), niceDate(f.end_date)].filter(Boolean).join(" → ");
            return (
              <li key={f.id}>
                <Link href={`/account/folios/${f.id}`} className="block border ledger-rule p-5 hover:bg-paper-card h-full">
                  <p className="ledger-eyebrow">{f.owner_user_id === user.id ? f.status : "Shared with you"}</p>
                  <p className="ledger-display text-[22px] mt-1">{f.title}</p>
                  {f.destination_summary && <p className="text-[15px] mt-1">{f.destination_summary}</p>}
                  <p className="text-[13px] ledger-muted mt-2">{n} {n === 1 ? "item" : "items"}{dates ? ` · ${dates}` : ""}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <NewFolioForm />
    </section>
  );
}
