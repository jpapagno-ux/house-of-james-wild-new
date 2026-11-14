import Image from "next/image";
import Link from "next/link";
import { PassportStamp } from "@/components/ledger/VolumeKit";
import { stayBySlug } from "@/lib/content/stays";
import type { TimelessVoyage } from "@/lib/content/timeless-voyages";
import type { ShipRecord } from "@/lib/content/ships/types";

// Timeless Voyages · Signature Edition (James, 13 Nov 2026). A reusable section for any ship whose Timeless Voyages row
// carries the Signature Edition stamp: a night band with the stamp and her numbers, her largest suites as full-width
// panels, why she belongs, and Before · Aboard · Beyond (house stay pages only, /stays/<slug>). Every word and picture
// comes from the ship's filed record and her Airtable row; nothing is written here. It never replaces The Exceptional
// Few entrance (ShipPageBody leaves it off those ships). Motion is CSS only and stops for reduced-motion visitors.

const sqm = (size?: string | null) => { const m = (size ?? "").replace(/,/g, "").match(/(\d+)\s*sq m/); return m ? Number(m[1]) : 0; };
const fact = (s: ShipRecord, re: RegExp) => s.facts.find(([k]) => re.test(k))?.[1];

export default function SignatureEdition({ ship, tv, night, ink }: { ship: ShipRecord; tv: TimelessVoyage; night: string; ink: string }) {
  const numbers = ([["Suites", fact(ship, /^(suites|cabins)$/i)?.split(",")[0]], ["Guests", fact(ship, /^guests$/i)], ["Guest to staff", fact(ship, /guest to (staff|crew)/i)], ["Length", fact(ship, /^length$/i)?.split(" (")[0]]] as [string, string | undefined][]).filter((x): x is [string, string] => !!x[1]);
  // Her signature suites: the largest with a picture, biggest first (at most four).
  const suites = ship.cabins.filter((c) => c.image && sqm(c.size) >= 140).sort((a, b) => sqm(b.size) - sqm(a.size)).slice(0, 4);
  const why = tv.whyItBelongs.length ? tv.whyItBelongs : ship.why.slice(0, 4);
  const stays = (slugs: string[]) => slugs.map((s) => stayBySlug(s)).filter((s): s is NonNullable<typeof s> => !!s);
  const before = stays(tv.before), beyond = stays(tv.beyond);
  const mark = ship.gallery.find((g) => /night/i.test(g.alt)) ?? ship.gallery[0] ?? ship.hero;
  const deep = `color-mix(in srgb, ${night} 82%, #000)`;
  return (
    <section id="signature-edition" aria-labelledby="signature-edition-title" className="jw-sig relative left-1/2 w-screen -translate-x-1/2 mt-12 md:mt-16 text-white" style={{ background: `linear-gradient(180deg, ${night}, ${deep})` }}>
      <style>{`
        .jw-sig-rise { animation: jw-sig-rise 1.1s cubic-bezier(.2,.7,.2,1) both; }
        @supports (animation-timeline: view()) { .jw-sig-rise { animation-timeline: view(); animation-range: entry 0% entry 55%; } }
        @keyframes jw-sig-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .jw-sig-ken { animation: jw-sig-ken 26s ease-in-out infinite alternate; }
        @keyframes jw-sig-ken { from { transform: scale(1.02); } to { transform: scale(1.1); } }
        @media (prefers-reduced-motion: reduce) { .jw-sig-rise, .jw-sig-ken { animation: none; } }
      `}</style>

      {/* The night band: her picture under a tint, the stamp, the line and the numbers */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Image src={mark.url} alt="" fill sizes="100vw" className="object-cover jw-sig-ken opacity-45" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${night} 0%, transparent 38%, ${deep} 100%)` }} />
        </div>
        <div className="relative max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-24 grid md:grid-cols-[auto_1fr] gap-8 md:gap-14 items-center">
          <div className="jw-sig-rise justify-self-start" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.55)) drop-shadow(0 0 10px rgba(0,0,0,.35))" }}>
            <PassportStamp volume="voyages" top="Timeless Voyages" date="Signature" place="Edition" size={150} rotate={-4} ink={ink} />
          </div>
          <div className="jw-sig-rise">
            <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: ink }}>Timeless Voyages · Signature Edition</p>
            <h2 id="signature-edition-title" className="ledger-display mt-3 text-[2rem] leading-[1.08] md:text-[3.25rem] max-w-3xl">{ship.name}</h2>
            <p className="ledger-display italic mt-4 text-[1.15rem] md:text-[1.4rem] leading-snug max-w-2xl opacity-90">{tv.heroLine ?? ship.tagline}</p>
          </div>
        </div>
        {numbers.length > 0 && (
          <dl className="relative max-w-ledger mx-auto px-5 md:px-10 pb-12 md:pb-16 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
            {numbers.map(([k, v]) => (
              <div key={k} className="jw-sig-rise border-t pt-4" style={{ borderColor: "rgba(255,255,255,.28)" }}>
                <dd className="ledger-display text-[1.9rem] md:text-[2.6rem] leading-none">{v.replace(/^Up to /, "")}</dd>
                <dt className="mt-2 text-[10.5px] tracking-[0.22em] uppercase opacity-75">{k}</dt>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Her signature suites, edge to edge */}
      {suites.length > 0 && (
        <div className="max-w-ledger mx-auto px-5 md:px-10 pb-4">
          <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: ink }}>The signature suites</p>
          <div className="mt-6 grid gap-5 md:gap-6 md:grid-cols-2">
            {suites.map((c, i) => (
              <a key={c.type} href="#cabins" className={`jw-sig-rise group relative block overflow-hidden rounded-sm ${i === 0 ? "md:col-span-2 aspect-[4/3] md:aspect-[21/9]" : "aspect-[4/3]"}`}>
                <Image src={c.image!.url} alt={c.image!.alt} fill sizes={i === 0 ? "100vw" : "(min-width: 768px) 50vw, 100vw"} className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:transform-none" />
                <span className="absolute inset-0" aria-hidden="true" style={{ background: `linear-gradient(180deg, transparent 35%, ${deep} 100%)` }} />
                <span className="absolute left-5 right-5 bottom-5 md:left-7 md:bottom-6">
                  <span className="ledger-display block text-[1.5rem] md:text-[2rem] leading-tight">{c.type}</span>
                  <span className="mt-1 block text-[13.5px] opacity-90">{c.size}</span>
                </span>
                <span className="absolute right-3 top-3 text-[10px] tracking-[0.14em] uppercase px-2 py-1 rounded-sm" style={{ background: "rgba(0,0,0,.45)" }}>{c.image!.credit}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-ledger mx-auto px-5 md:px-10 py-12 md:py-16 grid gap-12 md:grid-cols-2">
        {why.length > 0 && (
          <div className="jw-sig-rise">
            <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: ink }}>Why she belongs</p>
            <ul className="mt-5 space-y-4">
              {why.map((x) => <li key={x} className="border-l pl-4 text-[16px] leading-relaxed" style={{ borderColor: ink }}>{x}</li>)}
            </ul>
          </div>
        )}
        {(before.length > 0 || beyond.length > 0) && (
          <div className="jw-sig-rise">
            <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: ink }}>Before · Aboard · Beyond</p>
            <dl className="mt-5 space-y-5 text-[16px]">
              {before.length > 0 && <div><dt className="text-[10.5px] tracking-[0.22em] uppercase opacity-70">Before you sail</dt><dd className="mt-1">{before.map((s, i) => <span key={s.slug}>{i > 0 && ", "}<Link href={`/stays/${s.slug}`} className="underline underline-offset-4">{s.name}</Link></span>)}</dd></div>}
              <div><dt className="text-[10.5px] tracking-[0.22em] uppercase opacity-70">Aboard</dt><dd className="mt-1"><a href="#cabins" className="underline underline-offset-4">{ship.name}: her suites</a>, <a href="#dates" className="underline underline-offset-4">her sailings</a></dd></div>
              {beyond.length > 0 && <div><dt className="text-[10.5px] tracking-[0.22em] uppercase opacity-70">Beyond the voyage</dt><dd className="mt-1">{beyond.map((s, i) => <span key={s.slug}>{i > 0 && ", "}<Link href={`/stays/${s.slug}`} className="underline underline-offset-4">{s.name}</Link></span>)}</dd></div>}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
