import { TBC } from "@/lib/booking-live/estimates";
import type { AccommodationPricingState, DisplayPrice } from "@/lib/stay-page/contract";
import { formatMoney, pricingStatusLabel, provenanceLine } from "@/lib/stay-page/pricing";

// The traveler-facing price state of one unit. `compact` is the collapsed card
// (a status word and, when live, the lowest per-night figure); the full form
// lists every live option with its provenance. Nothing here ever reads the
// legacy reference rate: it is not on the props.

const TONE = { live: "text-vol-stays", quiet: "text-rust", muted: "ledger-muted" } as const;

export function StatusWord({ state }: { state: AccommodationPricingState }) {
  const { label, tone } = pricingStatusLabel(state);
  return (
    <span className={`ledger-eyebrow inline-flex items-center gap-1.5 ${TONE[tone]}`}>
      {tone === "live" && <span className="w-1.5 h-1.5 rounded-full bg-vol-stays" aria-hidden="true" />}
      {label}
    </span>
  );
}

function Figure({ p, size = "text-2xl" }: { p: DisplayPrice; size?: string }) {
  const per = p.perNight ?? p.total;
  return (
    <span>
      <span className={`ledger-display ${size}`}>{formatMoney(per.amount, per.currency)}</span>
      <span className="ledger-eyebrow ml-1.5">/ night</span>
    </span>
  );
}

export default function AccommodationPricingStatus({ state, compact = false }: { state: AccommodationPricingState; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-end justify-between gap-3">
        <StatusWord state={state} />
        {state.kind === "live" && state.options[0] && <Figure p={state.options[0]} size="text-xl" />}
        {state.kind === "rate_card" && <span className="text-right"><span className="ledger-eyebrow mr-1.5">From</span><Figure p={state.from} size="text-xl" />{state.from.estimate && <span className="block ledger-eyebrow !text-[10.5px]">{TBC}</span>}</span>}
      </div>
    );
  }
  return (
    <div aria-live="polite">
      <StatusWord state={state} />
      {state.kind === "checking" && <p className="mt-2 text-[15px] ledger-muted">Asking the booking engine for your dates…</p>}
      {state.kind === "live" && (
        <ul className="mt-3 divide-y divide-[rgba(45,42,38,0.16)] border-y ledger-border">
          {state.options.map((o) => (
            <li key={o.label} className="py-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div><p className="text-[15px]">{o.label}</p><p className="text-[12.5px] ledger-muted">{provenanceLine(o.provenance)}</p></div>
              <p className="text-right"><Figure p={o} />{o.nights && <span className="block text-[12.5px] ledger-muted">{formatMoney(o.total.amount, o.total.currency)} for {o.nights} {o.nights === 1 ? "night" : "nights"}, before the property&rsquo;s taxes</span>}</p>
            </li>
          ))}
        </ul>
      )}
      {state.kind === "rate_card" && (
        <div className="mt-3 border-y ledger-border py-3">
          <p><span className="ledger-eyebrow mr-1.5">From</span><Figure p={state.from} />{state.from.estimate && <span className="ml-2 ledger-eyebrow align-middle">{TBC}</span>}</p>
          <p className="mt-1 text-[12.5px] ledger-muted">{provenanceLine(state.from.provenance, state.from.estimate)}. {state.from.estimate ? "Estimated from the property's published rates while the new rates are finalised; the house confirms the exact price before anything is held or charged." : "A contracted rate is not a free room: the house confirms availability on request."}</p>
        </div>
      )}
      {state.kind === "unavailable_for_dates" && <p className="mt-2 text-[15px]">The engine has nothing open here for those dates. Try other dates, or ask James: he often knows a way in.</p>}
      {state.kind === "request_quote" && <p className="mt-2 text-[15px]">{state.reason === "no_live_rate_for_dates" ? "Not priced by the engine for those dates. The house designs the rate with the property and confirms it with you." : "Priced for you by the house, with the property, and confirmed before anything is booked."}</p>}
      {state.kind === "source_error" && <p className="mt-2 text-[15px]">The booking engine didn&rsquo;t answer just now. Ask James for a quote, or try again in a moment.</p>}
    </div>
  );
}
