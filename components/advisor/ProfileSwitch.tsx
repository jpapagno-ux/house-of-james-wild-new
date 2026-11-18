"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";

// The advisor's own profile controls (James, 18 Nov 2026): show or hide my profile, and "away until".
// Hiding is at once; showing again goes to the house. Away keeps them listed with their return date.
export default function ProfileSwitch({ visible, requested, awayUntil, houseMessage }: { visible: boolean; requested: boolean; awayUntil: string | null; houseMessage: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [date, setDate] = useState(awayUntil ?? "");
  async function send(body: Record<string, unknown>, done: string) {
    setBusy(true); setMsg(null);
    const r = await api("POST", "/api/v1/advisor/profile", body);
    setBusy(false);
    setMsg(r.ok ? done : r.message);
    if (r.ok) router.refresh();
  }
  const state = visible ? "On the site" : requested ? "Waiting for the house" : "Off the site";
  return (
    <div className="bg-white border ledger-border p-5 md:p-6 grid gap-5">
      {houseMessage && <p className="text-[14.5px] border-l-2 border-house pl-3">From the house: {houseMessage}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="ledger-eyebrow">Your profile</p>
          <p className="ledger-display text-[1.4rem] mt-1">{state}</p>
          <p className="text-[13.5px] ledger-muted mt-1 max-w-md">{visible ? "Your card, your page and your Bearing matches show on the site." : requested ? "You asked to show your profile again. The house will approve it shortly." : "Your card, page and matches are hidden. Your clients and bookings are untouched."}</p>
        </div>
        <button type="button" role="switch" aria-checked={visible || requested} disabled={busy || requested}
          onClick={() => send({ visible: !visible }, visible ? "Your profile comes off the site within a few minutes." : "Sent to the house to approve.")}
          className={`relative inline-flex h-11 w-20 shrink-0 items-center border transition-colors disabled:opacity-60 ${visible ? "bg-[#1A1816] border-[#1A1816]" : "bg-white ledger-border"}`}>
          <span className="sr-only">Show my profile</span>
          <span className={`inline-block h-8 w-8 transition-transform ${visible ? "translate-x-10 bg-white" : "translate-x-1.5 bg-[#CFC8BF]"}`} aria-hidden="true" />
        </button>
      </div>
      <div className="border-t ledger-rule pt-4 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-[13px] ledger-muted">Away until
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white border ledger-border px-3 h-11 text-[15px] text-[#1A1816]" />
        </label>
        <button type="button" disabled={busy || !date} onClick={() => send({ awayUntil: date }, "Your card now shows your return date.")} className="house-chip h-11 px-4 border border-[#2E2B28] disabled:opacity-50">Set</button>
        {awayUntil && <button type="button" disabled={busy} onClick={() => { setDate(""); send({ awayUntil: null }, "Welcome back. The return date is off your card."); }} className="house-chip h-11 px-4 border ledger-border">I&rsquo;m back</button>}
        <p className="basis-full text-[13px] ledger-muted">Travellers still see you, with the date you are back; the house answers in the meantime.</p>
      </div>
      {msg && <p role="status" className="text-[14px]">{msg}</p>}
    </div>
  );
}
