import Link from "next/link";
import { Plane } from "lucide-react";
import { type ArrivalHub, type Transfer, KIND_LABEL, hubLabel, transferLine } from "@/lib/content/arrivals";
import type { StayData } from "@/lib/content/stays";

// Getting there — Stage 5 (Last Mile). Rendered only from APPROVED Ledger
// records: the hubs a stay's airport text maps to, and the transfer legs the
// house has on record. A leg with no stated time says so; nothing on this
// section is ever estimated. The stay's own airport line (from its page in the
// Ledger) stays on the map block; this is the house's structured answer.
export default function GettingThere({ name, hubs, transfers, gateway, idBase = "getting-there" }: {
  name: string;
  hubs: ArrivalHub[];
  transfers: (Transfer & { hub: ArrivalHub })[];
  gateway?: { hub: ArrivalHub; stay: StayData } | null;
  idBase?: string;
}) {
  if (!hubs.length) return null;
  const legFor = (h: ArrivalHub) => transfers.find((t) => t.hub.id === h.id) ?? null;
  // A hub with a recorded leg to this stay leads; the rest keep the Ledger's order (airports first).
  const ordered = [...hubs].sort((a, b) => Number(!!legFor(b)?.minutes) - Number(!!legFor(a)?.minutes) || Number(!!legFor(b)) - Number(!!legFor(a)));
  return (
    <section id={idBase} className="mt-16 md:mt-24 border-t ledger-rule pt-8 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby={`${idBase}-heading`}>
      <p className="ledger-eyebrow ledger-crimson flex items-center gap-2"><Plane className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Getting there</p>
      <h2 id={`${idBase}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">The Way In to {name}</h2>
      <dl className="mt-6 border-t ledger-rule">
        {ordered.map((h) => {
          const leg = legFor(h);
          const line = leg ? transferLine(leg) : null;
          return (
            <div key={h.id} className="py-3.5 border-b ledger-rule grid md:grid-cols-[1fr_1.4fr] gap-x-8 gap-y-1">
              <dt>
                <span className="ledger-display text-[17px] block leading-snug">{hubLabel(h)}</span>
                <span className="text-[12.5px] ledger-muted">{KIND_LABEL[h.kind]}{h.city && h.city !== h.name ? ` · ${h.city}` : ""}{h.country ? `, ${h.country}` : ""}{h.ledgerId ? ` · ${h.ledgerId}` : ""}</span>
              </dt>
              <dd className="text-[15px] leading-relaxed">
                {line
                  ? <>From here, {line}, as stated by the property{leg?.ledgerId ? <span className="ledger-muted"> · {leg.ledgerId}</span> : null}.</>
                  : leg
                    ? <>The house has this route on record but no stated time yet; James arranges the car with your booking.</>
                    : <>The transfer time from here is not yet on record; the house never estimates it. James arranges arrival and the car with your booking.</>}
                {h.houseNotes && <span className="block mt-1 text-[14px]">{h.houseNotes}</span>}
                {h.sourceUrl && <span className="block mt-1 text-[12.5px] ledger-muted">Source: <a href={h.sourceUrl} rel="nofollow noopener" target="_blank" className="underline underline-offset-2 hover:text-crimson">{new URL(h.sourceUrl).hostname.replace(/^www\./, "")}</a>{h.factChecked ? `, checked ${h.factChecked}` : ""}</span>}
              </dd>
            </div>
          );
        })}
      </dl>
      {gateway && (
        <p className="mt-5 text-[15px] leading-relaxed">
          Most journeys here begin or end with a night near {hubLabel(gateway.hub)}: the house books <Link href={`/stays/${gateway.stay.slug}`} className="underline underline-offset-2 hover:text-crimson">{gateway.stay.name}</Link> for the first or last night.
        </p>
      )}
      <p className="mt-4 text-[13px] ledger-muted">Arrival hubs and transfer times come from the James Wild &amp; Co Ledger, each recorded from the operator&rsquo;s own site and dated. Where a time is missing, it hasn&rsquo;t been recorded yet; the house doesn&rsquo;t guess.</p>
    </section>
  );
}
