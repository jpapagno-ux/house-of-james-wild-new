"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";
import { CURRENCIES } from "@/lib/platform/commercial";
import { OFFER_TYPES } from "@/lib/platform/rate-proposals";

// Rates & offers (D-08): three ways to send rates, all proposals the house loads into Airtable.
const input = "mt-1 w-full bg-white border ledger-border px-2.5 py-1.5 text-[14.5px]";
const lab = "block text-[12.5px] ledger-muted";
type Opt = { id: string; name: string };

function useSend(after: () => void) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function send(method: "POST" | "PATCH", url: string, body: unknown, done: string) {
    setBusy(true); setMsg(null);
    const r = await api(method, url, body);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setMsg({ ok: true, text: done }); after(); router.refresh();
  }
  return { busy, msg, send };
}
const Msg = ({ m }: { m: { ok: boolean; text: string } | null }) => (m ? <p role={m.ok ? "status" : "alert"} className={`text-[14px] ${m.ok ? "text-[#11705A]" : "text-house"}`}>{m.text}</p> : null);
const DONE = "Sent. The house loads it into the rates system and you'll see it here as Loaded.";

export function SendRates({ propertyId, rooms, sheets, currency }: { propertyId: string; rooms: Opt[]; sheets: Opt[]; currency: string }) {
  const [mode, setMode] = useState<"" | "rate_sheet" | "seasonal" | "offer">("");
  const close = () => setMode("");
  const { busy, msg, send } = useSend(close);
  const blank = () => ({ roomId: rooms[0]?.id ?? "", season: "", stayStart: "", stayEnd: "", nightly: "", minNights: "", basis: "per_room" });
  const [rows, setRows] = useState([blank(), blank(), blank()]);
  const [cur, setCur] = useState(currency);
  const [offerRooms, setOfferRooms] = useState<string[]>([]);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {([["rate_sheet", "Send a rate sheet"], ["seasonal", "Enter seasonal rates"], ["offer", "Propose an offer"]] as const).map(([k, l]) => (
          <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(mode === k ? "" : k)} className="house-chip">{l}</button>
        ))}
      </div>
      <Msg m={msg} />

      {mode === "rate_sheet" && (
        <form className="bg-white border ledger-border p-4 grid gap-3 sm:grid-cols-3" noValidate onSubmit={(e) => { e.preventDefault(); send("POST", "/api/v1/partner/rates", { propertyId, kind: "rate_sheet", ...Object.fromEntries(new FormData(e.currentTarget).entries()) }, DONE); }}>
          <label className={`${lab} sm:col-span-3`}>Rate sheet
            <select name="documentId" required defaultValue="" className={input}>
              <option value="" disabled>{sheets.length ? "Choose from your documents" : "Upload it under Documents first (as a rate sheet)"}</option>
              {sheets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
          <label className={lab}>Valid from<input name="validFrom" type="date" className={input} /></label>
          <label className={lab}>Valid to<input name="validTo" type="date" className={input} /></label>
          <label className={lab}>Currency<select name="currency" defaultValue={currency} className={input}>{CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}</select></label>
          <label className={`${lab} sm:col-span-3`}>Note for the house<input name="note" maxLength={2000} className={input} placeholder="2027 STO rates, net of commission" /></label>
          <div className="sm:col-span-3 flex gap-4"><button disabled={busy} className="ledger-btn">{busy ? "Sending" : "Send the rate sheet"}</button><button type="button" onClick={close} className="ledger-btn-ghost">Cancel</button></div>
        </form>
      )}

      {mode === "seasonal" && (
        <form className="bg-white border ledger-border p-4 grid gap-3" noValidate onSubmit={(e) => { e.preventDefault(); const note = String(new FormData(e.currentTarget).get("note") ?? ""); send("POST", "/api/v1/partner/rates", { propertyId, kind: "seasonal", currency: cur, rows, note }, DONE); }}>
          <p className="text-[13.5px] ledger-muted">One line per room and season: the gross (sell) rate per night. Leave a line empty to skip it.</p>
          <label className={`${lab} max-w-[10rem]`}>Currency<select value={cur} onChange={(e) => setCur(e.target.value)} className={input}>{CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}</select></label>
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] min-w-[760px]">
              <thead><tr className="text-left ledger-muted text-[12px]"><th className="font-normal pb-1">Room</th><th className="font-normal">Season</th><th className="font-normal">First night</th><th className="font-normal">Last night</th><th className="font-normal">Per night</th><th className="font-normal">Basis</th><th className="font-normal">Min nights</th></tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const set = (k: string, v: string) => setRows(rows.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
                  return (
                    <tr key={i} className="align-top">
                      <td className="pr-2 py-1"><select aria-label={`Line ${i + 1} room`} value={r.roomId} onChange={(e) => set("roomId", e.target.value)} className={input}>{rooms.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></td>
                      <td className="pr-2 py-1"><input aria-label={`Line ${i + 1} season`} value={r.season} onChange={(e) => set("season", e.target.value)} className={input} placeholder="High" /></td>
                      <td className="pr-2 py-1"><input aria-label={`Line ${i + 1} first night`} type="date" value={r.stayStart} onChange={(e) => set("stayStart", e.target.value)} className={input} /></td>
                      <td className="pr-2 py-1"><input aria-label={`Line ${i + 1} last night`} type="date" value={r.stayEnd} onChange={(e) => set("stayEnd", e.target.value)} className={input} /></td>
                      <td className="pr-2 py-1"><input aria-label={`Line ${i + 1} per night`} inputMode="decimal" value={r.nightly} onChange={(e) => set("nightly", e.target.value)} className={input} /></td>
                      <td className="pr-2 py-1"><select aria-label={`Line ${i + 1} basis`} value={r.basis} onChange={(e) => set("basis", e.target.value)} className={input}><option value="per_room">Per room</option><option value="per_person">Per person sharing</option></select></td>
                      <td className="py-1"><input aria-label={`Line ${i + 1} minimum nights`} inputMode="numeric" value={r.minNights} onChange={(e) => set("minNights", e.target.value)} className={input} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => setRows([...rows, blank()])} className="ledger-btn-ghost justify-self-start">Add a line</button>
          <label className={lab}>Note for the house<input name="note" maxLength={2000} className={input} placeholder="Includes all meals and two activities a day" /></label>
          <div className="flex gap-4"><button disabled={busy} className="ledger-btn">{busy ? "Sending" : "Send these rates"}</button><button type="button" onClick={close} className="ledger-btn-ghost">Cancel</button></div>
        </form>
      )}

      {mode === "offer" && (
        <form className="bg-white border ledger-border p-4 grid gap-3 sm:grid-cols-2" noValidate onSubmit={(e) => {
          e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget).entries());
          send("POST", "/api/v1/partner/rates", { propertyId, kind: "offer", currency, note: f.note, offer: { ...f, rooms: offerRooms } }, DONE);
        }}>
          <label className={`${lab} sm:col-span-2`}>Offer, as guests will read it<input name="label" required maxLength={120} className={input} placeholder="Worth another night: stay 4, pay 3" /></label>
          <label className={lab}>Kind<select name="type" defaultValue="stay_pay" className={input}>{Object.entries(OFFER_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className={lab}>Value (%, amount, or the N in stay N)<input name="value" inputMode="decimal" className={input} /></label>
          <label className={lab}>Stays from<input name="stayStart" type="date" required className={input} /></label>
          <label className={lab}>Stays until<input name="stayEnd" type="date" required className={input} /></label>
          <label className={lab}>Book from (optional)<input name="bookStart" type="date" className={input} /></label>
          <label className={lab}>Book by (optional)<input name="bookEnd" type="date" className={input} /></label>
          <label className={lab}>Minimum nights<input name="minNights" inputMode="numeric" className={input} /></label>
          <fieldset className="sm:col-span-2"><legend className={lab}>Rooms (none chosen means every room)</legend>
            <div className="mt-1 flex flex-wrap gap-2">{rooms.map((o) => <button key={o.id} type="button" aria-pressed={offerRooms.includes(o.id)} onClick={() => setOfferRooms(offerRooms.includes(o.id) ? offerRooms.filter((x) => x !== o.id) : [...offerRooms, o.id])} className="house-chip">{o.name}</button>)}</div>
          </fieldset>
          <label className={`${lab} sm:col-span-2`}>Terms<textarea name="terms" rows={2} maxLength={1000} className={input} placeholder="Not combinable with other offers; blackout 20 Dec to 5 Jan" /></label>
          <label className={`${lab} sm:col-span-2`}>Note for the house<input name="note" maxLength={2000} className={input} /></label>
          <div className="sm:col-span-2 flex gap-4"><button disabled={busy} className="ledger-btn">{busy ? "Sending" : "Send the offer"}</button><button type="button" onClick={close} className="ledger-btn-ghost">Cancel</button></div>
        </form>
      )}
    </div>
  );
}

export function ProposalActions({ id, house, mine }: { id: string; house: boolean; mine: boolean }) {
  const { busy, msg, send } = useSend(() => {});
  return (
    <span className="flex flex-wrap items-center gap-3">
      {house && <button type="button" disabled={busy} onClick={() => { const card = window.prompt("Which Airtable card did it go into? e.g. 2027-V1") ?? ""; if (card.trim()) send("PATCH", `/api/v1/partner/rates/${id}`, { status: "loaded", airtableCard: card }, "Marked loaded."); }} className="ledger-btn-ghost">Mark loaded</button>}
      {house && <button type="button" disabled={busy} onClick={() => { const note = window.prompt("Why is it going back? The partner sees this note.") ?? ""; if (note.trim()) send("PATCH", `/api/v1/partner/rates/${id}`, { status: "returned", reviewNote: note }, "Returned."); }} className="ledger-btn-ghost">Return</button>}
      {!house && mine && <button type="button" disabled={busy} onClick={() => send("PATCH", `/api/v1/partner/rates/${id}`, { status: "withdrawn" }, "Withdrawn.")} className="ledger-btn-ghost">Withdraw</button>}
      <Msg m={msg} />
    </span>
  );
}
