"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LagoonChart } from "./LagoonAtlas";
import type { Leg, MapPoint, Node, Route } from "@/lib/content/french-polynesia";

// Island hopping in French Polynesia (James, 2 Nov 2026): the Air Tahiti network as flight arcs and the boat links as
// dashed sea legs, with the house's seven routes laid over it (Tahiti, Taha'a, Bora Bora first). Times are Air
// Tahiti's and Tahiti Tourisme's as published; a leg with no published time says so. Taha'a has no airport: fly to
// Raiatea, then about 30 minutes by boat. Bora Bora flies direct to Rangiroa, Tikehau and Fakarava.

type Props = { chart: LagoonChart; nodes: Node[]; legs: Leg[]; routes: Route[]; unesco: MapPoint[]; stayHref: Record<string, string>; shipHref: Record<string, { name: string; href: string }>; airInk: string; seaInk: string; offerLine: string };

const project = (c: LagoonChart, lat: number, lng: number) => ({ x: (lng - c.bounds.w) * c.kx, y: (c.bounds.n - lat) * c.ky });

export default function IslandHops({ chart: c, nodes, legs, routes, unesco, stayHref, shipHref, airInk, seaInk, offerLine }: Props) {
  const [key, setKey] = useState(routes[0].key);
  const route = routes.find((r) => r.key === key)!;
  const at = useMemo(() => Object.fromEntries(nodes.map((n) => [n.code, { ...n, ...project(c, n.lat, n.lng) }])), [nodes, c]);
  const on = (from: string, to: string, mode: Leg["mode"]) => route.hops.some((h) => h.mode === mode && ((h.from === from && h.to === to) || (h.from === to && h.to === from)));
  const arc = (a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.18) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
    return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${(mx - dy * bend).toFixed(1)},${(my + dx * bend).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  };
  const name = (code: string) => at[code]?.name ?? code;
  // The Society Islands are tight at this scale: an inset frame drawn larger in the corner keeps their legs legible.
  const SOC = { w: -152.4, e: -149.4, n: -16.2, s: -17.75 };
  const inset = { x: 16, y: 16, w: 520, h: 330 };
  const ip = (lat: number, lng: number) => ({ x: inset.x + ((lng - SOC.w) / (SOC.e - SOC.w)) * inset.w, y: inset.y + ((SOC.n - lat) / (SOC.n - SOC.s)) * inset.h });
  const isSoc = (code: string) => at[code]?.group === "Society";
  const socNodes = nodes.filter((n) => n.group === "Society");
  const pos = (code: string) => (isSoc(code) ? ip(at[code].lat, at[code].lng) : at[code]);

  return (
    <section id="island-hopping" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="hops-heading">
      <p className="ledger-eyebrow ledger-crimson">Island hopping · Suggested pathways</p>
      <h2 id="hops-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">How to Hop the Islands of Tahiti</h2>
      <p className="mt-3 text-[16px] ledger-muted max-w-3xl">Seven routes the house plans most, drawn on Air Tahiti&rsquo;s network. Flights are the solid arcs, boats the dotted sea legs. Every international flight lands on Tahiti; from there, Air Tahiti flies to all five archipelagos.</p>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Choose a route">
        {routes.map((r, i) => (
          <button key={r.key} type="button" role="tab" aria-selected={r.key === key} onClick={() => setKey(r.key)}
            className={`px-3.5 py-1.5 text-[13px] border transition-colors ${r.key === key ? "bg-[var(--jw-action)] text-white border-[var(--jw-action)]" : "ledger-border hover:border-[var(--jw-action-deep)] hover:text-[var(--jw-action-deep)]"}`}>
            <span className="opacity-70 mr-1">{String(i + 1).padStart(2, "0")}</span>{r.name}
          </button>
        ))}
      </div>

      <div className="mt-5 grid lg:grid-cols-[1.45fr_1fr] gap-6 lg:gap-10 items-start">
        <figure className="ledger-paper p-2 md:p-3">
          <svg viewBox={`0 0 ${c.width} ${c.height}`} className="w-full h-auto" role="img" aria-label={`Island-hopping map of French Polynesia: ${route.name}`}>
            <defs>
              <marker id="hop-dot" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5"><circle cx="3" cy="3" r="2.4" fill={airInk} /></marker>
            </defs>
            <rect width={c.width} height={c.height} fill="#E4EEEC" />
            <path d={c.land} fill="#EAEDE6" stroke="rgba(45,42,38,0.55)" strokeWidth="1" />
            {[["SOCIETY ISLANDS", -15.0, -151.9], ["TUAMOTU", -13.6, -146.4], ["MARQUESAS", -8.0, -137.6], ["AUSTRAL ISLANDS", -21.0, -150.8], ["GAMBIER", -22.4, -136.4]].map(([t, lat, lng]) => { const q = project(c, lat as number, lng as number); return <text key={t as string} x={q.x} y={q.y} fontSize="19" letterSpacing="6" fill="rgba(45,42,38,0.5)" textAnchor="middle">{t as string}</text>; })}
            {/* Tuamotu and Marquesas legs on the main chart; Society legs in the inset. */}
            {legs.filter((l) => !(isSoc(l.from) && isSoc(l.to))).map((l, i) => {
              const a = pos(l.from), b = pos(l.to); if (!a || !b) return null; const hot = on(l.from, l.to, l.mode);
              return <path key={i} d={arc(a, b, l.mode === "air" ? 0.12 : 0.04)} fill="none" stroke={l.mode === "air" ? airInk : seaInk} strokeOpacity={hot ? 1 : 0.18} strokeWidth={hot ? 2.6 : 1.1} strokeDasharray={l.mode === "boat" ? "2 5" : undefined} strokeLinecap="round" className={hot ? "hop-hot" : undefined} />;
            })}
            {unesco.map((u) => { const q = project(c, u.lat, u.lng); return <g key={u.name}><rect x={q.x - 4} y={q.y - 4} width="8" height="8" transform={`rotate(45 ${q.x} ${q.y})`} fill="#fff" stroke="#1A4A80" strokeWidth="1.4" /><title>{u.name}</title></g>; })}
            {nodes.filter((n) => !isSoc(n.code)).map((n) => { const q = at[n.code]; return (
              <g key={n.code}><circle cx={q.x} cy={q.y} r="6" fill="#fff" stroke="#2D2A26" strokeWidth="1.6" /><text x={q.x + 10} y={q.y - 9} fontSize="22" fontFamily="'Cormorant Garamond', Georgia, serif" fill="#2D2A26" stroke="#F4F1ED" strokeWidth="3" paintOrder="stroke">{n.name}</text></g>
            ); })}
            {/* Society Islands inset */}
            <g>
              <rect x={inset.x} y={inset.y} width={inset.w} height={inset.h} fill="#E9F1EF" stroke="#2D2A26" strokeOpacity="0.5" strokeWidth="1" />
              <text x={inset.x + 12} y={inset.y + 26} fontSize="16" letterSpacing="4" fill="rgba(45,42,38,0.6)">SOCIETY ISLANDS, CLOSER</text>
              {legs.filter((l) => isSoc(l.from) && isSoc(l.to)).map((l, i) => {
                const a = pos(l.from), b = pos(l.to); const hot = on(l.from, l.to, l.mode);
                return <path key={i} d={arc(a, b, l.mode === "air" ? (l.from === "BOB" ? -0.14 : 0.14) : -0.06)} fill="none" stroke={l.mode === "air" ? airInk : seaInk} strokeOpacity={hot ? 1 : 0.2} strokeWidth={hot ? 2.6 : 1.1} strokeDasharray={l.mode === "boat" ? "2 5" : undefined} strokeLinecap="round" className={hot ? "hop-hot" : undefined} />;
              })}
              {socNodes.map((n) => { const q = ip(n.lat, n.lng); return (
                <g key={n.code}>{n.airport ? <circle cx={q.x} cy={q.y} r="6" fill="#fff" stroke="#2D2A26" strokeWidth="1.6" /> : <rect x={q.x - 5} y={q.y - 5} width="10" height="10" fill="#fff" stroke="#2D2A26" strokeWidth="1.6" />}
                  <text x={q.x + (n.code === "MOZ" || n.code === "TAA" ? -10 : 10)} y={q.y + (n.code === "RFP" ? 22 : -9)} textAnchor={n.code === "MOZ" || n.code === "TAA" ? "end" : "start"} fontSize="20" fontFamily="'Cormorant Garamond', Georgia, serif" fill="#2D2A26" stroke="#F4F1ED" strokeWidth="3" paintOrder="stroke">{n.name}{n.airport ? "" : " (no airport)"}</text></g>
              ); })}
              {/* the inset's frame on the main chart */}
              {(() => { const a = project(c, SOC.n, SOC.w), b = project(c, SOC.s, SOC.e); return (
                <g stroke="#2D2A26" strokeOpacity="0.45" fill="none">
                  <rect x={a.x} y={a.y} width={b.x - a.x} height={b.y - a.y} strokeDasharray="4 3" />
                  <line x1={a.x} y1={a.y} x2={inset.x} y2={inset.y + inset.h} strokeDasharray="2 4" />
                  <line x1={b.x} y1={a.y} x2={inset.x + inset.w} y2={inset.y + inset.h} strokeDasharray="2 4" />
                </g>
              ); })()}
            </g>
          </svg>
          <figcaption className="mt-2 text-[12px] ledger-muted flex flex-wrap gap-x-4 gap-y-1 items-center">
            <span className="inline-flex items-center gap-1.5"><svg width="22" height="6" aria-hidden="true"><path d="M0 3 H22" stroke={airInk} strokeWidth="2.4" /></svg>Air Tahiti flight</span>
            <span className="inline-flex items-center gap-1.5"><svg width="22" height="6" aria-hidden="true"><path d="M0 3 H22" stroke={seaInk} strokeWidth="2.4" strokeDasharray="2 4" strokeLinecap="round" /></svg>Boat or ferry</span>
            <span className="inline-flex items-center gap-1.5"><svg width="12" height="12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" fill="#fff" stroke="#1A4A80" strokeWidth="1.4" /></svg>UNESCO, Te Henua Enata</span>
            <span>Routes and times: Air Tahiti; boats: Tahiti Tourisme. Land: Natural Earth.</span>
          </figcaption>
        </figure>

        <div>
          <p className="ledger-eyebrow">{route.nights}</p>
          <h3 className="ledger-display text-2xl md:text-3xl mt-1">{route.name}</h3>
          <p className="mt-3 text-[16px] leading-relaxed">{route.line}</p>
          <ol className="mt-5 border-t ledger-rule">
            {route.hops.map((h, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 py-2.5 border-b ledger-rule text-[15px]">
                <span><span className="ledger-eyebrow mr-2">{h.mode === "air" ? "Fly" : "Boat"}</span>{name(h.from)} to {name(h.to)}</span>
                <span className="ledger-muted text-right">{h.time ?? (h.mode === "air" ? "Time not published" : "Ask us")}</span>
              </li>
            ))}
          </ol>
          {route.offer && <p className="mt-4 text-[15px] border-l-2 pl-4" style={{ borderColor: "var(--jw-action)" }}><span className="ledger-eyebrow block mb-1">Pearl Resorts · {offerLine}</span>{route.offer}</p>}
          {route.note && <p className="mt-4 text-[14px] ledger-muted">{route.note}</p>}
          {route.stays.length > 0 && (
            <div className="mt-5">
              <p className="ledger-eyebrow">Where to stay on this route</p>
              <ul className="mt-2 flex flex-wrap gap-2">{route.stays.map((s) => <li key={s.slug}>{stayHref[s.slug] ? <Link href={stayHref[s.slug]} className="inline-block px-3 py-1 border ledger-border text-[14px] hover:border-[var(--jw-action-deep)] hover:text-[var(--jw-action-deep)]">{s.name}</Link> : <span className="inline-block px-3 py-1 border ledger-border text-[14px] ledger-muted">{s.name}</span>}</li>)}</ul>
            </div>
          )}
          {route.ships && (
            <div className="mt-4">
              <p className="ledger-eyebrow">Sail it</p>
              <ul className="mt-2 flex flex-wrap gap-2">{route.ships.map((k) => shipHref[k] && <li key={k}><Link href={shipHref[k].href} className="inline-block px-3 py-1 border ledger-border text-[14px] hover:border-[var(--jw-action-deep)] hover:text-[var(--jw-action-deep)]">{shipHref[k].name}</Link></li>)}</ul>
            </div>
          )}
          <a href={`/plan?trip=${encodeURIComponent(`French Polynesia · ${route.name}`)}`} className="mt-6 inline-block ledger-btn">Plan this route with James</a>
        </div>
      </div>
    </section>
  );
}
