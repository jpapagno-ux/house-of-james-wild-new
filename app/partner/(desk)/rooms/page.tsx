import Link from "next/link";
import { requireDesk } from "@/lib/platform/membership";
import { portfolio } from "@/lib/platform/queries";
import { ROOM_CATEGORY_LABEL } from "@/lib/platform/rooms";
import { Empty, LedgerId, PageHead } from "@/components/platform/ui";
import { RoomRequestForm } from "@/components/platform/RoomRequestForm";

// Rooms & Accommodation (Stage 2 §3.2): every property's rooms by category, how complete each is,
// and the way in to propose details or ask for a new room.
export const dynamic = "force-dynamic";
export const metadata = { title: "Rooms & Accommodation · Partner Desk", robots: { index: false, follow: false } };

type Room = { id: string; property_id: string; name: string; unit_type: string | null; bed_configuration: string | null; size_sqm: number | null; max_occupancy: number | null; included: string[] | null; excluded: string[] | null; features: string[] | null; full_description: string | null; short_description: string | null };
const DETAILS: (keyof Room)[] = ["unit_type", "bed_configuration", "size_sqm", "short_description", "full_description", "features", "included", "excluded"];
const filled = (r: Room) => DETAILS.filter((k) => { const v = r[k]; return Array.isArray(v) ? v.length > 0 : v != null && v !== ""; }).length;

export default async function Rooms() {
  const desk = await requireDesk("/partner/rooms");
  const entities = await portfolio(desk);
  const ids = entities.map((e) => e.id);
  const [{ data: rooms }, { data: open }] = await Promise.all([
    ids.length ? desk.sb.from("room_types").select("id, property_id, name, unit_type, bed_configuration, size_sqm, max_occupancy, included, excluded, features, full_description, short_description").in("property_id", ids).eq("active", true).order("sort_order", { nullsFirst: false }).order("name") : Promise.resolve({ data: [] }),
    ids.length ? desk.sb.from("revisions").select("target_id").eq("target_table", "room_types").in("status", ["proposed", "asked"]).in("property_id", ids) : Promise.resolve({ data: [] }),
  ]);
  const waiting = new Set(((open ?? []) as { target_id: string }[]).map((r) => r.target_id));
  const byProp = new Map<string, Room[]>();
  for (const r of (rooms ?? []) as Room[]) byProp.set(r.property_id, [...(byProp.get(r.property_id) ?? []), r]);
  const withRooms = entities.filter((e) => byProp.has(e.id));
  const without = entities.filter((e) => !byProp.has(e.id));

  return (
    <div>
      <PageHead eyebrow="Rooms & Accommodation" title="Your rooms, villas and suites"
        lead="What each room is, what it sleeps and what the rate includes. Bring a room up to date, or ask the house to add one." />
      {desk.membership && <div className="mt-8"><RoomRequestForm properties={entities.map((e) => ({ id: e.id, name: e.name }))} /></div>}
      {withRooms.length === 0 && <div className="mt-8"><Empty title="No rooms on file yet">Add your first room above and the house will load it.</Empty></div>}
      {withRooms.map((e) => {
        const list = byProp.get(e.id)!;
        const cats = [...new Set(list.map((r) => r.unit_type ?? "room"))];
        return (
          <section key={e.id} className="mt-10">
            <h2 className="flex flex-wrap items-baseline gap-3 border-b ledger-rule pb-2"><span className="ledger-display text-[1.5rem]">{e.name}</span><LedgerId id={e.legacy_cms_id} /><span className="ml-auto text-[13px] ledger-muted">{list.length} {list.length === 1 ? "room" : "rooms"}</span></h2>
            {cats.map((c) => (
              <div key={c} className="mt-4">
                <p className="ledger-eyebrow mb-1">{ROOM_CATEGORY_LABEL[c] ?? c}</p>
                <ul className="divide-y divide-ink/10 border-y ledger-border">
                  {list.filter((r) => (r.unit_type ?? "room") === c).map((r) => {
                    const f = filled(r);
                    return (
                      <li key={r.id}>
                        <Link href={`/partner/rooms/${r.id}`} className="group grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-center hover:bg-[#F7F5F2] -mx-3 px-3">
                          <span><span className="font-medium group-hover:underline underline-offset-4">{r.name}</span><span className="block text-[13px] ledger-muted">{[r.bed_configuration, r.max_occupancy ? `sleeps ${r.max_occupancy}` : null, r.size_sqm ? `${r.size_sqm} m²` : null].filter(Boolean).join(" · ") || "Details to add"}</span></span>
                          <span className="text-[13px] tabular-nums ledger-muted">{f} of {DETAILS.length} details{waiting.has(r.id) ? " · with the house" : ""}{(r.included?.length ?? 0) === 0 ? " · inclusions missing" : ""}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
      {without.length > 0 && <p className="mt-10 text-[14px] ledger-muted">No rooms on file yet for {without.map((e) => e.name).join(", ")}. Use Add a room to send them.</p>}
    </div>
  );
}
