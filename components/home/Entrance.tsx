import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME } from "@/lib/content/home";
import { LEDGER_COUNTS } from "@/lib/ledger/counts";
import { REGION_DATA } from "@/lib/content/regions";
import { ADVISORS, initials } from "@/lib/content/advisors";
import { VOLUMES } from "@/lib/site";
import { JwcoSeal } from "@/components/ledger/Marks";
import { Reveal } from "@/components/ledger/Motion";

// The entrance (house chrome, 30 Oct 2026). What a reader meets in the first
// three screens after the film: the Ledger counted, six volumes as one bold
// strip, and the house's stance, founder-led and advisor-built. Server
// rendered; every word and link in the HTML.

const GREEN = "#2F6B3A";

/* 1. The Ledger, counted: one bold band, hairlines, no ticker ------------ */
export function CountedBand() {
  const countries = REGION_DATA.reduce((n, r) => n + r.countries.length, 0);
  const advisors = ADVISORS.filter((a) => a.portrait || a.bio.length).length;
  const cells: [string, string | number, string][] = [
    ["Years exploring", 44, "since 1982"],
    ["Stays", LEDGER_COUNTS.stays, "vetted in person"],
    ["Vessels", LEDGER_COUNTS.vessels, "small ships only"],
    ["Journeys", LEDGER_COUNTS.journeys, "routes and voyages"],
    ["Countries", countries, "ten regions"],
    ["Advisors", advisors, "with a page in the book"],
  ];
  return (
    <section className="ledger-page border-b ledger-rule" aria-label="The Ledger, counted">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <dl className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 divide-y md:divide-y-0 xl:divide-x divide-ink/15">
          {cells.map(([label, value, note], i) => (
            <div key={label} className={`py-8 md:py-10 ${i > 0 ? "xl:pl-8" : ""} ${i < cells.length - 1 ? "xl:pr-8" : ""}`}>
              <dt className="ledger-eyebrow">{label}</dt>
              <dd className="ledger-display text-[3.2rem] md:text-[4rem] leading-none tabular-nums mt-2">{value}</dd>
              <dd className="text-[13px] ledger-muted mt-2">{note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* 2. The stance: a house, founder-led, advisor-built ----------------------- */
export function Stance() {
  const james = ADVISORS.find((a) => a.slug === "james-papagno");
  return (
    <section className="mt-16 md:mt-24" aria-labelledby="stance-heading">
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-20 items-end">
        <div>
          <p className="ledger-eyebrow ledger-crimson">The House of James Wild &amp; Co</p>
          <h2 id="stance-heading" className="ledger-h1 mt-3">A house, not a marketplace.</h2>
          <p className="mt-6 text-[18px] md:text-[20px] leading-relaxed max-w-2xl">
            Forty-four years on the road, written into one Ledger. Nothing is listed that hasn&rsquo;t been slept in, walked or sailed. James vouches for the place. A named advisor vouches for you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="ledger-eyebrow !text-[11px]"><span className="inline-block w-2 h-2 rounded-full bg-crimson mr-2 align-middle" />Founder-led</span>
            <span className="ledger-eyebrow !text-[11px]"><span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: GREEN }} />Advisor-built</span>
            <span className="ledger-eyebrow !text-[11px]"><span className="inline-block w-2 h-2 rounded-full bg-ink/40 mr-2 align-middle" />Ledgered, not crowded</span>
          </div>
        </div>
        <figure className="relative">
          <div className="relative aspect-[4/5] max-w-[420px] lg:ml-auto overflow-hidden bg-paper-card">
            {james?.portrait && <Image src={james.portrait.url} alt={james.portrait.alt} fill sizes="420px" className="object-cover" />}
            <span className="absolute top-3 right-3 bg-paper/95 rounded-full p-1"><JwcoSeal size={64} /></span>
          </div>
          <figcaption className="mt-4 flex items-baseline justify-between gap-4 max-w-[420px] lg:ml-auto">
            <span><span className="ledger-display text-xl">James Papagno</span><span className="block ledger-eyebrow mt-1">Founder &amp; Chief Expedition Officer · goes first</span></span>
            <Link href="/about/founder" className="ledger-btn-ghost whitespace-nowrap">Meet James</Link>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* 3. The six volumes: one bold strip, the hovered volume opens ------------ */
export function VolumeStrip() {
  const europeHero = REGION_DATA.find((r) => r.slug === "europe")?.hero ?? null;
  const doors = [
    ...HOME.volumes.map((v) => ({ key: v.key, name: v.name, brand: v.brand, path: v.path, line: v.line, image: v.image.url, alt: v.image.alt })),
    { key: "europe", name: "Other Europe", brand: "Volume VI", path: "/destinations/europe", line: "Not the capitals and the queues. The valleys, islands and river towns James keeps going back to.", image: europeHero ?? "", alt: "Other Europe" },
  ];
  const tone = (k: string) => VOLUMES.find((v) => v.href === (k === "europe" ? "/destinations/europe" : `/${k}`))?.tone ?? "#8B2525";
  return (
    <section id="volumes" className="mt-16 md:mt-24 scroll-mt-28" aria-labelledby="volumes-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ledger-eyebrow ledger-crimson">The house, in six volumes</p>
          <h2 id="volumes-heading" className="ledger-h2 mt-2">Choose your way in.</h2>
        </div>
        <Link href="/the-ledger" className="ledger-btn-ghost">How the Ledger works</Link>
      </div>
      {/* Desktop: a strip of six; the one under the pointer opens. Phones: stacked. */}
      <ul className="mt-8 md:mt-10 flex flex-col lg:flex-row lg:h-[640px] gap-1.5 px-5 md:px-10 max-w-[1400px] mx-auto">
        {doors.map((d, i) => (
          <li key={d.key} className="group relative overflow-hidden bg-ink text-white lg:flex-1 lg:hover:flex-[3.2] lg:focus-within:flex-[3.2] transition-[flex] duration-700 ease-[cubic-bezier(.22,1,.36,1)] min-h-[260px] lg:min-h-0" style={{ ["--vol" as string]: tone(d.key) }}>
            <Link href={d.path} className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={`Enter ${d.name}`}>
              {d.image && <Image src={d.image} alt={d.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />}
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: "var(--vol)" }} />
              <span className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
                <span className="ledger-eyebrow !text-white/80">Volume {["I", "II", "III", "IV", "V", "VI"][i]}</span>
                <span className="ledger-display text-[2.2rem] lg:text-[2.6rem] leading-none mt-2 lg:[writing-mode:vertical-rl] lg:rotate-180 lg:group-hover:[writing-mode:horizontal-tb] lg:group-hover:rotate-0 lg:absolute lg:left-8 lg:bottom-8 lg:group-hover:static transition-none">{d.name}</span>
                <span className="lg:max-w-md lg:opacity-0 lg:translate-y-3 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition duration-500 delay-150">
                  <span className="block text-[11px] uppercase tracking-[0.14em] mt-2" style={{ color: "var(--vol)", filter: "brightness(1.7)" }}>{d.brand}</span>
                  <span className="block text-[15.5px] text-white/90 leading-relaxed mt-3">{d.line}</span>
                  <span className="mt-5 inline-flex items-center gap-2 ledger-eyebrow !text-[11px] !text-white">Enter {d.name} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* 4. Advisor-forward: run by advisors, for advisors ----------------------- */
export function AdvisorForward() {
  const team = ADVISORS.filter((a) => a.slug !== "james-papagno" && (a.portrait || a.bio.length)).slice(0, 6);
  return (
    <section className="mt-16 md:mt-24 bg-sand" aria-labelledby="advisors-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-14 md:py-20 grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
        <div>
          <p className="ledger-eyebrow" style={{ color: GREEN }}>Advisor-led · Advisor-built</p>
          <h2 id="advisors-heading" className="ledger-h2 mt-2">A host agency run by advisors, for advisors.</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-sand-ink max-w-xl">
            Every journey is carried by a named advisor with a page in the book: the places they&rsquo;ve stayed, marked in green ink beside James&rsquo;s. Travellers get someone who has been. Advisors get a Ledger they can stand behind in front of a client.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/about/team#advisors" className="ledger-btn ledger-btn--solid">Meet the advisors</Link>
            <Link href="/for-advisors" className="ledger-btn">Carry the Ledger</Link>
          </div>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {team.map((a) => (
            <li key={a.slug}>
              <Link href={a.profileHref ?? "/about/team#advisors"} className="group block bg-paper border ledger-border overflow-hidden">
                <span className="relative block aspect-[4/5] bg-paper-card">
                  {a.portrait ? <Image src={a.portrait.url} alt={a.portrait.alt} fill sizes="(min-width: 640px) 220px, 45vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /> : <span className="absolute inset-0 flex items-center justify-center ledger-display text-3xl text-coast-deep">{initials(a.name)}</span>}
                </span>
                <span className="block p-3">
                  <span className="block ledger-display text-[17px] leading-tight">{a.name}</span>
                  <span className="block ledger-eyebrow !text-[9px] mt-1" style={{ color: GREEN }}>{a.role.replace(" · sample", "")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
