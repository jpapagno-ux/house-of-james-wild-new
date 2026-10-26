import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { ReactNode } from "react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import PriceBuilder from "@/components/record/PriceBuilder";
import Signature from "@/components/record/Signature";
import HostPanel, { KIND as HOST_KIND, type HostKind } from "@/components/record/HostPanel";
import CallingCard from "@/components/record/CallingCard";
import { RecordNav, SectionHead, IncludedLists } from "@/components/record/Sections";
import type { Trip, TripImg } from "@/lib/content/trips";
import { hostFor } from "@/lib/content/hosts";
import { Stamp } from "@/components/notes/HeroMark";

// The Journey (overland) and Voyage template, built from James's route files.
// One component, two section orders from the wireframe:
//   overland: map · experiences · overview · who it suits · day by day · stays · included · price · film · faq · related · enquire
//   voyage:   vessel & cabins · map · in short · dates & rates · sailed by the founder · who · days · experiences · the fare · price · meet the crew · faq · related · enquire (James, 26 Oct)
// The live house map (MapLibre) loads over an engraved figure that is in the
// HTML from the start, so search engines and no-JS readers get the route too.
// Anything still in [square brackets] is shown, marked, until it is confirmed.

/** Text with every [to confirm] marked. */
export function Fx({ t }: { t: string }) {
  const parts = t.split(/(\[[^\]]+\])/g);
  return <>{parts.map((p, i) => (p.startsWith("[") && p.endsWith("]") ? <mark key={i} className="jw-flag">{p}</mark> : p))}</>;
}
const strip = (h: string) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();

/** Photo, or a marked frame saying which photo goes here. */
function Ph({ img, label, className = "", sizes = "(max-width: 768px) 100vw, 50vw" }: { img?: TripImg; label: string; className?: string; sizes?: string }) {
  if (img) return <div className={`relative overflow-hidden bg-paper-card ${className}`}><Image src={img.url} alt={img.alt} fill sizes={sizes} className="object-cover" quality={75} /></div>;
  return (
    <div role="img" aria-label={`Photo to come: ${label.replace(/^PHOTO\s*·\s*/i, "").toLowerCase()}`} className={`jw-ph relative flex items-end p-3 ${className}`}>
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink/70 bg-paper/85 px-2 py-1">{label}</span>
    </div>
  );
}

