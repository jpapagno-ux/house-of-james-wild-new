import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HubSection } from "@/components/hub/Hub";
import { stayBySlug } from "@/lib/content/stays";
import { PHOTO_CREDIT } from "@/lib/content/stay-media";
import { volumeInk } from "@/lib/volumes";
import { SHIPS, shipPath } from "@/lib/content/ships";

// "Stay on the islands" on the Galápagos hub (James, 2 Nov 2026): the two land stays on Santa Cruz, and the
// land-then-sea pairing from the Galápagos review (a few nights at Galapagos Safari Camp or Pikaia Lodge,
// then a yacht that boards at Baltra, the airport both lodges use). Ships are listed only where one of their
// own published routes starts at Baltra; Ecoventura boards at San Cristóbal, so its yachts go first instead.
// A stay shows only once its library record is live on the site.

const STAYS = ["galapagos-safari-camp", "pikaia-lodge"];

export default function IslandStays() {
  const stays = STAYS.map((s) => stayBySlug(s)).filter((s): s is NonNullable<typeof s> => !!s);
  if (!stays.length) return null;
  const ink = volumeInk("stays");
  const galapagos = SHIPS.filter((e) => e.waters === "galapagos");
  const fromBaltra = galapagos.filter((e) => e.data.itineraries.some((i) => /^Baltra/i.test(i.direction)));
  // Only ships whose published routes say where they start (Monserrat's are not readable, so she is in neither list).
  const fromSanCristobal = galapagos.filter((e) => !fromBaltra.includes(e) && e.data.itineraries.some((i) => i.days.length && /^San Crist/i.test(i.direction)));
  const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0] ?? "");
  return (
    <HubSection eyebrow="Stay on the islands" title="Where Can You Stay on Land Before or After a Yacht?" id="island-stays-h">
      <p className="text-[16px] leading-relaxed max-w-3xl">Two lodges in the highlands of Santa Cruz, both reached from Baltra, where {fromBaltra.length} of the {galapagos.length} Galápagos ships here have routes that start. Spend a few nights on land among the giant tortoises, then step aboard; or end the trip there.</p>
      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {stays.map((s) => (
          <li key={s.slug}>
            <Link href={`/stays/${s.slug}`} className="group h-full flex flex-col border ledger-border bg-paper hover:border-crimson/60" style={{ borderTopColor: ink, borderTopWidth: 3 }}>
              <span className="relative aspect-[16/10] bg-paper-card overflow-hidden">{s.hero && <Image src={s.hero} alt={`${s.name}, Santa Cruz, Galápagos`} fill sizes="(min-width: 768px) 45vw, 92vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />}</span>
              <span className="p-4 flex flex-col flex-1">
                <span className="ledger-eyebrow" style={{ color: ink }}>Stay · Santa Cruz highlands</span>
                <span className="ledger-display text-[22px] mt-1 leading-snug">{s.name}</span>
                {s.tagline && <span className="mt-1.5 text-[14.5px] ledger-muted leading-snug">{s.tagline}</span>}
                <span className="mt-auto pt-3 inline-flex items-center gap-1.5 text-[14px]" style={{ color: ink }}>See the stay<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12px] ledger-muted">Photographs: {stays.map((s) => PHOTO_CREDIT[s.slug] ?? s.name).join(", ")}.</p>
      <div className="mt-8 border-l-2 border-crimson pl-4 max-w-3xl">
        <p className="ledger-eyebrow ledger-crimson">Land, then sea</p>
        <p className="mt-1.5 text-[16px] leading-relaxed">Three or four nights at {list(stays.map((s) => s.name))}, then a yacht that boards at Baltra: {list(fromBaltra.map((e) => e.data.name))} each have routes that start there.{fromSanCristobal.length ? ` ${list(fromSanCristobal.map((e) => e.data.name))} board at San Cristóbal instead, so the lodge comes after the cruise, with a flight or boat back to Santa Cruz that James checks for your dates.` : ""}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
          {fromBaltra.slice(0, 6).map((e) => <Link key={e.slug} href={shipPath(e.slug)} className="inline-flex items-center min-h-[44px] underline underline-offset-4 hover:text-crimson">{e.data.name}</Link>)}
          <Link href="/plan?trip=Galapagos%20land%20and%20sea" className="inline-flex items-center min-h-[44px] ledger-btn-ghost">Plan land and sea with James</Link>
        </p>
      </div>
    </HubSection>
  );
}
