import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Check, RefreshCcw, Users, X } from "lucide-react";

// Pricing pieces for record pages.
//  OfferCard — a Time Rewarded / Worth Another Night offer (Promotion
//    record), shown only when publish_to_site is on; hides itself after its
//    book-by date. House exclusives carry an extra line.
//  LiveRates — the Tag Albie booking-engine band: the engine's price for a
//    date search, the length-of-stay rate when the engine offers one, a
//    freshness line and a deep link into the engine. In production the band
//    reads a server route with a 15-minute cache; here it renders a fetched
//    snapshot so the layout can be reviewed.

export type Offer = {
  id: string;
  title: string;
  statement: string;
  property: string;
  place: string;
  image: { url: string; alt: string };
  options: { nights: string; title: string; note?: string }[];
  bookBy: string;
  stayThrough: string;
  terms: string;
  included: string[];
  excluded: string[];
  exclusive?: string;
};

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <section id="offer" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="offer-heading">
      <div className="border-2 border-rust/70 bg-rust-wash grid lg:grid-cols-[1fr_1.25fr]">
        <div className="relative min-h-[260px] border-b lg:border-b-0 lg:border-r border-rust/40">
          <Image src={offer.image.url} alt={offer.image.alt} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
          <span className="absolute top-4 left-4 bg-rust text-paper px-3 py-1.5 ledger-eyebrow !text-paper !text-[10.5px]">Time Rewarded</span>
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="ledger-eyebrow !text-rust">Worth Another Night&trade; · {offer.id}</p>
            <p className="ledger-eyebrow">Book by {offer.bookBy}</p>
          </div>
          <h2 id="offer-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-3 leading-tight">{offer.title}</h2>
          <p className="ledger-display italic text-lg mt-2 text-rust">{offer.statement}</p>
          <ul className="mt-5 grid sm:grid-cols-2 gap-3">
            {offer.options.map((o) => (
              <li key={o.nights} className="border border-rust/40 bg-paper p-4">
                <p className="ledger-display text-2xl">{o.nights}</p>
                <p className="text-[15px] mt-0.5">{o.title}</p>
                {o.note && <p className="ledger-eyebrow !text-rust mt-1">{o.note}</p>}
              </li>
            ))}
          </ul>
          {offer.exclusive && (
            <p className="mt-4 border-l-2 border-crimson pl-3 text-[15px]"><span className="ledger-eyebrow ledger-crimson block">Only through James Wild &amp; Co</span>{offer.exclusive}</p>
          )}
          <div className="mt-5 grid sm:grid-cols-2 gap-5 text-[14px]">
            <ul className="space-y-1.5">{offer.included.map((x) => <li key={x} className="flex gap-2"><Check className="w-4 h-4 mt-0.5 shrink-0 text-rust" strokeWidth={1.75} aria-hidden="true" />{x}</li>)}</ul>
            <ul className="space-y-1.5 ledger-muted">{offer.excluded.slice(0, 4).map((x) => <li key={x} className="flex gap-2"><X className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />{x}</li>)}</ul>
          </div>
          <p className="mt-5 text-[12.5px] ledger-muted">{offer.terms}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/plan" className="ledger-btn !border-rust !text-rust hover:!bg-rust hover:!text-paper">Choose your stay &amp; enquire</Link>
            <Link href="/stays/promos" className="text-[15px] underline underline-offset-4 self-center">All offers</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export type LiveSnapshot = {
  property: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  fetchedAt: string;
  engineUrl: string;
  rows: { room: string; plan: string; total: number; note?: string }[];
};

export function LiveRates({ snap }: { snap: LiveSnapshot }) {
  const perNight = (t: number) => t / snap.nights;
  const fmt = (n: number) => `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <section id="live-rates" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="live-heading">
      <p className="ledger-eyebrow">Live rates · booking engine by Tag Albie</p>
      <h2 id="live-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Today&rsquo;s Rate, Live from the Booking Desk</h2>
      <p className="mt-3 text-[16px] ledger-muted max-w-3xl">The booking engine&rsquo;s own price for your dates, refreshed through the house rate desk every 15 minutes. The room list below keeps its published &ldquo;from&rdquo; prices; this band answers &ldquo;what will it cost on my dates&rdquo;.</p>
      <div className="mt-6 border ledger-border bg-paper">
        <form className="flex flex-wrap items-end gap-4 px-5 py-4 border-b ledger-rule bg-paper-card/60" action={snap.engineUrl}>
          <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Check-in</span><input type="date" defaultValue={snap.checkIn} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
          <label className="block"><span className="ledger-eyebrow">Check-out</span><input type="date" defaultValue={snap.checkOut} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
          <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><Users className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Guests</span><select defaultValue={snap.guests} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select></label>
          <button type="button" className="ledger-btn inline-flex items-center gap-2"><RefreshCcw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Update search</button>
          <span className="ml-auto ledger-eyebrow ledger-crimson inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live · fetched {snap.fetchedAt}</span>
        </form>
        <div className="divide-y divide-[rgba(45,42,38,0.16)]">
          {snap.rows.map((r) => (
            <div key={r.plan + r.room} className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 px-5 py-4 items-baseline">
              <div>
                <p className="ledger-display text-xl">{r.room}</p>
                <p className="ledger-eyebrow mt-0.5">{r.plan}</p>
              </div>
              <p className="text-[14px] ledger-muted">{r.note}</p>
              <p className="md:text-right"><span className="ledger-display text-xl">{fmt(perNight(r.total))}</span> <span className="ledger-eyebrow">/ night</span></p>
              <p className="md:text-right text-[14px] ledger-muted">{fmt(r.total)} for {snap.nights} nights</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t ledger-rule flex flex-wrap items-center gap-4">
          <a href={snap.engineUrl} className="ledger-btn inline-flex items-center gap-2" data-event="booking_outbound">Check live rates for your dates <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></a>
          <p className="text-[13px] ledger-muted max-w-xl">{snap.guests} guests · {snap.nights} nights · excluding taxes and fees; 7% Florida sales tax is added at booking. Dynamic pricing changes with dates, occupancy and season; the house confirms every quote before anything is booked.</p>
        </div>
      </div>
    </section>
  );
}
