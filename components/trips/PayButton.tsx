"use client";
import { useState } from "react";
import { FLAGS } from "@/lib/booking-live/flags";
import { api } from "@/components/booking-live/client";

// Pay the next amount due on a booking. The server decides the amount (the
// outstanding deposit, then the balance) and opens the gateway's checkout;
// this button only carries the booking id. Hidden while the payments flag is
// off, so bookings read exactly as before until the gateway is connected.
export default function PayButton({ bookingId, label }: { bookingId: string; label: string }) {
  const [state, setState] = useState<"idle" | "busy" | "off" | "error">("idle");
  const [msg, setMsg] = useState("");
  if (!FLAGS.payments) return null;
  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" disabled={state === "busy"} className="ledger-btn ledger-btn--solid disabled:opacity-50" onClick={async () => {
        setState("busy"); setMsg("");
        const r = await api<{ url: string }>(`/api/v1/me/bookings/${bookingId}/pay`, "POST", {});
        if (r.ok) { window.location.href = r.data.url; return; }
        setState(r.code === "feature_off" ? "off" : "error"); setMsg(r.message);
      }}>{state === "busy" ? "Opening secure payment…" : label}</button>
      {msg && <span className="text-[13px] ledger-muted">{msg}</span>}
    </span>
  );
}