function Sec({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 ${className}`}>{children}</section>;
}

export default function TripPage({ trip: T, mapHtml, images = {}, hero, host }: { trip: Trip; mapHtml: string; images?: Record<string, TripImg>; hero?: TripImg; host?: { key: string; name: string; kind: HostKind } }) {
  const voyage = T.kind === "voyage";
  const mapId = `jwmap-${T.id}`;
  const crumbs = T.crumbs.map((name, i) => ({ name, path: ["/", voyage ? "/voyages" : "/overland", voyage ? "/voyages" : "/destinations/central-america/costa-rica", T.seo.path][i] }));
  const h = host ? hostFor(host.key) : null;
  const hostOn = !!h && h.state !== "off";
  const quote = strip(T.quote).replace(/\s*—\s*J\.\s*W\.\s*$/, "");
  const field = T.founder.extra?.match(/href="([^"]+)"/)?.[1];
  const dayNo = (n: string) => parseInt(n.replace(/\D/g, ""), 10);

  const nav: [string, string][] = voyage
    ? [["The vessel", "vessel"], ["Cabins", "cabins"], ["The voyage", "route"], ["In short", "overview"], ["Dates & rates", "departures"], ["Sailed by James", "founder"], ["Who it suits", "suits"], ["Day by day", "days"], ["Experiences", "experiences"], ["The fare", "included"], ["Price", "price"], ...(hostOn ? [["Meet the crew", "host"] as [string, string]] : []), ["FAQ", "faq-heading"]]
    : [["The route", "route"], ["Experiences", "experiences"], ["Overview", "overview"], ["Who it suits", "suits"], ["Day by day", "days"], ["The stays", "stays"], ["Included", "included"], ["Price", "price"], ["FAQ", "faq-heading"]];

  /* ---------- sections ---------- */
  const Map = (
    <Sec id="route">
      <SectionHead eyebrow={T.map_eyebrow} title={T.map_title} icon={voyage ? "wave" : "mountain-sun"} intro={voyage ? "Tap a day in the log and the chart sails there. Every stay and launch nearby is drawn in, so you can see what else is close." : "Tap a day below and the map flies there. Every stay the Ledger holds nearby is drawn in, so you can see what else is close."} />
      <p className="mt-2 font-mono text-[11px] tracking-[0.12em] ledger-muted">{T.map_coord}</p>
      <link rel="stylesheet" href="/maps/jw-maps.css" precedence="default" />
      <link rel="stylesheet" href={`/maps/fig/${T.id}.css`} precedence="default" />
      <div className="mt-6" dangerouslySetInnerHTML={{ __html: mapHtml }} />
      <ol className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Stops in order">
        {T.side.map(([k, name, when, move]) => {
          const d = k === "S" ? 1 : k === "E" ? (voyage ? 10 : 12) : voyage ? parseInt(k, 10) : parseInt(when.replace(/\D+/g, " ").trim().split(" ")[0] || "1", 10);
          return (
            <li key={k + name}>
              <button type="button" data-jw-day={d} data-jw-for={mapId} className="w-full text-left border ledger-border px-4 py-3 hover:border-crimson/60 flex gap-3">
                <span className="ledger-display ledger-crimson text-lg w-6 shrink-0">{k}</span>
                <span><span className="ledger-display text-[17px]">{name}</span> <span className="ledger-muted text-[13px]">· {when}</span><span className="block text-[13px] ledger-muted">{move}</span></span>
              </button>
            </li>
          );
        })}
      </ol>
    </Sec>
  );

  const Overview = (
    <Sec id="overview">
      <SectionHead eyebrow="In short" title={T.overview_title} icon="sun" />
      <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
        <div>
          <p className="text-[18px] md:text-[19px] leading-relaxed" data-aeo="answer">{T.answer}</p>
          <blockquote className="mt-6 border-l-2 border-crimson pl-5 ledger-display italic text-xl md:text-2xl leading-snug">&ldquo;{quote.replace(/^"|"$/g, "")}&rdquo;<span className="block not-italic text-[14px] ledger-muted mt-2 font-serif">— James Wild</span></blockquote>
        </div>
        <dl className="ledger-paper border ledger-border p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14.5px]">
          <dt className="ledger-eyebrow col-span-2 mb-1">{strip(T.ledgerline)}</dt>
          {T.meta.map(([k, v]) => <div key={k} className="contents"><dt className="ledger-muted">{k}</dt><dd><Fx t={v} /></dd></div>)}
        </dl>
      </div>
      <div className="mt-10">
        <p className="ledger-eyebrow">{T.striptitle}</p>
        <div className="mt-3 grid gap-px" style={{ gridTemplateColumns: `repeat(${T.strip.length}, minmax(0,1fr))` }} aria-hidden="true">
          {T.strip.map(([d, c]) => <div key={d} className="h-8 flex items-center justify-center font-mono text-[10px] text-paper" style={{ background: c }}>{d}</div>)}
        </div>
        <p className="mt-2 text-[13px] ledger-muted">{T.strip_labels.join(" · ")}</p>
      </div>
    </Sec>
  );

  const Suits = (
    <Sec id="suits">
      <SectionHead eyebrow="Who it suits" title={voyage ? "Who Should Sail This" : "Who This Route Is For"} icon="tree-ring" />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {T.suits.map(([who, wit, why]) => (
          <li key={who} className="border ledger-border p-5"><p className="ledger-eyebrow ledger-crimson">{who}</p><p className="ledger-display text-[19px] leading-snug mt-2">{wit}</p><p className="mt-2 text-[15px] ledger-muted"><Fx t={why} /></p></li>
        ))}
      </ul>
      {T.twice?.length > 0 && (
        <div className="mt-8 ledger-paper border ledger-border p-5 md:p-6">
          <p className="ledger-eyebrow">Think twice if you are…</p>
          <ul className="mt-3 grid gap-4 md:grid-cols-2">{T.twice.map(([who, wit, fix]) => <li key={who}><p className="ledger-display text-[18px]">{who}</p><p className="text-[15px] italic">{wit}</p><p className="text-[14.5px] ledger-muted mt-1"><Fx t={fix} /></p></li>)}</ul>
        </div>
      )}
    </Sec>
  );

  const Days = (
    <Sec id="days">
      <SectionHead eyebrow={`${T.dayeyebrow} · ${T.sub.split("·").slice(0, 2).join("·").trim()}`} title={T.daytitle} icon="wave" intro={voyage ? "Each day as the crew sails it. Weather, tides and the mantas shape the order." : "Each day as James would drive it. Tap a day to see it on the map."} />
      <ol className="mt-8 relative border-l-2 border-crimson/30 ml-3">
        {T.days.map((d) => (
          <li key={d.n} className="relative pl-7 md:pl-10 pb-10 last:pb-0">
            <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-paper border-2 border-crimson" aria-hidden="true" />
            {d.head && d.stageName && <p className="ledger-eyebrow ledger-crimson mb-2">{d.stage} · {d.stageName} · <span className="ledger-muted">{d.stageMeta}</span>{d.mark ? <span className="ml-2 italic normal-case tracking-normal font-serif text-[14px] text-ink">“{d.mark}”</span> : null}</p>}
            <div className="grid md:grid-cols-[1.5fr_1fr] gap-5 items-start">
              <div>
                <button type="button" data-jw-day={dayNo(d.n)} data-jw-for={mapId} className="text-left group">
                  <span className="font-mono text-[11px] tracking-[0.14em] ledger-muted">{d.n}</span>
                  <span className="block ledger-display text-[22px] md:text-2xl group-hover:ledger-crimson">{d.title}</span>
                </button>
                <p className="text-[14px] italic ledger-muted">{d.line}</p>
                <p className="mt-3 text-[16px] leading-relaxed"><Fx t={d.body} /></p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
                  <dt className="ledger-eyebrow">{T.staylabel}</dt><dd><Fx t={d.stay} /></dd>
                  <dt className="ledger-eyebrow">Meals</dt><dd><Fx t={d.meals} /></dd>
                  <dt className="ledger-eyebrow">{T.movelabel}</dt><dd>{d.move}</dd>
                  <dt className="ledger-eyebrow">Doing</dt><dd>{d.acts}</dd>
                </dl>
              </div>
              <Ph img={images[d.img]} label={d.img} className="aspect-[4/3] w-full" sizes="(max-width: 768px) 100vw, 30vw" />
            </div>
          </li>
        ))}
      </ol>
    </Sec>
  );

  const Experiences = (
    <Sec id="experiences">
      <SectionHead eyebrow="Experiences" title={T.exp_title} icon="mountain-sun" />
      {voyage ? (
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {T.experiences.map((e) => (
            <li key={e.name} className="border ledger-border">
              <Ph img={images[e.name ?? ""]} label={`PHOTO · ${(e.photos?.[0] ?? e.name ?? "").toUpperCase()}`} className="aspect-[16/9] w-full" />
              <div className="p-5">
                <p className="ledger-eyebrow">{e.line}</p>
                <h3 className="ledger-display text-[22px] mt-1">{e.name}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed"><Fx t={e.body ?? ""} /></p>
                {e.james && <p className="mt-3 italic text-[15px] border-l-2 border-crimson pl-3">&ldquo;{e.james}&rdquo; <span className="not-italic ledger-muted text-[13px]">— James</span></p>}
                {e.chips && <p className="mt-3 flex flex-wrap gap-2">{e.chips.map((c) => <span key={c} className="text-[11px] tracking-[0.12em] uppercase border ledger-border px-2 py-1">{c}</span>)}</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {T.experiences.map((e) => (
            <li key={e.title} className="border ledger-border p-5">
              <p className="ledger-eyebrow ledger-crimson">{e.kicker}</p>
              <h3 className="ledger-display text-[20px] mt-1">{e.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed">{e.info}</p>
              <p className="mt-3 text-[12.5px] ledger-muted">{[e.dur, e.incl, e.season].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}
    </Sec>
  );

  const Stays = !voyage && T.lodges ? (
    <Sec id="stays">
      <SectionHead eyebrow="The stays" title={T.lodges_title ?? "The stays"} icon="tree-ring" />
      <ul className="mt-8 space-y-10">
        {T.lodges.map((l) => (
          <li key={l.name} className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
            <div className="grid grid-cols-3 gap-2">
              {l.photos.map((p, i) => <Ph key={p} img={images[p]} label={`PHOTO · ${p.toUpperCase()}`} className={i === 0 ? "col-span-3 aspect-[16/9]" : "aspect-[4/3]"} />)}
            </div>
            <div>
              <p className="ledger-eyebrow">{l.line}</p>
              <h3 className="ledger-display text-2xl mt-1">{l.name}</h3>
              <p className="mt-2 flex flex-wrap gap-2">{l.chips.map((c) => <span key={c} className="text-[11px] tracking-[0.12em] uppercase border ledger-border px-2 py-1">{c}</span>)}</p>
              <p className="mt-3 text-[16px] leading-relaxed">{l.body}</p>
              {l.james && <p className="mt-3 italic border-l-2 border-crimson pl-3">&ldquo;{l.james}&rdquo; <span className="not-italic ledger-muted text-[13px]">— James</span></p>}
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
                {l.rows.map(([k, v]) => {
                  const a = v.match(/href="([^"]+)"[^>]*>([^<]+)</);
                  return <div key={k} className="contents"><dt className="ledger-eyebrow">{k}</dt><dd>{a ? <a href={a[1]} target="_blank" rel="noopener" className="underline decoration-crimson/50 underline-offset-2">{a[2]}</a> : <Fx t={v} />}</dd></div>;
                })}
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  ) : null;

  const Vessel = voyage && T.vessel ? (
    <Sec id="vessel">
      <SectionHead eyebrow="The vessel" title={T.vessel.title} icon="wave" intro={T.vessel.blurb} />
      <div className="mt-8 grid lg:grid-cols-[1fr_1.3fr] gap-8 items-start">
        <dl className="ledger-paper border ledger-border p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14.5px]">
          {T.vessel.facts.map(([k, v]) => <div key={k} className="contents"><dt className="ledger-muted">{k}</dt><dd><Fx t={v} /></dd></div>)}
        </dl>
        <ul className="grid gap-3 sm:grid-cols-2">
          {T.features.map(([, t, l]) => <li key={t} className="border ledger-border p-4"><p className="ledger-display text-[17px]">{t}</p><p className="text-[14px] ledger-muted"><Fx t={l} /></p></li>)}
        </ul>
      </div>
      <h3 id="cabins" className="ledger-display text-2xl mt-12 scroll-mt-32">The cabins</h3>
      <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {T.calc.opts.map((o) => (
          <li key={o.label} className="border ledger-border">
            <Ph img={images[o.photo]} label={`PHOTO · ${o.photo.toUpperCase()}`} className="aspect-[4/3] w-full" sizes="(max-width: 768px) 100vw, 25vw" />
            <div className="p-4 text-[14px]">
              <p className="ledger-display text-[18px]">{o.label}</p>
              <p className="ledger-muted">{o.sub}</p>
              <p className="mt-2">{o.sleeps} · <Fx t={o.bed} /></p>
              <p><Fx t={o.size} /></p>
              <p><Fx t={o.feats} /></p>
            </div>
          </li>
        ))}
      </ul>
    </Sec>
  ) : null;

  const Included = (
    <Sec id="included">
      <SectionHead eyebrow={voyage ? "The fare" : "Included"} title={voyage ? "What the Fare Covers" : "What Is Included"} icon="frond" />
      <div className="mt-6"><IncludedLists included={T.incl} excluded={T.excl} /></div>
      <p className="mt-4 text-[13px] ledger-muted">Items marked <mark className="jw-flag">[like this]</mark> are being confirmed with the {voyage ? "vessel" : "lodges"} before the page goes live.</p>
    </Sec>
  );

  const Departures = voyage && T.departures ? (
    <Sec id="departures">
      <SectionHead eyebrow={T.dates_head[0]} title={T.dates_head[1]} icon="sun" intro={T.dep_season} />
      {Object.entries(T.departures).map(([yr, rows]) => (
        <div key={yr} className="mt-6">
          <p className="ledger-eyebrow ledger-crimson">{yr} · {T.dep_route}</p>
          <table className="mt-2 w-full text-[14.5px] border-t ledger-border">
            <thead className="sr-only"><tr><th>Sailing</th><th>Dates</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.code} className="border-b ledger-border"><td className="py-2 font-mono text-[12px]">{r.code}</td><td>{r.dates}</td><td>{r.price}</td><td className="text-right"><a href="#enquire" className="ledger-btn-ghost">{T.dep_cta}</a></td></tr>)}</tbody>
          </table>
        </div>
      ))}
      <p className="mt-4 text-[14px] ledger-muted"><Fx t={T.dep_note ?? ""} /></p>
    </Sec>
  ) : null;

  const Price = (
    <PriceBuilder kind={voyage ? "voyage" : "journey"} tripName={T.h1} maxTravellers={T.calc.maxG ?? 8} contactHref="#enquire" defaultOption={`o${(T.calc as { opt0?: number }).opt0 ?? 0}`}
      options={T.calc.opts.map((o, i) => ({ id: `o${i}`, label: o.label, pp: o.pp, detail: [o.sub, o.sleeps].filter(Boolean).join(" · ") }))}
      addOns={T.calc.adds.map((a, i) => ({ id: `a${i}`, label: a.label, pp: a.pp, detail: a.sub.replace(/\s*\[[^\]]+\]/g, "") }))} />
  );

  const Founder = (
    <Sec id="founder">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
        <div>
          <p className="ledger-eyebrow ledger-crimson">{T.founder.eyebrow}</p>
          <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">{T.founder.title}</h2>
          <p className="mt-4 text-[17px] leading-relaxed">{T.founder.p1}</p>
          <p className="mt-3 text-[17px] leading-relaxed">{T.founder.p2}</p>
          {field && <a href={field} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-3 border border-ink px-4 py-3 hover:border-crimson"><span className="font-mono text-[10px] border border-ink px-1.5 py-2">PDF</span><span><span className="block font-mono text-[11px] tracking-[0.14em] ledger-crimson">FIELD GUIDE NO. 03</span><span className="ledger-display text-[18px]">Costa Rica, the Long Way Round</span></span></a>}
          <div className="mt-6 aspect-video w-full jw-ph flex items-center justify-center"><span className="font-mono text-[11px] tracking-[0.14em] uppercase bg-paper/85 px-2 py-1"><Fx t={T.founder.film} /></span></div>
        </div>
        <aside className="ledger-paper border ledger-border p-6" aria-label="Why James approved it">
          <p className="ledger-eyebrow">Why this route is on file</p>
          <p className="ledger-display text-[22px] mt-1">{T.approve.title}</p>
          <ul className="mt-3 space-y-2 text-[15px]">{T.approve.why.map((w) => <li key={w} className="flex gap-2"><span className="ledger-crimson">✦</span>{w}</li>)}</ul>
          <p className="mt-4 italic ledger-display text-[18px] leading-snug">&ldquo;{T.approve.quote}&rdquo;</p>
          <Signature className="w-32 mt-3" />
          <p className="mt-3 font-mono text-[10px] tracking-[0.14em] ledger-muted">{T.approve.seal_mark} · {T.approve.seal_bottom}</p>
        </aside>
      </div>
    </Sec>
  );

  const HostBlock = hostOn && h ? <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={h.state} host={h.host} stayName={host!.name} kind={host!.kind} /></div> : null;

  const Related = (
    <Sec id="related">
      <p className="ledger-eyebrow">{T.reltitle}</p>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {T.related.map(([code, name, line]) => {
          const href = /FIELD GUIDE NO/.test(code) && field ? field : /VESSEL/.test(code) ? "#vessel" : voyage ? "/voyages" : "/overland";
          return <li key={name}><a href={href} className="block border ledger-border p-5 h-full hover:border-crimson/60"><p className="font-mono text-[10.5px] tracking-[0.14em] ledger-crimson">{code}</p><p className="ledger-display text-[20px] mt-1">{name}</p><p className="text-[14.5px] ledger-muted mt-1"><Fx t={line} /></p></a></li>;
        })}
      </ul>
    </Sec>
  );

  const Enquire = (
    <section id="enquire" className="mt-16 md:mt-24 bg-ink text-paper px-6 py-10 md:p-14 scroll-mt-32">
      <p className="ledger-eyebrow !text-paper/70">{voyage ? "Wild & Co Voyages" : "Plan this journey"}</p>
      <p className="ledger-display text-2xl md:text-3xl mt-2 max-w-2xl">{T.ctaline}</p>
      <div className="mt-6 flex flex-wrap gap-4 items-center">
        <Link href={`/plan?trip=${encodeURIComponent(T.h1)}`} className="ledger-btn ledger-btn--solid">{T.ctabtn}</Link>
        <a href="sms:+15614796355" className="ledger-btn-ghost !text-paper !border-paper/50">Text James</a>
      </div>
    </section>
  );

  const order = voyage
    ? [Vessel, Map, Overview, Departures, Founder, Suits, Days, Experiences, Included, Price, HostBlock]
    : [Map, Experiences, Overview, Suits, Days, Stays, Included, Price, Founder];

  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <header className="relative min-h-[78svh] flex items-end text-paper" style={hero ? undefined : { background: T.slides[0].bg }}>
          {hero ? <Image src={hero.url} alt={hero.alt} fill priority sizes="100vw" quality={85} className="object-cover" /> : <span className="absolute bottom-3 right-3 md:top-28 md:bottom-auto md:right-10 font-mono text-[10px] tracking-[0.14em] bg-ink/40 px-2 py-1">{T.herolabel}</span>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" aria-hidden="true" />
          {/* The spinning stamp, inked in the destination's palette; tap for James's note on why this trip is on file. */}
          {T.stamp && <Stamp tint={T.stamp.tint} label={T.stamp.label} where={T.stamp.where} when={T.stamp.when} sub={T.stamp.sub} nudge={T.stamp.nudge} cta={T.stamp.cta} script={T.stamp.script} line={T.approve.quote} href="#founder" />}
          <div className="relative max-w-ledger mx-auto w-full px-5 md:px-10 pb-10 md:pb-14 pt-40">
            <p className="ledger-eyebrow !text-paper/80">{T.slides[0].kicker}</p>
            <h1 className="ledger-display text-[2.4rem] leading-[1.05] md:text-6xl mt-3 max-w-4xl">{T.h1}</h1>
            <p className="mt-3 text-lg md:text-xl max-w-2xl">{T.sub}</p>
            <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-paper/30 pt-5 max-w-4xl">
              {T.herofacts.map(([k, v]) => <div key={k}><dt className="text-[11px] tracking-[0.16em] uppercase text-paper/70">{k}</dt><dd className="ledger-display text-[17px] mt-1">{v}</dd></div>)}
            </dl>
          </div>
        </header>
        <RecordNav items={nav} cta={voyage ? "Ask about dates" : "Plan this journey"} ctaHref="#enquire" />
        <div className="max-w-ledger mx-auto px-5 md:px-10 pb-16">
          <div className="pt-6"><Breadcrumbs trail={crumbs} /></div>
          {order}
          <FaqBlock faqs={T.faqs.map(([q, a]) => ({ q, a }))} title={voyage ? "Questions About This Voyage" : "Questions About This Route"} />
          {Related}
          {Enquire}
        </div>
      </main>
      {hostOn && h?.state === "available" && host && <CallingCard who={HOST_KIND[host.kind].who} />}
      <Script src="/maps/jw-embed.js" strategy="afterInteractive" />
      <JsonLd data={T.jsonld.filter((x) => x["@type"] !== "FAQPage")} />
    </>
  );
}
