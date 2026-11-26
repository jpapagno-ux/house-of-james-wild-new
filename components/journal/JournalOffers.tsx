import SectionHead from "./SectionHead";
import Stamp from "./Stamp";

// JWC-STYLE-01, Stage 5. Savings: every live offer in one place with its dates and terms. The page passes only
// offers the site's own date rule still counts as live; with none, this section is not rendered at all and no
// saving shows anywhere else on the page.
export type OfferRow = { key: string; eyebrow: string; headline: string; dates?: string | null; terms?: string | null; ref: string; stamp: string };

export default function JournalOffers({ no, name, offers, applyHref }: { no: string; name: string; offers: OfferRow[]; applyHref: string }) {
  if (!offers.length) return null;
  return (
    <section id="offers" aria-label="Offers" className="bg-white">
      <SectionHead no={no} label="Savings · live offers" title={`Offers on ${name}`} lede="Every live offer in one place, with its dates and terms." />
      <ul className="mt-9 space-y-3">
        {offers.map((o) => (
          <li key={o.key} className="grid grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-6 gap-y-4 border border-[color:var(--jw-hairline)] bg-white px-5 py-5">
            <Stamp size={84} top="Offer" main={o.stamp} rotate={-5} label={o.headline} />
            <div className="min-w-0">
              <p className="font-mono text-[9.5px] tracking-[0.24em] uppercase text-house">{o.eyebrow}</p>
              <h3 className="font-display font-medium text-[24px] leading-tight text-graphite mt-1">{o.headline}</h3>
              {o.dates && <p className="mt-1.5 text-[14px] text-graphite">{o.dates}</p>}
              {o.terms && <p className="mt-1 text-[12.5px] leading-relaxed text-stone-text">{o.terms}</p>}
            </div>
            <div className="col-span-2 md:col-span-1 md:text-right">
              <p className="font-mono text-[9.5px] tracking-[0.16em] text-stone-text">{o.ref}</p>
              <a href={applyHref} className="house-chip house-chip--primary mt-2.5 !px-4 !py-2.5 font-semibold !text-[10.5px] tracking-[0.2em] uppercase">Apply to my dates</a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
