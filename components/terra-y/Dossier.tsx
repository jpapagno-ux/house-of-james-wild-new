import Link from "next/link";
import type { ReactNode } from "react";
import Pic from "@/components/opening/Pic";
import WideFilmLayer from "@/components/media/WideFilm";
import { stayBySlug } from "@/lib/content/stays";
import { TY_FILES, ty, tyFilm, tyPath, tyPoster, tyUsd, type TyAddition, type TyDay, type TyDossier, type TyRate } from "@/lib/content/terra-y";

// Terra Y expedition dossiers (James, 15 Nov 2026): Polar Chart theme (.theme-terra-y, lib/palette.ts TERRA_Y_POLAR).
// Night covers with the brand's film, a nautical graticule behind the sections, glacier keylines, faded photograph
// edges, outline day numerals on a signal-orange route line, a flight-manifest rate table and the VIP stamp.

export const VipStamp = ({ light = false, line = "James Wild & Co" }: { light?: boolean; line?: string }) => (
  <span className={`ty-stamp ${light ? "ty-stamp--light" : ""}`} aria-label="VIP, Terra Y, James Wild & Co">
    <span className="text-[13px] font-semibold">VIP · Terra Y</span>
    <span className="text-[9.5px] opacity-90">{line}</span>
  </span>
);

