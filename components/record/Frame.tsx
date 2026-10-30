import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, Phone } from "lucide-react";
import LedgerChart, { projectOn, type ChartData } from "@/components/destination/LedgerChart";
import { SITE } from "@/lib/site";
import type { Img } from "./Sections";

// The record frame: the parts every record page (stay, reserve, voyage,
// residence) opens and closes with, so the four templates share one order:
//   hero + glance bar → in short → photos → why we chose it → [core] →
//   offer → experiences → features → location → conservation → host →
//   practical / FAQ → more from the brand.

/* Glance bar: the first things a traveller looks for, in the hero ------------ */
export type Glance = {
  price?: { amount: string; basis: string };
  facts?: [string, string][];
  cta?: { label: string; href: string };
  photos?: number;
};

export function GlanceBar({ glance }: { glance: Glance }) {
  return (
    <div className="relative bg-paper text-ink border ledger-border shadow-[0_10px_40px_rgba(0,0,0,0.25)] grid grid-cols-2 md:grid-cols-[auto_1fr_auto] items-stretch">
      {glance.price && (
        <div className="col-span-2 md:col-span-1 px-5 md:px-7 py-4 border-b md:border-b-0 md:border-r ledger-rule">
          <p className="ledger-eyebrow">From</p>
          <p className="ledger-display text-3xl ledger-crimson leading-none mt-1">{glance.price.amount}</p>
          <p className="text-[12px] ledger-muted mt-1">{glance.price.basis}</p>
        </div>
      )}
      <dl className="col-span-2 md:col-span-1 grid grid-cols-2 md:grid-cols-3 divide-x ledger-rule">
        {glance.facts?.slice(0, 3).map(([k, v], i) => (
          <div key={k} className={`px-5 py-4 ${i === 2 ? "hidden md:block" : ""}`}>
            <dt className="ledger-eyebrow">{k}</dt>
            <dd className="text-[15px] mt-1 leading-snug">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="col-span-2 md:col-span-1 flex items-center gap-3 px-5 py-4 border-t md:border-t-0 md:border-l ledger-rule">
        {glance.photos ? <a href="#gallery" className="ledger-btn-ghost inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] whitespace-nowrap"><Camera className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />{glance.photos} photos</a> : null}
        <Link href={glance.cta?.href || "/plan"} className="ledger-btn ledger-btn--solid whitespace-nowrap">{glance.cta?.label || "Check your dates"}</Link>
      </div>
    </div>
  );
}

/* Photo mosaic, high on the page ------------------------------------------------ */
export function GalleryMosaic({ images, title }: { images: Img[]; title: string }) {
  const [a, ...rest] = images;
  const tiles = rest.slice(0, 4);
  return (
    <section id="gallery" className="mt-14 md:mt-16 scroll-mt-32" aria-label={`Photographs of ${title}`}>
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[460px]">
        <figure className="relative col-span-2 row-span-2 border ledger-border"><Image src={a.url} alt={a.alt} fill sizes="640px" className="object-cover" /></figure>
        {tiles.map((g, i) => (
          <figure key={g.url} className="relative border ledger-border">
            <Image src={g.url} alt={g.alt} fill sizes="320px" className="object-cover" />
            {i === tiles.length - 1 && images.length > 5 && (
              <figcaption className="absolute inset-0 bg-ink/45 text-paper flex items-center justify-center gap-2 ledger-eyebrow !text-paper"><Camera className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> All {images.length} photos</figcaption>
            )}
          </figure>
        ))}
      </div>
      <ul className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-2">
        {images.map((g) => <li key={g.url} className="snap-start shrink-0 w-[82%]"><div className="relative aspect-[4/3] border ledger-border"><Image src={g.url} alt={g.alt} fill sizes="82vw" className="object-cover" /></div></li>)}
      </ul>
    </section>
  );
}

/* Location: Ledger chart + the address block ------------------------------------- */
export function LocationBlock({ chart, name, pin, others = [], heading, rows, note }: { chart: ChartData; name: string; pin: { lat: number; lng: number }; others?: { lat: number; lng: number }[]; heading: string; rows: [string, string][]; note?: string }) {
  const p = projectOn(chart, pin.lat, pin.lng);
  const right = p.x > chart.width * 0.62;
  return (
    <section id="location" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start" aria-labelledby="location-heading">
      <div className="relative border ledger-rule overflow-hidden ledger-chart is-drawn">
        <LedgerChart chart={chart} title={`Where ${name} sits`} />
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
          {others.map((o, i) => { const q = projectOn(chart, o.lat, o.lng); return <circle key={i} cx={q.x} cy={q.y} r="5.5" style={{fill:"var(--jw-accent-hex)"}} fillOpacity="0.28" stroke="#F4F1ED" strokeWidth="1.5" />; })}
          <circle cx={p.x} cy={p.y} r="28" fill="none" style={{stroke:"var(--jw-accent-hex)"}} strokeWidth="2" className="ledger-pin-pulse" />
          <circle cx={p.x} cy={p.y} r="11" style={{fill:"var(--jw-accent-hex)"}} stroke="#F4F1ED" strokeWidth="3" />
          <text x={right ? p.x - 20 : p.x + 20} y={p.y - 20} textAnchor={right ? "end" : "start"} fontFamily="'Cormorant Garamond', serif" fontSize="22" fill="#2D2A26" stroke="#F4F1ED" strokeWidth="4" paintOrder="stroke">{name}</text>
        </svg>
      </div>
      <div>
        <p className="ledger-eyebrow flex items-center gap-2"><MapPin className="w-3.5 h-3.5 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> Location &amp; getting there</p>
        <h2 id="location-heading" className="ledger-display text-[1.75rem] md:text-3xl mt-2">{heading}</h2>
        <dl className="mt-5 border-t ledger-rule text-[15px]">
          {rows.map(([k, v]) => <div key={k} className="py-3 border-b ledger-rule"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-1 leading-relaxed">{v}</dd></div>)}
        </dl>
        {note && <p className="mt-4 text-[13px] ledger-muted">{note}</p>}
      </div>
    </section>
  );
}

/* Phones: the record's own action bar replaces the site bar ------------------------ */
export function RecordActionBar({ price, basis, cta = "Enquire" }: { price?: string; basis?: string; cta?: string }) {
  return (
    <div id="record-bar" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur border-t ledger-border pb-[env(safe-area-inset-bottom)]">
      <div className="h-16 px-4 flex items-center gap-3">
        <div className="mr-auto leading-tight">
          {price ? <><span className="ledger-eyebrow block !text-[9.5px]">From</span><span className="ledger-display text-xl ledger-crimson">{price}</span> <span className="text-[11px] ledger-muted">{basis}</span></> : <span className="ledger-eyebrow">Quoted for your dates</span>}
        </div>
        <a href={`tel:${SITE.phone.tel}`} aria-label="Call the house" className="w-11 h-11 border ledger-border flex items-center justify-center"><Phone className="w-4 h-4" strokeWidth={1.5} /></a>
        <Link href="/plan" className="ledger-btn ledger-btn--solid !h-11">{cta}</Link>
      </div>
    </div>
  );
}
