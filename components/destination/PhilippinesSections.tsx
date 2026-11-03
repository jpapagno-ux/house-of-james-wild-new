import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/ledger/JsonLd";
import { staysIn, pageReady, type StayData } from "@/lib/content/stays";
import { recordHref } from "@/lib/ledger/urls";
import { volumeInk } from "@/lib/volumes";
import { absoluteUrl } from "@/lib/seo";
import { registryShip, registryHref } from "@/lib/content/ships/registry";
import { APPROX, CORAL_TRIANGLE_ROUTE, DIVE_FLAGS, FOUNDER_LINE, GATEWAYS, ISLAND_GROUPS, PALAWAN_ROUTE, PRIVATE_ISLANDS } from "@/lib/content/philippines";

// The Philippines' own chapters (James, 2 Nov 2026): the founder advisor, the dive flags, where to stay island by
// island, the private islands, the gateway hotels, the Palawan route (El Nido, TAO to Coron, a private island) and
// the neighbours across the Coral Triangle. Stays that are not yet released are left out, never shown as empty.

function StayRow({ s }: { s: StayData }) {
  const approx = !s.coords && APPROX[s.slug];
  return (
    <li className="grid grid-cols-[88px_1fr] gap-4 items-start border-t ledger-border pt-4">
      <div className="relative aspect-square overflow-hidden bg-paper-card">{s.hero && <Image src={s.hero} alt={`${s.name}, Philippines`} fill sizes="88px" className="object-cover" />}</div>
      <div>
        <Link href={recordHref("stay", s.slug)} className="ledger-display text-[1.15rem] leading-snug hover:underline">{s.name}</Link>
        {s.ledgerId && <span className="ml-2 font-mono text-[11px] ledger-crimson">{s.ledgerId}</span>}
        {s.tagline && <p className="mt-1 text-[14.5px] leading-relaxed ledger-muted">{s.tagline}</p>}
        {approx && <p className="mt-1 text-[12.5px] ledger-muted italic">On the map at {approx.where}, approximate</p>}
      </div>
    </li>
  );
}

