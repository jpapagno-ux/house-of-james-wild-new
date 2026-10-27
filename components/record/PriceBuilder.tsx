"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { priceTrip, usd, DEPOSIT_PP, TAX_RATE } from "@/lib/pricing";

// The price builder on Journey (Overland) and Voyage pages: option or cabin
// → travellers → add-ons, with the sum shown as you go. "Book now" is shown
// but not live until booking terms and the deposit link are ready; "Contact
// us" is live and carries the selection into the enquiry.

export type PriceOption = { id: string; label: string; pp: number; detail?: string };
export type PriceAddOn = { id: string; label: string; pp: number; detail?: string };

export default function PriceBuilder({ kind, options, addOns, defaultOption, taxRate = TAX_RATE, note, defaultTravellers = 2, maxTravellers = 12, contactHref = "/plan", tripName }: {
  kind: "journey" | "voyage";
  options: PriceOption[];
  addOns: PriceAddOn[];
  defaultOption?: string;
  taxRate?: number;
  note?: string;
  defaultTravellers?: number;
  maxTravellers?: number;
  contactHref?: string;
  tripName: string;
}) {
  const [opt, setOpt] = useState(defaultOption ?? options[0]?.id);
  const [n, setN] = useState(defaultTravellers);
  const [extras, setExtras] = useState<string[]>([]);
  const option = options.find((o) => o.id === opt) ?? options[0];
  const chosen = addOns.filter((a) => extras.includes(a.id));
  const r = useMemo(() => priceTrip({ optionPP: option.pp, addOnsPP: chosen.map((a) => a.pp), travellers: n, taxRate }), [option, chosen, n, taxRate]);
  const unit = kind === "voyage" ? "cabin" : "option";
  const q = new URLSearchParams({ trip: tripName, [unit]: option.label, travellers: String(n), addons: chosen.map((a) => a.label).join(", "), estimate: String(r.total) });

  return (
    <section id="price" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32" aria-labelledby="price-heading">
      <p className="ledger-eyebrow ledger-crimson">Price builder</p>
      <h2 id="price-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Build Your Price</h2>
      <p className="mt-3 text-[15px] ledger-muted max-w-3xl">{note ?? `${kind === "voyage" ? "Price is based on the cabin you select, per person, double occupancy (2)." : "Prices are per person, double occupancy (2)."} Figures are examples until rates are filed.`}</p>

      <div className="mt-8 grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
        <ol className="space-y-8">
          <li>
            <p className="ledger-eyebrow">01 · {kind === "voyage" ? "Choose your cabin" : "Choose your option"}</p>
            <div className="mt-3 grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label={kind === "voyage" ? "Cabin" : "Option"}>
              {options.map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={opt === o.id} onClick={() => setOpt(o.id)} className={`text-left border px-4 py-3 transition-colors ${opt === o.id ? "border-crimson bg-paper-card" : "ledger-border hover:border-crimson/60"}`}>
                  <span className="flex items-baseline justify-between gap-3"><span className="ledger-display text-[17px]">{o.label}</span><span className="ledger-crimson ledger-display">{usd(o.pp)}</span></span>
                  <span className="block text-[12.5px] ledger-muted mt-0.5">per person, double occupancy{o.detail ? ` · ${o.detail}` : ""}</span>
                </button>
              ))}
            </div>
          </li>
          <li>
            <p className="ledger-eyebrow">02 · Travellers</p>
            <div className="mt-3 inline-flex items-center border ledger-border">
              <button type="button" aria-label="One fewer traveller" onClick={() => setN((x) => Math.max(1, x - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-paper-card"><Minus className="w-4 h-4" strokeWidth={1.5} /></button>
              <output aria-live="polite" className="w-14 text-center ledger-display text-xl">{n}</output>
              <button type="button" aria-label="One more traveller" onClick={() => setN((x) => Math.min(maxTravellers, x + 1))} className="w-11 h-11 flex items-center justify-center hover:bg-paper-card"><Plus className="w-4 h-4" strokeWidth={1.5} /></button>
            </div>
          </li>
          {addOns.length > 0 && (
            <li>
              <p className="ledger-eyebrow">03 · Add-ons</p>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {addOns.map((a) => {
                  const on = extras.includes(a.id);
                  return (
                    <button key={a.id} type="button" aria-pressed={on} onClick={() => setExtras((xs) => (on ? xs.filter((x) => x !== a.id) : [...xs, a.id]))} className={`text-left border px-4 py-3 flex gap-3 ${on ? "border-crimson bg-paper-card" : "ledger-border hover:border-crimson/60"}`}>
                      <span className={`mt-1 w-4 h-4 border flex items-center justify-center shrink-0 ${on ? "bg-crimson border-crimson text-paper" : "ledger-border"}`}>{on && <Check className="w-3 h-3" strokeWidth={2.5} />}</span>
                      <span className="flex-1"><span className="flex items-baseline justify-between gap-3"><span className="ledger-display text-[16px]">{a.label}</span><span className="text-[14px]">+{usd(a.pp)} pp</span></span>{a.detail && <span className="block text-[12.5px] ledger-muted mt-0.5">{a.detail}</span>}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          )}
        </ol>

        <aside className="lg:sticky lg:top-[170px] ledger-paper border ledger-border p-6" aria-label="Your price">
          <p className="ledger-eyebrow">Your price</p>
          <dl className="mt-3 text-[14.5px]">
            <div className="flex justify-between py-1.5"><dt>{option.label} × {n}</dt><dd>{usd(option.pp * n)}</dd></div>
            {chosen.map((a) => <div key={a.id} className="flex justify-between py-1.5"><dt>{a.label} × {n}</dt><dd>{usd(a.pp * n)}</dd></div>)}
            <div className="flex justify-between py-1.5 border-t ledger-rule"><dt>Subtotal</dt><dd>{usd(r.subtotal)}</dd></div>
            <div className="flex justify-between py-1.5"><dt>Tax ({Math.round(taxRate * 100)}%)</dt><dd>{usd(r.tax)}</dd></div>
            <div className="flex justify-between py-2 border-t ledger-rule items-baseline"><dt className="ledger-eyebrow">Total</dt><dd className="ledger-display text-3xl ledger-crimson">{usd(r.total)}</dd></div>
            <div className="flex justify-between py-1 text-[13px] ledger-muted"><dt>Per person</dt><dd>{usd(r.perPerson)}</dd></div>
            <div className="flex justify-between py-1.5 border-t ledger-rule mt-2"><dt>Deposit ({usd(DEPOSIT_PP)} × {n})</dt><dd>{usd(r.deposit)}</dd></div>
            <div className="flex justify-between py-1.5"><dt>Balance</dt><dd>{usd(r.balance)}</dd></div>
          </dl>
          <button type="button" aria-disabled="true" disabled className="mt-5 w-full ledger-btn ledger-btn--solid justify-center opacity-50 cursor-not-allowed">Book now · pay the {usd(DEPOSIT_PP)} deposit</button>
          <p className="mt-1.5 text-[12px] ledger-muted text-center">Online booking opens once terms are final.</p>
          <Link href={`${contactHref}?${q.toString()}`} className="mt-3 w-full ledger-btn justify-center" data-event={`${kind}_price_contact`}>Contact us with this price</Link>
        </aside>
      </div>
    </section>
  );
}
