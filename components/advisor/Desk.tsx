import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GREEN_INK, VOLUME_HREF, VOLUME_LABEL, type DeskEntry, type Volume } from "@/lib/content/advisor-desk";
import { advisorCounts, advisorsFor, initials, type Advisor } from "@/lib/content/advisors";
import { sampleHeadshot } from "@/lib/content/advisor-samples";
import { STAYS } from "@/lib/content/stays";
import { recordHref } from "@/lib/ledger/urls";
import { GUARD_ON, isBuilt } from "@/lib/routes";

// The Advisor Desk components, ported from the James Wild & Co design
// (stay-sample-monwana-advisors.html, advisor-profile-sample-*.html):
//   InkMark       — James's mark in oxblood, the advisor's in green, pencil dashed
//   AdvisorChips  — a stack of headshots for a destination or stay card
//   AdvisorStrip  — "Three advisors in the book know Monwana. Two have slept here."
//   LedBuilt      — the two definitions, in a line

const headshot = (a: Advisor, w = 96) => {
  if (a.sample && a.portrait) {
    const n = Number((a.portrait.url.match(/headshot(?:-0(\d))?\b/) ?? [])[1] ?? 1);
    return sampleHeadshot(n, w);
  }
  return a.portrait?.url ?? null;
};

export function InkMark({ by, mark, when, favourite }: { by: "james" | "advisor"; mark: string; when?: string; favourite?: boolean }) {
  const pencil = mark === "Pencilled";
  const color = pencil ? "rgba(45,42,38,0.55)" : by === "james" ? "var(--jw-accent-hex)" : GREEN_INK;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap" style={{ color }}>
      <span className="inline-block w-2 h-2 rounded-full border" style={{ borderColor: color, borderStyle: pencil ? "dashed" : "solid", background: pencil ? "transparent" : color }} aria-hidden="true" />
      <span className="ledger-eyebrow !text-[10px] !text-current">
        {pencil ? "Pencilled · awaiting mark" : mark}
        {when ? ` · ${when}` : ""}
        {favourite ? " · founder favourite" : ""}
      </span>
    </span>
  );
}

export function Headshot({ a, size = 40, className = "" }: { a: Advisor; size?: number; className?: string }) {
  const src = headshot(a, size * 2);
  return (
    <span className={`relative inline-block rounded-full overflow-hidden bg-coast-mist border-2 border-paper ${className}`} style={{ width: size, height: size }}>
      {src ? <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center ledger-display text-[13px] text-coast-deep">{initials(a.name)}</span>}
    </span>
  );
}

// Headshot stack + "3 advisors know Botswana · 2 have slept here"
export function AdvisorChips({ countrySlug, regionSlug, volume, ledgerId, light = false, className = "" }: { countrySlug?: string | null; regionSlug?: string | null; volume?: Volume; ledgerId?: string | null; light?: boolean; className?: string }) {
  const { advisors, slept } = advisorsFor({ countrySlug, regionSlug, volume, ledgerId });
  if (!advisors.length) return null;
  const n = advisors.length;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="flex -space-x-2.5">
        {advisors.slice(0, 4).map((a) => <Headshot key={a.slug} a={a} size={26} className={light ? "!border-white/80" : ""} />)}
      </span>
      <span className={`ledger-eyebrow !text-[9.5px] ${light ? "!text-white/85" : ""}`}>
        {n} {n === 1 ? "advisor" : "advisors"} in the book{slept ? ` · ${slept} slept here` : ""}
      </span>
    </span>
  );
}

const ROLES: { title: string; line: string }[] = [
  { title: "Vets the house", line: "Has stayed, walked or sailed it, and marked it in green ink beside James's." },
  { title: "Fits it to you", line: "Knows which suite, which season and which night to skip." },
  { title: "Patches you in", line: "Knows the host by name, and the house will put you on the phone." },
];