export default function PhilippinesSections() {
  const all = staysIn("philippines").filter(pageReady);
  const bySlug = (slug: string) => all.find((s) => s.slug === slug);
  const pick = (slugs: string[]) => slugs.map(bySlug).filter((s): s is StayData => !!s);
  const ink = volumeInk("stays");
  const tao = registryShip("tao-philippines");
  const taoHref = tao ? registryHref(tao) : null;
  const routeSchema = {
    "@context": "https://schema.org", "@type": "TouristTrip", name: "Palawan: El Nido, TAO to Coron, and a private island",
    description: "A James Wild & Co route through northern Palawan: El Nido and Bacuit Bay, four days by bangka with TAO Philippines to Coron, then a private island.",
    url: absoluteUrl("/destinations/asia/philippines#palawan-route"),
    itinerary: { "@type": "ItemList", itemListElement: PALAWAN_ROUTE.map((r) => ({ "@type": "ListItem", position: r.step, name: r.title, description: r.line })) },
  };

  return (
    <>
      {/* The founder advisor */}
      <section id="founder" className="mt-16 md:mt-24 border-t ledger-rule pt-8 grid md:grid-cols-[1fr_1.4fr] gap-8 items-center" aria-labelledby="founder-heading">
        <div>
          <p className="ledger-eyebrow ledger-crimson">Your advisor for the Philippines</p>
          <h2 id="founder-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">James Papagno, Founder</h2>
        </div>
        <div>
          <p className="ledger-display italic text-xl md:text-2xl leading-snug">{FOUNDER_LINE}</p>
          <p className="mt-3 text-[16px] leading-relaxed ledger-muted">James plans the Philippines himself: which islands suit your month, how the flights and boats connect, and where to sleep on each.</p>
          <Link href="/plan?destination=philippines" className="mt-5 inline-block ledger-btn">Plan the Philippines with James</Link>
        </div>
      </section>

      {/* Dive flags, one line each */}
      <section id="diving" className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="dive-heading">
        <p className="ledger-eyebrow ledger-crimson">Dive flags on the map</p>
        <h2 id="dive-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Where the Reefs Are</h2>
        <p className="mt-3 text-[15.5px] ledger-muted max-w-3xl">One line each, from the Department of Tourism and UNESCO. Positions on the map are approximate; Tubbataha and the Underground River sit at their UNESCO points. Stays near good diving say so on their own pages.</p>
        <ul className="mt-6 grid md:grid-cols-2 gap-x-10 gap-y-4">
          {DIVE_FLAGS.map((d) => (
            <li key={d.name} className="flex gap-3 border-t ledger-border pt-3">
              <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true" className="mt-1 shrink-0"><rect width="18" height="14" fill="#8B2525" /><path d="M0 0 L18 14" stroke="#FFFFFF" strokeWidth="3" /></svg>
              <div><p className="ledger-display text-[1.1rem]">{d.name} <span className="text-[13px] ledger-muted">· {d.where}</span></p><p className="text-[14.5px] leading-relaxed ledger-muted">{d.line} <span className="italic">({d.source})</span></p></div>
            </li>
          ))}
        </ul>
      </section>

      {/* Where to stay, island by island */}
      <section id="by-island" style={{ borderTopColor: ink }} className="mt-16 md:mt-24 border-t-2 pt-8" aria-labelledby="island-heading">
        <p className="ledger-eyebrow" style={{ color: ink }}>Where to stay</p>
        <h2 id="island-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">The Philippines, Island by Island</h2>
        <div className="mt-8 grid lg:grid-cols-2 gap-x-12 gap-y-12">
          {ISLAND_GROUPS.map((g) => { const list = pick(g.slugs); if (!list.length) return null; return (
            <div key={g.key}>
              <h3 className="ledger-display text-2xl">{g.name}</h3>
              <p className="mt-1 text-[14.5px] ledger-muted">{g.line}</p>
              <ul className="mt-4 space-y-4">{list.map((s) => <StayRow key={s.slug} s={s} />)}</ul>
            </div>
          ); })}
        </div>
      </section>

      {/* Private islands */}
      {pick(PRIVATE_ISLANDS).length > 0 && (
        <section id="private-islands" className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="private-heading">
          <p className="ledger-eyebrow" style={{ color: ink }}>A Place of Our Own</p>
          <h2 id="private-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Private Islands</h2>
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pick(PRIVATE_ISLANDS).map((s) => (
              <li key={s.slug}>
                <Link href={recordHref("stay", s.slug)} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper-card">{s.hero && <Image src={s.hero} alt={`${s.name}, Philippines`} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.02] transition-transform" />}</div>
                  <p className="mt-3 ledger-display text-[1.2rem]">{s.name}</p>
                  {s.tagline && <p className="text-[14px] ledger-muted leading-relaxed">{s.tagline}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The Palawan route */}
      <section id="palawan-route" className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="route-heading">
        <p className="ledger-eyebrow ledger-crimson">A route the house draws</p>
        <h2 id="route-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Palawan: El Nido, by Bangka to Coron, Then a Private Island</h2>
        <ol className="mt-8 relative border-l-2 ledger-border ml-3 space-y-10">
          {PALAWAN_ROUTE.map((r) => { const list = pick(r.stays); return (
            <li key={r.step} className="pl-8 relative">
              <span className="absolute -left-[15px] top-0 w-7 h-7 rounded-full bg-ink text-paper text-[13px] flex items-center justify-center font-mono">{r.step}</span>
              <p className="ledger-eyebrow ledger-muted">{r.where}</p>
              <h3 className="ledger-display text-2xl mt-1">{r.title}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed max-w-3xl">{r.line}</p>
              {r.voyage && taoHref && <Link href={taoHref} className="mt-3 inline-block text-[13px] uppercase tracking-[0.16em] border-b border-ink/40 hover:border-ink">Open TAO Philippines</Link>}
              {list.length > 0 && <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">{list.map((s) => <li key={s.slug}><Link href={recordHref("stay", s.slug)} className="ledger-display text-[1.05rem] hover:underline" style={{ color: ink }}>{s.name}</Link></li>)}</ul>}
            </li>
          ); })}
        </ol>
        <JsonLd data={routeSchema} />
      </section>

      {/* Gateway hotels */}
      {pick(GATEWAYS.map((g) => g.slug)).length > 0 && (
        <section id="gateways" className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="gateway-heading">
          <p className="ledger-eyebrow" style={{ color: ink }}>First and last nights</p>
          <h2 id="gateway-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Gateway Hotels</h2>
          <ul className="mt-6 grid md:grid-cols-3 gap-x-8 gap-y-4">
            {GATEWAYS.map((g) => { const s = bySlug(g.slug); if (!s) return null; return (
              <li key={g.slug} className="border-t ledger-border pt-3">
                <p className="ledger-eyebrow ledger-muted">{g.city}</p>
                <Link href={recordHref("stay", s.slug)} className="ledger-display text-[1.15rem] hover:underline">{s.name}</Link>
                <p className="text-[14.5px] ledger-muted">{g.line}</p>
              </li>
            ); })}
          </ul>
        </section>
      )}

      {/* Across the Coral Triangle */}
      <section id="neighbours" className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="neighbours-heading">
        <p className="ledger-eyebrow ledger-crimson">Across the water</p>
        <h2 id="neighbours-heading" className="ledger-display text-[1.6rem] md:text-3xl mt-2">Indonesia and Thailand, Next Door</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/destinations/asia/indonesia" className="inline-block border ledger-border px-5 py-3 text-[12px] uppercase tracking-[0.18em] hover:border-ink">Indonesia</Link>
          <Link href="/destinations/asia/thailand" className="inline-block border ledger-border px-5 py-3 text-[12px] uppercase tracking-[0.18em] hover:border-ink">Thailand</Link>
          {CORAL_TRIANGLE_ROUTE && <Link href={CORAL_TRIANGLE_ROUTE.href} className="inline-block border ledger-border px-5 py-3 text-[12px] uppercase tracking-[0.18em] hover:border-ink">{CORAL_TRIANGLE_ROUTE.title}</Link>}
        </div>
      </section>
    </>
  );
}
