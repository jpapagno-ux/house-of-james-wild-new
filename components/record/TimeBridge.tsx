"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// Shows the host's local time against the visitor's, and the host's working
// window in the visitor's own hours. Filled in after mount (the server can't
// know the visitor's zone), so nothing mismatches on hydration.
function offsetMin(tz: string, at: Date) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" }).formatToParts(at).find((x) => x.type === "timeZoneName")?.value ?? "GMT";
  const m = p.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0;
}
const hhmm = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), mm = m % 60;
  return `${((h + 11) % 12) + 1}${mm ? `:${String(mm).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
};

export default function TimeBridge({ tz, place, zoneLabel, window = [9, 17] }: { tz: string; place: string; zoneLabel: string; window?: [number, number] }) {
  const [v, setV] = useState<null | { there: string; diff: number; from: string; to: string; dayShift: string }>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const host = offsetMin(tz, now), me = -now.getTimezoneOffset(), diff = host - me;
      const from = window[0] * 60 - diff, to = window[1] * 60 - diff;
      const there = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", weekday: "short" }).format(now);
      const dayShift = from < 0 ? ", the evening before their morning" : to > 1440 ? ", running past your midnight" : "";
      setV({ there, diff, from: hhmm(from), to: hhmm(to), dayShift });
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [tz, window[0], window[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  const h = v ? Math.abs(v.diff) / 60 : 0;
  const ahead = v && v.diff !== 0 ? `${Number.isInteger(h) ? h : h.toFixed(1)} hour${h === 1 ? "" : "s"} ${v.diff > 0 ? "ahead of" : "behind"} you` : "on your time";
  return (
    <div className="border-t ledger-rule pt-4 mt-5">
      <p className="ledger-eyebrow flex items-center gap-2"><Clock className="w-3.5 h-3.5 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> Mind the clocks</p>
      <p className="mt-2 text-[15px] leading-relaxed">
        {place} runs on {zoneLabel}.{" "}
        {v ? <>It&rsquo;s <strong className="font-medium">{v.there}</strong> there now, {ahead}. The host keeps {window[0]}am–{window[1] - 12}pm local; for you that&rsquo;s <strong className="font-medium">{v.from}–{v.to}</strong>{v.dayShift}.</> : <>Your own hours appear here once the page knows your time zone.</>}
      </p>
      <p className="mt-1.5 text-[13px] ledger-muted">Calendly shows every slot in your time zone, so nobody joins at 3am by accident.</p>
    </div>
  );
}