export function TyHero({ eyebrow, title, line, image, film, stats, stamp, children }: {
  eyebrow: string; title: string; line: string; image: { id: string; alt: string }; film?: string;
  stats: [string, string][]; stamp?: ReactNode; children?: ReactNode;
}) {
  return (
    <section className="ty-night relative overflow-hidden min-h-[88svh] flex flex-col">
      <div className="absolute inset-0">
        <Pic src={ty(image.id, 2600)} alt={image.alt} sizes="100vw" priority className="object-cover opacity-80" upscaleUnder={2400} />
        {film && <WideFilmLayer film={{ kind: "mp4", src: tyFilm(film), srcMobile: `${tyFilm(film)}`.replace("q_auto/", "q_auto,w_960/"), poster: tyPoster(film), title, credit: "" }} />}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--ty-night) 55%, transparent) 0%, transparent 30%, color-mix(in srgb, var(--ty-night) 35%, transparent) 55%, var(--ty-night) 100%)" }} />
      </div>
      <div className="relative mt-auto max-w-ledger w-full mx-auto px-5 md:px-10 pb-10 md:pb-14 pt-40">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="ty-mono text-[11px]" style={{ color: "var(--ty-ice)" }}>{eyebrow}</p>
            <h1 className="ledger-display text-[2.7rem] md:text-[5rem] leading-[0.98] mt-3" style={{ color: "var(--ty-frost)" }}>{title}</h1>
            <p className="mt-4 text-[17px] md:text-[19px] leading-relaxed max-w-2xl" style={{ color: "var(--ty-mist)" }}>{line}</p>
            {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
          </div>
          <div className="hidden md:block shrink-0 mt-2">{stamp ?? <VipStamp />}</div>
        </div>
        <dl className="mt-10 grid grid-cols-2 md:grid-cols-4 border-t" style={{ borderColor: "color-mix(in srgb, var(--ty-glacier) 55%, transparent)" }}>
          {stats.map(([k, v]) => (
            <div key={k} className="pt-4 pr-4 pb-1">
              <dt className="ty-mono text-[10px]" style={{ color: "var(--ty-glacier)" }}>{k}</dt>
              <dd className="ledger-display text-[1.3rem] md:text-[1.55rem] mt-1" style={{ color: "var(--ty-frost)" }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function TyHead({ code, title, intro, light = true }: { code: string; title: string; intro?: string; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className="ty-mono text-[11px]" style={{ color: light ? "var(--ty-chart)" : "var(--ty-glacier)" }}>{code}</p>
      <h2 className="ledger-display text-[2rem] md:text-[2.8rem] leading-[1.05] mt-2" style={{ color: light ? "var(--ty-night)" : "var(--ty-frost)" }}>{title}</h2>
      {intro && <p className="mt-3 text-[16.5px] leading-relaxed" style={{ color: light ? "#2E2B28" : "var(--ty-mist)" }}>{intro}</p>}
    </div>
  );
}

export function DossierCard({ d }: { d: TyDossier }) {
  const edge = d.file === "ice" ? "ty-edge-ice" : "ty-edge-dc3";
  return (
    <Link href={tyPath(d.slug)} className={`group block bg-white ${edge} shadow-[0_1px_0_rgba(13,27,38,0.06),0_18px_40px_-28px_rgba(13,27,38,0.45)] hover:-translate-y-0.5 transition-transform`}>
      <div className="relative aspect-[16/10] overflow-hidden" style={{ background: "var(--ty-mist)" }}>
        <Pic src={ty(d.hero.id, 1400)} alt={d.hero.alt} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover ty-fade-b group-hover:scale-[1.03] transition-transform duration-700" />
        <span className="absolute left-3 top-3 ty-mono text-[10px] px-2 py-1" style={{ background: "var(--ty-night)", color: "var(--ty-frost)" }}>{d.no}</span>
      </div>
      <div className="p-5 pt-3">
        <p className="ty-mono text-[10px]" style={{ color: "var(--ty-chart)" }}>{TY_FILES[d.file].name} · {d.operator} · {d.length}</p>
        <h3 className="ledger-display text-[1.6rem] leading-tight mt-1" style={{ color: "var(--ty-night)" }}>{d.title}</h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-graphite">{d.line}</p>
        <div className="mt-4 flex items-baseline justify-between border-t pt-3" style={{ borderColor: "var(--ty-ice)" }}>
          <span className="ty-mono text-[10px]" style={{ color: "var(--ty-chart)" }}>{d.season}</span>
          <span className="ledger-display text-[1.15rem]" style={{ color: "var(--ty-night)" }}>from {tyUsd(d.from)}</span>
        </div>
      </div>
    </Link>
  );
}

export function DayLog({ days, note, file }: { days: TyDay[]; note?: string; file: "ice" | "dc3" }) {
  return (
    <ol className="relative mt-10">
      <span aria-hidden className="absolute left-[27px] md:left-[43px] top-2 bottom-2 w-[2px]" style={{ background: "repeating-linear-gradient(to bottom, var(--ty-signal) 0 10px, transparent 10px 16px)" }} />
      {days.map((d, i) => (
        <li key={i} className="relative grid grid-cols-[56px_1fr] md:grid-cols-[88px_1fr] gap-4 md:gap-8 pb-10 md:pb-14">
          <div className="relative">
            <span className="absolute left-[21px] md:left-[37px] top-3 h-[14px] w-[14px] rotate-45 border-2" style={{ borderColor: "var(--ty-signal)", background: "var(--ty-frost)" }} />
            <span className="ty-outline-num block text-[2.4rem] md:text-[3.6rem] leading-none pt-8 md:pt-9 select-none" aria-hidden>{d.n}</span>
          </div>
          <div className={`grid gap-5 ${d.photo ? "md:grid-cols-[1.1fr_1fr]" : ""} items-start`}>
            <div className="bg-white/90 p-5 md:p-6 border" style={{ borderColor: "var(--ty-ice)" }}>
              <p className="ty-mono text-[10px]" style={{ color: "var(--ty-chart)" }}>{file === "dc3" ? `${d.n} ${d.n === "1" ? "night" : "nights"}` : d.n === "00" ? "Before" : `Day ${d.n}`} · {d.place}</p>
              <h3 className="ledger-display text-[1.55rem] md:text-[1.8rem] leading-tight mt-1" style={{ color: "var(--ty-night)" }}>{d.title}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed text-graphite">{d.body}</p>
              {d.coords && <p className="ty-mono text-[10.5px] mt-4 pt-3 border-t" style={{ color: "var(--ty-chart)", borderColor: "var(--ty-mist)" }}>⌖ {d.coords}</p>}
            </div>
            {d.photo && (
              <figure className="relative aspect-[4/3] overflow-hidden ty-fade">
                <Pic src={ty(d.photo.id, 1400)} alt={d.photo.alt} sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
              </figure>
            )}
          </div>
        </li>
      ))}
      {note && <li className="ml-[72px] md:ml-[120px] ty-mono text-[10.5px] max-w-2xl" style={{ color: "var(--ty-chart)" }}>Field note · {note}</li>}
    </ol>
  );
}

// "1 to 8 Dec 2026" / "29 Dec 2026 to 5 Jan 2027" / "19 Nov 2026": the last day, as YYYY-MM-DD
const MON: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
export const lastDay = (s: string) => { const m = [...s.matchAll(/(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})/g)].pop(); return m ? `${m[3]}-${MON[m[2]]}-${m[1].padStart(2, "0")}` : null; };

export function Manifest({ rates, note, today }: { rates: TyRate[]; note: string; today: string }) {
  const rows = rates.map((r) => ({ ...r, dates: r.dates.filter((d) => { const e = lastDay(d); return !e || e >= today; }) })).filter((r) => r.dates.length);
  return (
    <div className="mt-8 border-2" style={{ borderColor: "var(--ty-night)" }}>
      <div className="flex items-center justify-between px-4 md:px-6 py-3" style={{ background: "var(--ty-night)", color: "var(--ty-frost)" }}>
        <span className="ty-mono text-[11px]">Manifest · departures and published rates</span>
        <span className="ty-mono text-[10px]" style={{ color: "var(--ty-ice)" }}>Per person</span>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--ty-ice)" }}>
        {rows.map((r, i) => (
          <div key={i} className="grid md:grid-cols-[11rem_1fr_10rem] gap-3 md:gap-6 px-4 md:px-6 py-5 bg-white" style={{ borderColor: "var(--ty-ice)" }}>
            <div>
              <p className="ty-mono text-[10px]" style={{ color: "var(--ty-chart)" }}>Season {r.season}</p>
              <p className="ledger-display text-[1.2rem] mt-1" style={{ color: "var(--ty-night)" }}>{r.option}</p>
            </div>
            <ul className="flex flex-wrap gap-2 content-start">
              {r.dates.map((d) => <li key={d} className="ty-mono text-[10.5px] px-2.5 py-1.5 border" style={{ borderColor: /peak/.test(d) ? "var(--ty-signal-deep)" : "var(--ty-ice)", color: /peak/.test(d) ? "var(--ty-signal-deep)" : "#2E2B28", background: "var(--ty-frost)" }}>{d}</li>)}
            </ul>
            <div className="md:text-right">
              <p className="ledger-display text-[1.6rem] leading-none" style={{ color: "var(--ty-night)" }}>{r.rate}</p>
              <p className="ty-mono text-[9.5px] mt-1" style={{ color: "var(--ty-chart)" }}>per person{/sharing/i.test(note) ? " sharing" : ""}</p>
              {r.note && <p className="text-[12px] mt-1 text-graphite">{r.note}</p>}
            </div>
          </div>
        ))}
        {!rows.length && <p className="px-6 py-6 bg-white text-graphite">The published departures for this season have passed. Ask us for the next season's dates.</p>}
      </div>
      <p className="px-4 md:px-6 py-3 text-[13px] text-graphite" style={{ background: "var(--ty-mist)" }}>{note}</p>
    </div>
  );
}

export function Additions({ items }: { items: TyAddition[] }) {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {items.map((a) => {
        const stays = (a.stays ?? []).map((s) => stayBySlug(s)).filter(Boolean) as NonNullable<ReturnType<typeof stayBySlug>>[];
        return (
          <article key={a.title} className="relative p-6 md:p-7 border" style={{ background: "color-mix(in srgb, var(--ty-mist) 70%, white)", borderColor: "var(--ty-ice)", borderTop: "3px solid var(--ty-signal)" }}>
            <p className="ty-mono text-[10px]" style={{ color: "var(--ty-signal-deep)" }}>James Wild & Co adds</p>
            <h3 className="ledger-display text-[1.5rem] leading-tight mt-1" style={{ color: "var(--ty-night)" }}>{a.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-graphite">{a.body}</p>
            {stays.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {stays.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/stays/${s.slug}`} className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "var(--ty-ice)" }}>
                        {s.hero && <Pic src={s.hero} alt={s.name} sizes="200px" className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />}
                      </div>
                      <p className="mt-2 text-[13.5px] leading-snug" style={{ color: "var(--ty-night)" }}>{s.name}</p>
                      <p className="ty-mono text-[9.5px]" style={{ color: "var(--ty-chart)" }}>{s.country}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function Credit({ file }: { file: "ice" | "dc3" }) {
  return <p className="ty-mono text-[9.5px]" style={{ color: "var(--ty-glacier)" }}>{TY_FILES[file].credit}</p>;
}
