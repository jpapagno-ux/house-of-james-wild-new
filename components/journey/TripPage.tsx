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
import { RecordNav, SectionHead, IncludedLists, RecordHero } from "@/components/record/Sections";
import { Anchor, Car, ChevronDown, Fish, Mountain, Plane, Ship, Trees, Waves } from "lucide-react";
import { usd } from "@/lib/pricing";
import ExpandAll from "./ExpandAll";
import type { Trip, TripImg } from "@/lib/content/trips";
import { hostFor } from "@/lib/content/hosts";
import { Stamp } from "@/components/notes/HeroMark";
import VoyageTag from "@/components/notes/VoyageTag";

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

export default function TripPage({ trip: T, mapHtml, images = {}, hero, slides = [], host }: { trip: Trip; mapHtml: string; images?: Record<string, TripImg>; hero?: TripImg; slides?: TripImg[]; host?: { key: string; name: string; kind: HostKind } }) {
  const voyage = T.kind === "voyage";
  const mapId = `jwmap-${T.id}`;
  const crumbs = T.crumbs.map((name, i) => ({ name, path: ["/", voyage ? "/voyages" : "/overland", voyage ? "/voyages" : "/destinations/central-america/costa-rica", T.seo.path][i] }));
  const h = host ? hostFor(host.key) : null;
  const hostOn = !!h && h.state !== "off";
  const quote = strip(T.quote).replace(/\s*—\s*J\.\s*W\.\s*$/, "");
  const field = T.founder.extra?.match(/href="([^"]+)"/)?.[1];
  const dayNo = (n: string) => parseInt(n.replace(/\D/g, ""), 10);

  const nav: [string, string][] = voyage
    ? [["The vessel", "vessel"], ["In short", "overview"], ["The voyage", "route"], ["Dates & rates", "departures"], ["Sailed by James", "founder"], ["Who it suits", "suits"], ["Day by day", "days"], ["The fare", "included"], ["Experiences", "experiences"], ["Price", "price"], ...(hostOn ? [["Meet the crew", "host"] as [string, string]] : []), ["FAQ", "faq-heading"]]
    : [["In short", "overview"], ["The route", "route"], ["Experiences", "experiences"], ["Who it suits", "suits"], ["Day by day", "days"], ["Included", "included"], ["The stays", "stays"], ["Price", "price"], ["The founder", "founder"], ["FAQ", "faq-heading"]];

  // "From" price: the lowest per-person option on file, with what it's based on.
  const low = [...T.calc.opts].sort((a, b) => a.pp - b.pp)[0];
  const def = T.calc.opts[(T.calc as { opt0?: number }).opt0 ?? 0];
  const route = T.side.map(([, n]) => n).filter((n, i, a) => a.indexOf(n) === i).join(" → ");
  // James's note for a day: the lodge's line on the first day there (overland),
  // or the experience filed for that day (voyage).
  const noteFor = (d: (typeof T.days)[number]) => {
    const n = dayNo(d.n);
    if (!voyage) return d.head ? T.lodges?.find((l) => l.name === d.stay)?.james : undefined;
    return T.experiences.find((e) => e.james && new RegExp(`Days? ${n}\\b`).test(e.line ?? ""))?.james;
  };
  const DayIcon = ({ d }: { d: (typeof T.days)[number] }) => {
    const t = `${d.move} ${d.line} ${d.acts}`.toLowerCase();
    const I = /plane|flight|fly|airport/.test(t) ? Plane : /boat|canal|tender/.test(t) ? Ship : /4×4|drive|road|driver|car/.test(t) ? Car : /dive|snorkel|manta|reef|coral/.test(t) ? Fish : /volcano|peak|lookout|climb|trek|hike|waterfall/.test(t) ? Mountain : /forest|cloud|jungle|bird/.test(t) ? Trees : /surf|beach|kayak|swim/.test(t) ? Waves : voyage ? Anchor : Trees;
    return <I className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />;
  };

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
          <p className="text-[18px] md:text-[19px] leading-relaxed" data-aeo="answer">{T.answer}{T.bestFor && ` Best suited to ${T.bestFor.who.toLowerCase()}.`}</p>
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
        {[...T.suits].sort((a, b) => Number(b[0] === T.bestFor?.who) - Number(a[0] === T.bestFor?.who)).map(([who, wit, why]) => (
          <li key={who} className={`border p-5 ${who === T.bestFor?.who ? "border-crimson bg-paper-card" : "ledger-border"}`}><p className="ledger-eyebrow ledger-crimson">{who}{who === T.bestFor?.who && <span className="ml-2 border border-crimson px-1.5 py-0.5 text-[9.5px]">Best suited</span>}</p><p className="ledger-display text-[19px] leading-snug mt-2">{wit}</p><p className="mt-2 text-[15px] ledger-muted"><Fx t={why} /></p></li>
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
      <SectionHead eyebrow={`${T.dayeyebrow} · ${T.sub.split("·").slice(0, 2).join("·").trim()}`} title={T.daytitle} icon="wave" intro={voyage ? "Each day as the crew sails it. Weather, tides and the mantas shape the order. Open a day for the detail." : "Each day as James would drive it. Open a day for the detail, or send it to the map."} />
      <div className="mt-6 flex justify-end"><ExpandAll target="days-list" /></div>
      <div id="days-list" className="mt-3 space-y-2">
        {T.days.map((d, i) => (
          <div key={d.n}>
          {d.head && d.stageName && <p className="ledger-eyebrow ledger-crimson pt-6 pb-1">{d.stage} · {d.stageName} · <span className="ledger-muted">{d.stageMeta}</span>{d.mark ? <span className="ml-2 italic normal-case tracking-normal font-serif text-[14px] text-ink">“{d.mark}”</span> : null}</p>}
          <details className="group border ledger-border open:border-crimson/50 open:bg-paper-card transition-colors" open={i === 0}>
            <summary className="cursor-pointer list-none flex items-center gap-4 px-4 md:px-5 py-4 hover:bg-paper-card [&::-webkit-details-marker]:hidden">
              <span className="w-10 h-10 shrink-0 rounded-full border ledger-border flex items-center justify-center ledger-crimson group-open:bg-crimson group-open:text-paper group-open:border-crimson transition-colors"><DayIcon d={d} /></span>
              <span className="flex-1 min-w-0">
                <span className="font-mono text-[11px] tracking-[0.14em] ledger-muted">{d.n}</span>
                <span className="block ledger-display text-[19px] md:text-[22px] leading-snug">{d.title}</span>
                <span className="block text-[13.5px] italic ledger-muted truncate">{d.line}{d.stay && d.stay !== "—" ? ` · ${d.stay.replace(/\s*·\s*\[[^\]]+\]/, "")}` : ""}</span>
              </span>
              <span className="hidden sm:inline text-[10.5px] tracking-[0.16em] uppercase ledger-muted group-open:hidden">Open day</span><ChevronDown className="w-5 h-5 shrink-0 ledger-crimson transition-transform group-open:rotate-180" strokeWidth={1.5} aria-hidden="true" />
            </summary>
            <div className="px-4 md:px-5 pb-6 md:pl-[76px] grid md:grid-cols-[1.5fr_1fr] gap-5 items-start">
              <div>
                <p className="text-[16px] leading-relaxed"><Fx t={d.body} /></p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
                  <dt className="ledger-eyebrow">{T.staylabel}</dt><dd><Fx t={d.stay} /></dd>
                  <dt className="ledger-eyebrow">Meals</dt><dd><Fx t={d.meals} /></dd>
                  <dt className="ledger-eyebrow">{T.movelabel}</dt><dd>{d.move}</dd>
                  <dt className="ledger-eyebrow">Doing</dt><dd>{d.acts}</dd>
                </dl>
                {noteFor(d) && <p className="mt-4 italic text-[15px] border-l-2 border-crimson pl-3">&ldquo;{noteFor(d)}&rdquo; <span className="not-italic ledger-muted text-[13px]">— James</span></p>}
                <button type="button" data-jw-day={dayNo(d.n)} data-jw-for={mapId} className="mt-4 ledger-btn-ghost">Show on the map ↑</button>
              </div>
              <Ph img={images[d.img]} label={d.img} className="aspect-[4/3] w-full" sizes="(max-width: 768px) 100vw, 30vw" />
            </div>
          </details>
          </div>
        ))}
      </div>
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
            <li key={e.title} className="border ledger-border">
              {images[e.title ?? ""] && <Ph img={images[e.title ?? ""]} label={e.title ?? ""} className="aspect-[16/10] w-full" sizes="(max-width: 768px) 100vw, 33vw" />}
              <div className="p-5">
              <p className="ledger-eyebrow ledger-crimson">{e.kicker}</p>
              <h3 className="ledger-display text-[20px] mt-1">{e.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed">{e.info}</p>
              <p className="mt-3 text-[12.5px] ledger-muted">{[e.dur, e.incl, e.season].filter(Boolean).join(" · ")}</p>
              </div>
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

  const V = T.vessel;
  const nights = T.days.length - 1;
  const Vessel = voyage && V ? (
    <Sec id="vessel">
      <SectionHead eyebrow="The vessel" title={V.title} icon="wave" intro={V.blurb} />
      {V.gallery && V.gallery.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-2 md:h-[460px]">
          {V.gallery.slice(0, 5).map((g, i) => <Ph key={g.url} img={g} label={g.alt} className={i === 0 ? "col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto md:h-full" : "aspect-[4/3] md:aspect-auto md:h-full"} sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"} />)}
        </div>
      )}
      <div className="mt-8 grid lg:grid-cols-[1fr_1.25fr] gap-8 items-start">
        <dl className="ledger-paper border ledger-border p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14.5px]">
          {V.facts.map(([k, v]) => <div key={k} className="contents"><dt className="ledger-muted">{k}</dt><dd><Fx t={v} /></dd></div>)}
        </dl>
        {V.spaces && (
          <div>
            <p className="ledger-eyebrow">Life aboard</p>
            <div className="mt-3 space-y-2">
              {V.spaces.map((sp, i) => (
                <details key={sp.name} className="group border ledger-border open:border-crimson/50 open:bg-paper-card" open={i === 0}>
                  <summary className="cursor-pointer list-none flex items-center gap-3 px-4 py-3 hover:bg-paper-card [&::-webkit-details-marker]:hidden">
                    <span className="flex-1 min-w-0"><span className="block ledger-display text-[18px]">{sp.name}</span><span className="block text-[13px] ledger-muted">{sp.line}</span></span>
                    <ChevronDown className="w-5 h-5 shrink-0 ledger-crimson transition-transform group-open:rotate-180" strokeWidth={1.5} aria-hidden="true" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-[15px] leading-relaxed">{sp.body}</p>
                    <div className={`mt-3 grid gap-2 ${sp.photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>{sp.photos.slice(0, 2).map((ph) => <Ph key={ph.url} img={ph} label={ph.alt} className="aspect-[4/3] w-full" sizes="(max-width: 768px) 50vw, 25vw" />)}</div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
      <h3 id="cabins" className="ledger-display text-2xl mt-12 scroll-mt-32">The cabins</h3>
      <p className="mt-1 text-[14px] ledger-muted">Seven cabins over three decks, every one en-suite with air conditioning. Rates are 2027 published, per person sharing, plus 11% tax.</p>
      {V.cabins ? (
        <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {V.cabins.map((c) => (
            <li key={c.name} className="border ledger-border flex flex-col">
              <Ph img={c.photos[0]} label={c.name} className="aspect-[3/2] w-full" sizes="(max-width: 768px) 100vw, 33vw" />
              {c.photos.length > 1 && <div className="grid grid-cols-2 gap-1 mt-1">{c.photos.slice(1, 3).map((ph) => <Ph key={ph.url} img={ph} label={ph.alt} className="aspect-[3/2] w-full" sizes="(max-width: 768px) 50vw, 16vw" />)}</div>}
              <div className="p-4 flex-1 flex flex-col">
                <p className="ledger-eyebrow ledger-crimson">{c.cat}</p>
                <p className="ledger-display text-[20px] mt-0.5">{c.name}</p>
                <p className="text-[13.5px] ledger-muted mt-1">{c.deck} · {c.bed} · sleeps {c.sleeps}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">{c.feats.map((f) => <li key={f} className="text-[11.5px] border ledger-border px-2 py-0.5">{f}</li>)}</ul>
                <p className="mt-auto pt-4 flex items-baseline justify-between gap-3 border-t ledger-border"><span className="ledger-display ledger-crimson text-[19px]">{usd(c.night)}<span className="text-[12px] ledger-muted font-serif"> / night pp</span></span><span className="text-[13px]">{usd(c.night * nights)} for {nights} nights</span></p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {T.features.length > 0 && <ul className="mt-8 flex flex-wrap gap-2">{T.features.map(([, t]) => <li key={t} className="text-[12.5px] border ledger-border px-3 py-1">{t}</li>)}</ul>}
      {V.source && <p className="mt-4 text-[12px] ledger-muted">Yacht, cabin and rate details from {V.source}.</p>}
    </Sec>
  ) : null;

  const Included = (
    <Sec id="included">
      <SectionHead eyebrow={voyage ? "The fare" : "Included"} title={voyage ? "What the Fare Covers" : "What Is Included"} icon="frond" />
      <div className="mt-6"><IncludedLists included={T.incl} excluded={T.excl} /></div>
      <p className="mt-4 text-[13px] ledger-muted">Items marked <mark className="jw-flag">[like this]</mark> are being confirmed with the {voyage ? "vessel" : "lodges"} before the page goes live.</p>
    </Sec>
  );

  const tone = (st: string) => /full/i.test(st) ? "bg-ink/10 text-ink/60 line-through decoration-ink/30" : /left/i.test(st) ? "bg-[#F1E2B8] text-[#5E3F22]" : "bg-[#DCE8DF] text-[#25543B]";
  const Departures = voyage && T.departures ? (
    <Sec id="departures">
      <SectionHead eyebrow={T.dates_head[0]} title={T.dates_head[1]} icon="sun" intro={T.dep_season} />
      <div className="mt-8 space-y-2">
        {T.departures.groups.map((g) => {
          const open = g.sailings.filter((x) => !/full/i.test(x.status)).length;
          const from = Math.min(...g.sailings.map((x) => x.price));
          return (
            <details key={g.name} className={`group border open:bg-paper-card ${g.this ? "border-crimson" : "ledger-border open:border-crimson/50"}`} open={g.this}>
              <summary className="cursor-pointer list-none flex flex-wrap items-center gap-x-4 gap-y-1 px-4 md:px-5 py-4 hover:bg-paper-card [&::-webkit-details-marker]:hidden">
                <span className="flex-1 min-w-[12rem]">
                  <span className="flex items-center gap-2"><span className="ledger-display text-[19px] md:text-[21px]">{g.name}</span>{g.this && <span className="text-[9.5px] tracking-[0.16em] uppercase border border-crimson ledger-crimson px-1.5 py-0.5">This voyage</span>}</span>
                  <span className="block text-[13px] ledger-muted">{g.nights} · {g.sailings.length} sailing{g.sailings.length > 1 ? "s" : ""} · {open} with space</span>
                </span>
                <span className="text-right"><span className="ledger-eyebrow block">From</span><span className="ledger-display ledger-crimson text-[18px]">{usd(from)}</span></span>
                <ChevronDown className="w-5 h-5 shrink-0 ledger-crimson transition-transform group-open:rotate-180" strokeWidth={1.5} aria-hidden="true" />
              </summary>
              <div className="px-4 md:px-5 pb-4">
                <div className="hidden md:grid grid-cols-[2fr_0.6fr_1.4fr_1.2fr_auto] gap-3 ledger-eyebrow pb-2"><span>Departs</span><span>Nights</span><span>Per person</span><span>Availability</span><span /></div>
                <ul>{g.sailings.map((r) => (
                  <li key={r.date} className="border-t ledger-border py-3 grid grid-cols-[1fr_auto] md:grid-cols-[2fr_0.6fr_1.4fr_1.2fr_auto] gap-x-3 gap-y-1 items-center text-[14.5px]">
                    <span className="ledger-display text-[16px] md:font-serif md:text-[14.5px]">{r.date}</span>
                    <span className="hidden md:block">{r.nights}</span>
                    <span className="order-3 md:order-none">{usd(r.price)} <span className="text-[12px] ledger-muted">+ 11% tax<span className="md:hidden"> · {r.nights} nights</span></span></span>
                    <span className="order-2 md:order-none justify-self-end md:justify-self-start"><span className={`text-[11.5px] px-2 py-0.5 whitespace-nowrap ${tone(r.status)}`}>{r.status}</span></span>
                    <span className="order-4 md:order-none justify-self-end">{/full/i.test(r.status) ? <a href={`/plan?trip=${encodeURIComponent(T.h1)}&date=${encodeURIComponent(r.date)}&waitlist=1`} className="ledger-btn-ghost">Waitlist</a> : <a href={`/plan?trip=${encodeURIComponent(`${g.name}, Aliikai`)}&date=${encodeURIComponent(r.date)}`} className="ledger-btn-ghost">Hold a cabin</a>}</span>
                  </li>))}</ul>
              </div>
            </details>
          );
        })}
      </div>
      <p className="mt-4 text-[14px] ledger-muted"><Fx t={T.dep_note ?? ""} /></p>
      {T.departures.source && <p className="mt-1 text-[12px] ledger-muted">Availability from {T.departures.source}; we confirm it live when you ask.</p>}
    </Sec>
  ) : null;

  const Price = (
    <PriceBuilder kind={voyage ? "voyage" : "journey"} tripName={T.h1} taxRate={T.calc.taxRate} note={T.calc.taxRate ? `${T.calc.note} ${T.calc.soloNote ?? ""}` : undefined} maxTravellers={T.calc.maxG ?? 8} contactHref="#enquire" defaultOption={`o${(T.calc as { opt0?: number }).opt0 ?? 0}`}
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

  const Summary = (
    <section aria-label="The trip at a glance" className="border-b ledger-rule bg-paper-card">
      <div className="max-w-ledger mx-auto px-5 md:px-10 py-6 md:py-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="ledger-display text-[18px] md:text-[21px] leading-snug">{T.slides[0].line}</p>
          <p className="mt-1 text-[13.5px] ledger-muted">{route}</p>
          <dl className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            {T.herofacts.map(([k, v]) => <div key={k}><dt className="ledger-eyebrow">{k}</dt><dd className="ledger-display text-[16px] mt-0.5">{v}</dd></div>)}
          </dl>
          {T.bestFor && <p className="mt-3 text-[14px]"><span className="ledger-eyebrow ledger-crimson mr-2">Best for</span><span className="ledger-display italic text-[17px]">{T.bestFor.who}</span> <span className="ledger-muted">· {T.bestFor.why}</span></p>}
        </div>
        <div className="lg:border-l ledger-rule lg:pl-8 flex flex-col gap-3 lg:min-w-[260px]">
          <p><span className="ledger-eyebrow block">Starting at</span><span className="ledger-display ledger-crimson text-[2rem] leading-none">{usd(low.pp)}</span><span className="block text-[12.5px] ledger-muted mt-1">per person · {low.label.toLowerCase()}{low.sleeps ? `, ${low.sleeps.toLowerCase()}` : ""}{def && def !== low ? ` · ${def.label.toLowerCase()} ${usd(def.pp)}` : ""}</span>{T.calc.taxRate ? <span className="block text-[11.5px] ledger-muted italic">2027 published rate, plus {Math.round(T.calc.taxRate * 100)}% tax.</span> : !T.prices_final && <span className="block text-[11.5px] ledger-muted italic">Rate on file; confirmed when you enquire.</span>}</p>
          <div className="flex flex-wrap gap-3"><a href="#price" className="ledger-btn ledger-btn--solid !py-2.5">Build your price</a><a href={voyage ? "#departures" : "#days"} className="ledger-btn !py-2.5">{voyage ? "See dates" : "Day by day"}</a></div>
        </div>
      </div>
    </section>
  );

  const order = voyage
    ? [Vessel, Overview, Map, Departures, Founder, Suits, Days, Included, Experiences, Price, HostBlock]
    : [Overview, Map, Experiences, Suits, Days, Included, Stays, Price, Founder];

  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        {slides.length ? (
          <RecordHero image={slides[0]} slides={slides} eyebrow={T.slides[0].kicker} title={T.h1} tagline={T.sub} tag={<>{/* The old voyage/route tag, postmarked in the destination's ink */}{T.tag ? <VoyageTag tag={T.tag} line={T.approve.quote} href="#founder" /> : T.stamp && <Stamp tint={T.stamp.tint} label={T.stamp.label} where={T.stamp.where} when={T.stamp.when} sub={T.stamp.sub} nudge={T.stamp.nudge} cta={T.stamp.cta} script={T.stamp.script} line={T.approve.quote} href="#founder" />}</>} />
        ) : (
          <header className="relative min-h-[70svh] flex items-end text-paper" style={{ background: T.slides[0].bg }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" aria-hidden="true" />
            {T.tag ? <VoyageTag tag={T.tag} line={T.approve.quote} href="#founder" /> : T.stamp && <Stamp tint={T.stamp.tint} label={T.stamp.label} where={T.stamp.where} when={T.stamp.when} sub={T.stamp.sub} nudge={T.stamp.nudge} cta={T.stamp.cta} script={T.stamp.script} line={T.approve.quote} href="#founder" />}
            <div className="relative max-w-ledger mx-auto w-full px-5 md:px-10 pb-10 md:pb-14 pt-40">
              <p className="ledger-eyebrow !text-paper/80">{T.slides[0].kicker}</p>
              <h1 className="ledger-display text-[2.4rem] leading-[1.05] md:text-6xl mt-3 max-w-4xl">{T.h1}</h1>
              <p className="mt-3 text-lg md:text-xl max-w-2xl">{T.sub}</p>
            </div>
          </header>
        )}
        {Summary}
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
