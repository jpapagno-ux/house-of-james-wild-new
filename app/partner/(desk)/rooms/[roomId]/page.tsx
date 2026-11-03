import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDesk } from "@/lib/platform/membership";
import { portfolio } from "@/lib/platform/queries";
import { isUuid } from "@/lib/platform/validate";
import { ROOM_CATEGORY_LABEL, ROOM_FIELDS } from "@/lib/platform/rooms";
import { DataList, Notice, PageHead } from "@/components/platform/ui";
import { ContentEditor, type EditorField } from "@/components/platform/ContentEditor";
import { RoomRequestForm } from "@/components/platform/RoomRequestForm";

// One room: what the house holds, and a place to propose the details (an editor approves each).
export const dynamic = "force-dynamic";
export const metadata = { title: "Room · Partner Desk", robots: { index: false, follow: false } };

const asText = (v: unknown) => (Array.isArray(v) ? v.join("\n") : v == null ? "" : String(v));

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  if (!isUuid(roomId)) notFound();
  const desk = await requireDesk(`/partner/rooms/${roomId}`);
  const { data: room } = await desk.sb.from("room_types").select("*").eq("id", roomId).maybeSingle();
  if (!room) notFound();
  const entities = await portfolio(desk);
  const prop = entities.find((e) => e.id === room.property_id);
  if (!prop) notFound(); // not one of this partner's properties (or not this person's)
  const { data: open } = await desk.sb.from("revisions").select("field").eq("target_table", "room_types").eq("target_id", roomId).in("status", ["proposed", "asked"]);
  const pending = new Set((open ?? []).map((r) => r.field as string));
  const fields: EditorField[] = ROOM_FIELDS.map((f) => ({
    key: f.key, label: f.label, kind: f.kind, max: f.max, help: f.help, start: asText((room as Record<string, unknown>)[f.key]), pending: pending.has(f.key),
    choices: f.choices?.map((c) => ({ value: c, label: (ROOM_CATEGORY_LABEL[c] ?? c).replace(/s$/, "") })),
  }));

  return (
    <div>
      <PageHead eyebrow={`Rooms · ${prop.name}`} title={room.name}
        lead="Change what's out of date and send it; an editor checks each detail before it reaches the website."
        actions={<Link href="/partner/rooms" className="ledger-btn-ghost">All rooms</Link>} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="max-w-3xl">
          {desk.membership ? <ContentEditor fields={fields} endpoint="/api/v1/partner/rooms" target={{ roomId }} /> : (
            <Notice>You&rsquo;re viewing as the house. Partners propose room details here; you decide them in the review queue.</Notice>
          )}
        </div>
        <aside className="grid gap-4 content-start">
          <div className="bg-white border ledger-border p-5">
            <p className="ledger-eyebrow mb-2">Name and occupancy</p>
            <DataList rows={[["Name", room.name], ["Adults", room.max_adults ?? "—"], ["Children", room.max_children ?? "—"], ["Sleeps", room.max_occupancy ?? "—"]]} />
            <p className="mt-3 text-[13px] ledger-muted">These come from the rates system, so they change by request.</p>
            {desk.membership && <div className="mt-3"><RoomRequestForm properties={[{ id: prop.id, name: prop.name }]} room={{ id: room.id, name: room.name, propertyId: prop.id, adults: room.max_adults, children: room.max_children }} /></div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
