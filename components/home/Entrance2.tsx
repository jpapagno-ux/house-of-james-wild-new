import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME } from "@/lib/content/home";
import { ADVISORS, initials } from "@/lib/content/advisors";
import { PATHWAYS } from "@/lib/pathways";
import { VOLUMES } from "@/lib/site";
import { LEDGER_COUNTS } from "@/lib/ledger/counts";
import { GUARD_ON, isBuilt } from "@/lib/routes";
import { JwcoSeal } from "@/components/ledger/Marks";

// The home page, second pass (James, 30 Oct 2026): what travellers get, the
// six volumes explained, how the house vets, the conservation stance, the
// Wild Pathways, and the advisors as a scroll at the foot with James first.
// James himself stays on /about/founder. Server rendered.

const GREEN = "#2F6B3A";

/* What travellers get that a booking site can't ---------------------------- */
export function ForTravellers() {
  const promises: [string, string, string][] = [
    ["Vetted before you go", "Nothing is listed that hasn't been slept in, walked or sailed. Every entry carries the mark, the year, and a permanent Ledger ID.", "/the-ledger"],
    ["A named advisor, start to Folio", "One person carries your journey from the first call to the Folio on your shelf. Not a queue, not a form.", "/about/team#advisors"],
    ["Fewer bases, longer stays", "Three nights as standard, and Worth Another Night offers that reward slowing down. Time is the luxury you can't add later.", "/stays/promos"],
    ["Your own advisor is welcome", "Already work with someone? The house plans alongside them, from the same Ledger, at the same rates.", "/for-advisors"],
  ];
  return (
    <section className="mt-16 md:mt-24" aria-labelledby="for-heading">
      <div className="max-w-3xl">
        <p className="ledger-eyebrow ledger-crimson">For travellers</p>
        <h2 id="for-heading" className="ledger-h1 mt-3">What you get that a booking site can&rsquo;t.</h2>
      </div>
      <ul className="mt-10 grid md:grid-cols-2 xl:grid-cols-4 gap-px bg-ink/15 border border-ink/15">
        {promises.map(([t, l, href], i) => {
          const ok = !GUARD_ON || isBuilt(href);
          return (
            <li key={t} className="bg-paper p-6 md:p-7 flex flex-col">
              <span className="ledger-display text-[2.4rem] leading-none ledger-crimson">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="ledger-display text-[1.5rem] leading-tight mt-4">{t}</h3>
              <p className="mt-3 text-[15.5px] ledger-muted leading-relaxed flex-1">{l}</p>
              {ok && <Link href={href} className="mt-5 inline-flex items-center gap-2 text-[14px] hover:ledger-crimson hover:gap-3 transition-all">More <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* Under the strip: the volumes explained, how we vet, conservation --------- */
export function HouseUnderStrip() {
  const rules = HOME.standard.rules;
  const st = HOME.stewards;
  const counts: Record<string, string> = { "/stays": `${LEDGER_COUNTS.stays} stays`, "/voyages": `${LEDGER_COUNTS.vessels} vessels`, "/overland": `${LEDGER_COUNTS.journeys} journeys` };
  return (
    <section className="mt-16 md:mt-24 border-t ledger-rule pt-10 md:pt-14 grid lg:grid-cols-3 gap-10 lg:gap-12" aria-label="The volumes, the vetting and the conservation">
      <div>
        <p className="ledger-eyebrow ledger-crimson">Six volumes, one Ledger</p>
        <h2 className="ledger-h2 mt-2">Every place, filed where it belongs.</h2>
        <ul className="mt-6 divide-y ledger-border border-t border-b ledger-border">
          {VOLUMES.map((v, i) => (
            <li key={v.href}>
              <Link href={v.href} className="group flex items-baseline gap-4 py-3.5 hover:ledger-crimson">
                <span className="ledger-eyebrow w-7 shrink-0" style={v.tone ? { color: v.tone } : undefined}>{["I", "II", "III", "IV", "V", "VI"][i]}</span>
                <span className="min-w-0"><span className="ledger-display text-[1.25rem]">{v.label}</span>{counts[v.href] && <span className="ledger-eyebrow ml-2">{counts[v.href]}</span>}<span className="block text-[14px] ledger-muted leading-snug mt-0.5">{v.intro}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="ledger-eyebrow ledger-crimson">{HOME.standard.eyebrow}</p>
        <h2 className="ledger-h2 mt-2">How a place gets in.</h2>
        <ol className="mt-6 space-y-5">
          {rules.map(([t, l], i) => (
            <li key={t} className="flex gap-4">
              <span className="ledger-display text-[1.6rem] leading-none ledger-crimson w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span><span className="ledger-display text-[1.2rem] leading-tight">{t}</span><span className="block text-[14.5px] ledger-muted leading-relaxed mt-1">{l}</span></span>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-crimson" />James&rsquo;s mark, oxblood</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: GREEN }} />The advisor&rsquo;s mark, green</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-dashed border-ink/50" />Pencilled, awaiting a visit</span>
        </p>
        <Link href="/the-ledger" className="ledger-btn-ghost mt-6 inline-block">How the Ledger works</Link>
      </div>
      <div className="relative bg-forest text-paper p-7 md:p-8 flex flex-col overflow-hidden">
        <Image src={st.image.url} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-30" />
        <span className="absolute inset-0 bg-gradient-to-t from-forest via-forest/80 to-forest/40" aria-hidden="true" />
        <div className="relative flex flex-col flex-1">
          <p className="ledger-eyebrow !text-forest-light">{st.eyebrow}</p>
          <h2 className="ledger-h2 mt-2">{st.line}</h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-paper/85">{st.text}</p>
          <p className="mt-4 text-[14px] leading-relaxed text-paper/75">Fewer bases and longer stays mean fewer transfers and lighter footprints. The reserves, conservancies and small ships in the Ledger are chosen for the land and water they keep, and the people who live beside it.</p>
          <Link href={st.cta.href} className="mt-auto pt-6 inline-flex items-center gap-2 ledger-eyebrow !text-[11px] !text-paper hover:gap-3 transition-all">{st.cta.label} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></Link>
          <p className="mt-3 ledger-eyebrow !text-[9px] !text-paper/55">{st.caption}</p>
        </div>
      </div>
    </section>
  );
}

/* Wild Pathways: travel by what you're after ------------------------------- */
export function PathwaysBand() {
  const built = !GUARD_ON || isBuilt("/pathways");
  const list = Object.values(PATHWAYS);
  return (
    <section className="mt-16 md:mt-24" aria-labelledby="pathways-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="ledger-eyebrow ledger-crimson">Wild Pathways</p>
          <h2 id="pathways-heading" className="ledger-h2 mt-2">Or travel by what you&rsquo;re after.</h2>
          <p className="mt-3 text-[16px] ledger-muted max-w-xl">The volumes say where. The Pathways say what for: every entry in the Ledger is filed under the kind of journey it serves, so a wellness stay in the Alentejo and a hot spring in Montana sit on the same page.</p>
        </div>
        {built && <Link href="/pathways" className="ledger-btn-ghost">All pathways</Link>}
      </div>
      <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {list.map((p) => {
          const href = built ? `/pathways/${p.key}` : `/plan?q=${encodeURIComponent(p.name)}`;
          return (
            <li key={p.id}>
              <Link href={href} className="group block h-full p-5 border transition-colors" style={{ background: p.tint, borderColor: `${p.accent}33` }}>
                <span className="ledger-eyebrow" style={{ color: p.text }}>{p.id} · {p.setting}</span>
                <span className="block ledger-display text-[1.45rem] leading-tight mt-2" style={{ color: p.text }}>{p.name}</span>
                <span className="block text-[14px] ledger-muted leading-snug mt-2">{p.line}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] group-hover:gap-3 transition-all" style={{ color: p.text }}>Follow it <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* The advisors, as a scroll, James first ---------------------------------- */
export function AdvisorsScroll() {
  const james = ADVISORS.find((a) => a.slug === "james-papagno");
  const rest = ADVISORS.filter((a) => a.slug !== "james-papagno" && (a.portrait || a.bio.length));
  const team = james ? [james, ...rest] : rest;
  return (
    <section className="mt-16 md:mt-24 bg-sand" aria-labelledby="advisors-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="ledger-eyebrow" style={{ color: GREEN }}>Advisor-led · Advisor-built</p>
            <h2 id="advisors-heading" className="ledger-h2 mt-2">A host agency run by advisors, for advisors.</h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-sand-ink">Every journey is carried by a named advisor with a page in the book: the places they&rsquo;ve stayed, in green ink beside the founder&rsquo;s. Pick the one whose marks match your trip, or let the house make the introduction.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/about/team#advisors" className="ledger-btn ledger-btn--solid">Meet the advisors</Link>
            <Link href="/for-advisors" className="ledger-btn">Carry the Ledger</Link>
          </div>
        </div>
        <ul className="mt-10 flex gap-4 overflow-x-auto pb-3 -mx-5 px-5 md:mx-0 md:px-0 snap-x">
          {team.map((a, i) => {
            const founder = a.slug === "james-papagno";
            return (
              <li key={a.slug} className="snap-start shrink-0 w-[250px]">
                <Link href={a.profileHref ?? "/about/team#advisors"} className="group block h-full bg-paper border ledger-border overflow-hidden">
                  <span className="relative block aspect-[4/5] bg-paper-card">
                    {a.portrait ? <Image src={a.portrait.url} alt={a.portrait.alt} fill sizes="250px" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /> : <span className="absolute inset-0 flex items-center justify-center ledger-display text-3xl text-coast-deep">{initials(a.name)}</span>}
                    <span className="absolute top-3 left-3 bg-paper/95 px-2 py-1 font-mono text-[10.5px] tracking-[0.12em]">No. {String(i + 1).padStart(2, "0")}</span>
                    {founder && <span className="absolute top-2 right-2 bg-paper/95 rounded-full p-1"><JwcoSeal size={48} /></span>}
                  </span>
                  <span className="block p-4">
                    <span className="block ledger-display text-[1.25rem] leading-tight">{a.name}</span>
                    <span className="block ledger-eyebrow !text-[9.5px] mt-1" style={{ color: founder ? undefined : GREEN }}>{a.role}</span>
                    {a.intro && <span className="block text-[13.5px] ledger-muted leading-snug mt-2 line-clamp-3">{a.intro}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
