"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";
import { ROOM_CATEGORIES, ROOM_CATEGORY_LABEL } from "@/lib/platform/rooms";

// A new room, or a new name or occupancy for one: the house loads it into Airtable (D-08).
const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";

export function RoomRequestForm({ properties, room }: { properties: { id: string; name: string }[]; room?: { id: string; name: string; propertyId: string; adults: number | null; children: number | null } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const change = !!room;
  if (!open) return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={() => setOpen(true)} className={change ? "ledger-btn-ghost" : "ledger-btn"}>{change ? "Ask to change the name or occupancy" : "Add a room"}</button>
      {msg && <p role="status" className={`text-[14px] ${msg.ok ? "text-[#11705A]" : "text-house"}`}>{msg.text}</p>}
    </div>
  );
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = { ...Object.fromEntries(new FormData(e.currentTarget).entries()), kind: change ? "change" : "new", roomId: room?.id ?? "", ...(room ? { propertyId: room.propertyId } : {}) };
    setBusy(true); setMsg(null);
    const r = await api<{ reference: string }>("POST", "/api/v1/partner/rooms/request", body);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setMsg({ ok: true, text: `Sent to the house as ${r.data.reference}.` }); setOpen(false); router.refresh();
  }
  return (
    <form onSubmit={send} noValidate className="bg-white border ledger-border p-5 grid gap-4 sm:grid-cols-2">
      <p className="ledger-display text-[1.3rem] sm:col-span-2">{change ? `Change ${room!.name}` : "Add a room"}</p>
      <p className="text-[13.5px] ledger-muted sm:col-span-2">Names, occupancy and new rooms are loaded by the house into the rates system, so the website and the prices always agree. You&rsquo;ll see it in Updates &amp; approvals.</p>
      {!change && (
        <label className={lab}>Property
          <select name="propertyId" required defaultValue={properties.length === 1 ? properties[0].id : ""} className={input}>
            {properties.length !== 1 && <option value="" disabled>Choose</option>}
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}
      <label className={lab}>Name, as guests will see it<input name="name" required maxLength={120} defaultValue={room?.name ?? ""} className={input} /></label>
      {!change && (
        <label className={lab}>Category
          <select name="category" defaultValue="" className={input}><option value="">Choose</option>{ROOM_CATEGORIES.map((c) => <option key={c} value={c}>{ROOM_CATEGORY_LABEL[c].replace(/s$/, "")}</option>)}</select>
        </label>
      )}
      <label className={lab}>Beds<input name="beds" maxLength={120} className={input} placeholder="1 king bed" /></label>
      <label className={lab}>Adults (most)<input name="adults" inputMode="numeric" defaultValue={room?.adults ?? ""} className={input} /></label>
      <label className={lab}>Children (most)<input name="children" inputMode="numeric" defaultValue={room?.children ?? ""} className={input} /></label>
      {!change && <label className={lab}>How many of them<input name="units" inputMode="numeric" className={input} placeholder="e.g. 4" /></label>}
      <label className={`${lab} sm:col-span-2`}>Note for the house<textarea name="note" rows={2} maxLength={2000} className={input} placeholder="Opens 1 March 2027; rates on the 2027 sheet" /></label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button disabled={busy} className="ledger-btn">{busy ? "Sending" : "Send to the house"}</button>
        <button type="button" onClick={() => setOpen(false)} className="ledger-btn-ghost">Cancel</button>
        {msg && <p role="alert" className="text-[14px] text-house">{msg.text}</p>}
      </div>
    </form>
  );
}