// The strip on destination, stay and volume pages.
export function AdvisorStrip({ place, countrySlug, regionSlug, volume, ledgerId, className = "" }: { place: string; countrySlug?: string | null; regionSlug?: string | null; volume?: Volume; ledgerId?: string | null; className?: string }) {
  const { advisors, slept } = advisorsFor({ countrySlug, regionSlug, volume, ledgerId });
  if (!advisors.length) return null;
  const n = advisors.length;
  const words = ["One", "Two", "Three", "Four", "Five", "Six"];
  const shown = advisors.slice(0, 3);
  return (
    <section className={`border-t ledger-rule pt-8 md:pt-10 ${className}`} aria-labelledby="advisors-know">
      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-14 items-start">
        <div>
          <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>Advisor-led · Advisor-built</p>
          <h2 id="advisors-know" className="ledger-display text-[1.75rem] md:text-4xl leading-tight mt-2">
            {words[n - 1] ?? n} {n === 1 ? "advisor" : "advisors"} in the book {n === 1 ? "knows" : "know"} {place}.{slept ? ` ${words[slept - 1] ?? slept} ${slept === 1 ? "has" : "have"} slept here.` : ""}
          </h2>
          <p className="mt-4 text-[15.5px] ledger-muted max-w-md leading-relaxed">James vouches for the place. The advisor vouches for the client. Pick the one whose marks match your trip, or let the house make the introduction.</p>
          <ul className="mt-5 space-y-2.5">
            {ROLES.map((r) => (
              <li key={r.title} className="flex gap-3 text-[14.5px]"><span className="ledger-display text-[17px] shrink-0 w-28" style={{ color: GREEN_INK }}>{r.title}</span><span className="ledger-muted leading-snug">{r.line}</span></li>
            ))}
          </ul>
        </div>
        <ul className="grid sm:grid-cols-3 gap-4">
          {shown.map((a) => {
            const c = advisorCounts(a);
            const here = a.desk!.entries.filter((e) => (ledgerId ? e.ledgerId === ledgerId : countrySlug ? e.countrySlug === countrySlug : regionSlug ? e.regionSlug === regionSlug : volume ? e.volume === volume : true));
            const mark = here.find((e) => e.theirs)?.theirs ?? null;
            const note = here.find((e) => e.note)?.note ?? a.desk!.line;
            return (
              <li key={a.slug} className="bg-paper border ledger-border flex flex-col">
                <div className="p-4 flex items-center gap-3 border-b ledger-border">
                  <Headshot a={a} size={48} />
                  <div className="min-w-0">
                    <p className="ledger-display text-[18px] leading-tight truncate">{a.name}</p>
                    <p className="font-mono text-[10.5px] tracking-[0.1em] ledger-muted mt-0.5">{a.desk!.adv}{a.sample ? " · sample" : ""}</p>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  {mark ? <InkMark by="advisor" mark={`${a.firstName} ${mark.mark.toLowerCase() === "stayed" ? "stayed" : mark.mark.toLowerCase()}`} when={mark.when} /> : <InkMark by="advisor" mark="Sent guests" />}
                  <p className="text-[14.5px] leading-snug">&ldquo;{note}&rdquo;</p>
                  <p className="ledger-eyebrow mt-auto">{c.carried} carried · {c.guests} sent · {c.folios} folios</p>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    {a.profileHref && <Link href={a.profileHref} className="inline-flex items-center gap-1.5 text-[14px] hover:ledger-crimson">The desk <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>}
                    <Link href={`/plan?advisor=${a.slug}${place ? `&q=${encodeURIComponent(place)}` : ""}`} className="ledger-btn-ghost">Plan with {a.firstName}</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {n > 3 && <p className="mt-4 ledger-eyebrow">And {n - 3} more at <Link href="/about/team#advisors" className="hover:ledger-crimson">the team</Link>.</p>}
    </section>
  );
}

// A horizontal scroll of every advisor who knows a region: used on the
// region pages and the volume hubs.
export function AdvisorScroll({ regionSlug, volume, title }: { regionSlug?: string | null; volume?: Volume; title: string }) {
  const { advisors } = advisorsFor({ regionSlug, volume });
  if (!advisors.length) return null;
  return (
    <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="advisor-scroll">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>Advisor-led · Advisor-built</p>
          <h2 id="advisor-scroll" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{title}</h2>
        </div>
        <Link href="/about/team#advisors" className="ledger-btn-ghost">Every advisor</Link>
      </div>
      <ul className="mt-6 flex gap-4 overflow-x-auto pb-3 -mx-5 px-5 md:mx-0 md:px-0 snap-x">
        {advisors.map((a) => {
          const es = a.desk!.entries.filter((e) => (regionSlug ? e.regionSlug === regionSlug : true) && (volume ? e.volume === volume : true));
          const places = Array.from(new Set(es.map((e) => e.place.split(" · ").pop()))).slice(0, 3).join(" · ");
          return (
            <li key={a.slug} className="snap-start shrink-0 w-[260px] bg-paper border ledger-border p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3"><Headshot a={a} size={56} /><div className="min-w-0"><p className="ledger-display text-[18px] leading-tight">{a.name}</p><p className="ledger-eyebrow !text-[9.5px] mt-0.5 truncate">{a.role.replace(" · sample", "")}{a.sample ? " · sample" : ""}</p></div></div>
              <p className="text-[13.5px] ledger-muted leading-snug">{places}</p>
              <ul className="flex flex-wrap gap-1.5">{a.desk!.volumes.map((v) => <li key={v}><Link href={VOLUME_HREF[v]} className="text-[11px] border ledger-border px-2 py-0.5 hover:ledger-crimson">{VOLUME_LABEL[v]}</Link></li>)}</ul>
              <div className="mt-auto pt-2 flex items-center justify-between">
                {a.profileHref && <Link href={a.profileHref} className="text-[14px] hover:ledger-crimson">The desk →</Link>}
                <Link href={`/plan?advisor=${a.slug}`} className="ledger-btn-ghost">Plan</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// The two words the site is built on, for /about/team and /for-advisors.
export function LedBuilt({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid md:grid-cols-2 gap-6 ${compact ? "" : "md:gap-10"}`}>
      <div className="ledger-paper p-6">
        <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>Advisor-led</p>
        <p className="ledger-display text-2xl mt-2">Who travels with you.</p>
        <p className="mt-3 text-[15.5px] ledger-muted leading-relaxed">A named advisor with an ADV number carries the journey from the first call to the Folio on your shelf. James vouches for the place; the advisor vouches for the client.</p>
      </div>
      <div className="ledger-paper p-6">
        <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>Advisor-built</p>
        <p className="ledger-display text-2xl mt-2">Who wrote the entry.</p>
        <p className="mt-3 text-[15.5px] ledger-muted leading-relaxed">An entry the advisor stayed in, walked or sailed, marked in green ink beside James&rsquo;s oxblood. Until he has been, it is pencilled and says so.</p>
        {!compact && <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1"><InkMark by="james" mark="I Know a Place" when="2026" /><InkMark by="advisor" mark="She stayed" when="Feb 2026" /><InkMark by="james" mark="Pencilled" /></p>}
      </div>
    </div>
  );
}

// Resolve a Desk entry to its record page, when the Ledger has one built.
export function entryHref(e: DeskEntry): string | null {
  if (e.href) return !GUARD_ON || isBuilt(e.href) ? e.href : null;
  const s = STAYS.find((x) => x.ledgerId === e.ledgerId);
  if (!s) return null;
  const h = recordHref("stay", s.slug);
  return !GUARD_ON || isBuilt(h) ? h : null;
}
