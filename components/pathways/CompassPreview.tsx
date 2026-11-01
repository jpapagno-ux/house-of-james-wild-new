"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowRight, Leaf, PenLine, RotateCcw, Sparkles } from "lucide-react";
import IggiLine from "@/components/dialogue/IggiLine";
import { dialogueLine } from "@/lib/content/dialogue-register";
import { PathwayChips } from "@/components/pathways/Pathway";
import { readPathways, type Party, type Privacy, type Reading, type Season, type Setting } from "@/lib/compass/pathway-adapter";
import { PATHWAYS, pathway, type PathwayRecord } from "@/lib/pathways";
import { VOLUME_STYLES } from "@/lib/volumes";

// PREVIEW · the Compass pathway adapter, in two presentations: the
// traveller's (Iggi leads, James's verdict mark where one exists) and the
// trade's (Ledger IDs, classification status, fit reasons, impact state).
// The live Compass is untouched; this reads the same records it could.

export type PreviewRecord = PathwayRecord & {
  name: string; country: string | null; hero: string | null; bestMonths: string | null; hasVerdict: boolean; verdictLine: string | null; statusLine: string | null; href: string;
  /** Pathway id → href. Optional per record; the component-level `pathwayHrefs` prop is the usual source (one map, not one per record). */
  pathwayHref?: Record<string, string>;
  impactDocumented?: boolean; founderMark?: string | null; kind?: "stay" | "voyage" | "route";
};

const SETTINGS: { id: Setting; label: string }[] = [
  { id: "rainforest", label: "Rainforest & jungle" }, { id: "ocean", label: "Islands & oceans" }, { id: "mountain", label: "Mountains & highlands" }, { id: "wildlife", label: "Wildlife & wilderness" },
  { id: "wellness", label: "Wellness & restoration" }, { id: "hidden", label: "Hidden & undiscovered" }, { id: "private", label: "A private residence" }, { id: "heritage", label: "Heritage & culture" },
];
const PARTIES: { id: Party; label: string }[] = [{ id: "couple", label: "A couple" }, { id: "family", label: "A family" }, { id: "friends", label: "Friends" }, { id: "solo", label: "Just me" }, { id: "group", label: "A private group" }];
const SEASONS: { id: Season; label: string }[] = [{ id: "dry", label: "Dry months" }, { id: "green", label: "Green months" }, { id: "any", label: "Whenever" }];
const PRIVACY: { id: Privacy; label: string }[] = [{ id: "any", label: "Either" }, { id: "private_house", label: "A whole house" }, { id: "small_camp", label: "A small camp" }];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={on} className={`border px-3 py-1.5 text-[14px] transition-colors ${on ? "bg-ink text-paper border-ink" : "ledger-border hover:border-crimson"}`}>{on && <span className="sr-only">Selected: </span>}{children}</button>;
}

export default function CompassPreview({ records: given, recordsUrl, live = false, enquireHref = "/plan", pathwayHrefs = {} }: { records: PreviewRecord[]; recordsUrl?: string; live?: boolean; enquireHref?: string; pathwayHrefs?: Record<string, string> }) {
  // With recordsUrl the whole Ledger loads once, after the page, so the Compass page itself stays light.
  const [fetched, setFetched] = useState<PreviewRecord[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    if (!recordsUrl) return;
    let on = true;
    fetch(recordsUrl).then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((j: { records: PreviewRecord[] }) => { if (on) setFetched(j.records); }).catch(() => { if (on) setLoadError(true); });
    return () => { on = false; };
  }, [recordsUrl]);
  const records = fetched ?? given;
  const loading = !!recordsUrl && !fetched && !loadError;
  const [settings, setSettings] = useState<Setting[]>(["wildlife", "heritage"]);
  const [party, setParty] = useState<Party | undefined>("couple");
  const [season, setSeason] = useState<Season>("any");
  const [privacy, setPrivacy] = useState<Privacy>("any");
  const [conservation, setConservation] = useState(true);
  const [culture, setCulture] = useState(false);
  const [view, setView] = useState<"traveller" | "trade">("traveller");

  const reading: Reading = useMemo(() => ({ settings, party, season, privacy, conservation, culture }), [settings, party, season, privacy, conservation, culture]);
  const out = useMemo(() => readPathways(reading, records, { includeDrafts: !live, limit: 5 }), [reading, records, live]);
  const byslug = useMemo(() => Object.fromEntries(records.map((r) => [r.slug, r])), [records]);
  const toggle = (s: Setting) => setSettings((xs) => (xs.includes(s) ? xs.filter((x) => x !== s) : [...xs, s]));
  const reset = () => { setSettings([]); setParty(undefined); setSeason("any"); setPrivacy("any"); setConservation(false); setCulture(false); };

  return (
    <section aria-labelledby="compass-preview-h" className="mt-10">
      <div className={`grid gap-10 ${view === "traveller" ? "lg:grid-cols-[1fr_1.4fr]" : ""}`}>
        {/* The reading */}
        <div className="bg-paper-card border ledger-border p-6 md:p-8">
          <p className="ledger-eyebrow flex items-center gap-2" style={{ color: "var(--jw-char-iggi)" }}><Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Iggi asks</p>
          <h2 id="compass-preview-h" className="ledger-display text-[1.75rem] mt-2">Where Are You Drawn?</h2>
          <fieldset className="mt-5"><legend className="ledger-eyebrow mb-2">The setting (choose any)</legend><div className="flex flex-wrap gap-2">{SETTINGS.map((s) => <Chip key={s.id} on={settings.includes(s.id)} onClick={() => toggle(s.id)}>{s.label}</Chip>)}</div></fieldset>
          <fieldset className="mt-5"><legend className="ledger-eyebrow mb-2">Who&rsquo;s travelling</legend><div className="flex flex-wrap gap-2">{PARTIES.map((p) => <Chip key={p.id} on={party === p.id} onClick={() => setParty(party === p.id ? undefined : p.id)}>{p.label}</Chip>)}</div></fieldset>
          <fieldset className="mt-5"><legend className="ledger-eyebrow mb-2">When</legend><div className="flex flex-wrap gap-2">{SEASONS.map((s) => <Chip key={s.id} on={season === s.id} onClick={() => setSeason(s.id)}>{s.label}</Chip>)}</div></fieldset>
          <fieldset className="mt-5"><legend className="ledger-eyebrow mb-2">Privacy</legend><div className="flex flex-wrap gap-2">{PRIVACY.map((p) => <Chip key={p.id} on={privacy === p.id} onClick={() => setPrivacy(p.id)}>{p.label}</Chip>)}</div></fieldset>
          <fieldset className="mt-5"><legend className="ledger-eyebrow mb-2">What matters</legend><div className="flex flex-wrap gap-2"><Chip on={conservation} onClick={() => setConservation(!conservation)}>Giving back</Chip><Chip on={culture} onClick={() => setCulture(!culture)}>Hosts &amp; history</Chip></div></fieldset>
          <button type="button" onClick={reset} className="mt-6 ledger-btn-ghost inline-flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Start again</button>
        </div>

        {/* The results */}
        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[15px] ledger-muted"><span className="font-medium text-ink">Iggi</span> · {out.explain.replace(/^Iggi weighed: /, "")}</p>
            {!live && <div role="tablist" aria-label="Presentation" className="flex border ledger-border">
              {(["traveller", "trade"] as const).map((v) => <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`px-3 py-1.5 text-[12px] tracking-[0.14em] uppercase ${view === v ? "bg-ink text-paper" : ""}`}>{v === "traveller" ? "Traveller" : "Trade"}</button>)}
            </div>}
          </div>

          {out.handoff && (live && dialogueLine("iggi.handoff.crux") ? (
            <IggiLine line={dialogueLine("iggi.handoff.crux")} className="mt-4"><a href={out.handoff.href} className="underline underline-offset-2 hover:text-crimson">Go to the safari desk <ArrowRight className="inline w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></a></IggiLine>
          ) : (
            <p className="mt-4 border-l-2 border-crimson pl-4 text-[14.5px]"><span className="ledger-eyebrow ledger-crimson block mb-1">Safari reading</span>{out.handoff.line} <a href={out.handoff.href} className="underline underline-offset-2 hover:text-crimson">Go to the safari desk <ArrowRight className="inline w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></a></p>
          ))}

          {loading && <p className="mt-6 text-[15px] ledger-muted" aria-live="polite">Iggi is opening the Ledger…</p>}
          {loadError && <p className="mt-6 text-[15px] ledger-muted">The Ledger didn&rsquo;t open just now. Reload, or ask James directly.</p>}
          {!loading && !loadError && out.fits.length === 0 && <p className="mt-6 text-[15px] ledger-muted">{live ? "Nothing approved in the Ledger fits that reading yet. Choose another setting, or ask James directly." : "Nothing in the sample records fits that reading yet. Choose a setting, or start again."}</p>}

          {live && out.fits.length > 0 && (
            <p className="mt-6 text-[15px]"><Link href={`${enquireHref}?pathways=${encodeURIComponent(out.fits.map((f) => f.slug).join(","))}`} className="ledger-btn--solid ledger-btn">Send this reading to James</Link><span className="ml-3 ledger-muted">A person finishes the trip. Nothing is booked here.</span></p>
          )}
          {view === "traveller" ? (
            <ol className="mt-6 grid gap-4">
              {out.fits.map((f, i) => { const r = byslug[f.slug]; const primary = pathway(f.primaryPathway)!; const secondary = f.pathways.slice(1).map((p) => PATHWAYS[p]); return (
                <li key={f.slug} className={`pathway-${f.primaryPathway.slice(-2)} border ledger-border p-5 grid sm:grid-cols-[auto_1fr] gap-4`}>
                  <span className="ledger-display text-2xl text-pathway-text w-8" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="ledger-eyebrow">{r.kind === "voyage" ? "Voyage · " : r.kind === "route" ? "Overland · " : ""}{r.country}{r.statusLine ? ` · ${r.statusLine}` : ""}</p>
                    <h3 className="ledger-display text-[1.45rem] leading-tight mt-0.5"><Link href={r.href} className="hover:text-pathway-text">{r.name}</Link></h3>
                    <div className="mt-2"><PathwayChips primary={primary} secondary={secondary} hrefFor={(p) => (r.pathwayHref ?? pathwayHrefs)[p.id] ?? "#"} /></div>
                    <ul className="mt-3 text-[14.5px] grid gap-1">{f.reasons.filter((x) => x.kind !== "verdict").slice(0, 3).map((x) => <li key={x.text} className="flex gap-2"><span className="text-pathway-text" aria-hidden="true">·</span><span><span className="sr-only">Why: </span>{x.text}</span></li>)}</ul>
                    {f.impactDocumented && <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-impact-copy"><Leaf className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Where your stay gives back is on record</p>}
                    {r.hasVerdict && r.verdictLine && <p className="mt-3 border-l-2 pl-3 text-[14.5px] italic ledger-display" style={{ borderColor: "var(--jw-char-james-accent)" }}><span className="not-italic ledger-eyebrow block mb-0.5" style={{ color: "var(--jw-char-james-accent)" }}><PenLine className="inline w-3 h-3 mr-1" strokeWidth={1.5} aria-hidden="true" />James&rsquo;s Field Verdict</span>&ldquo;{r.verdictLine}&rdquo;</p>}
                  </div>
                </li>
              ); })}
            </ol>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-[13.5px] border-t ledger-rule">
                <thead><tr className="text-left ledger-eyebrow"><th className="py-2 pr-3">Ledger ID</th><th className="py-2 pr-3">Record</th><th className="py-2 pr-3">Pathways</th><th className="py-2 pr-3">Volumes</th><th className="py-2 pr-3">Suitability</th><th className="py-2 pr-3">Impact</th><th className="py-2 pr-3">Fit</th><th className="py-2">Class.</th></tr></thead>
                <tbody>{out.fits.map((f) => { const r = byslug[f.slug]; return (<Fragment key={f.slug}>
                  <tr className="border-t ledger-border align-top">
                    <td className="py-2.5 pr-3 font-mono text-[12px] whitespace-nowrap">{f.ledgerId ?? "—"}</td>
                    <td className="py-2.5 pr-3 min-w-[13rem]"><Link href={r.href} className="font-medium hover:text-crimson">{r.name}</Link><br /><span className="ledger-muted">{r.country}{r.statusLine ? ` · ${r.statusLine}` : ""}{r.hasVerdict ? " · verdict on file" : ""}</span></td>
                    <td className="py-2.5 pr-3">{f.pathways.map((p, i) => <span key={p} className="block whitespace-nowrap">{i === 0 ? "★ " : "· "}{PATHWAYS[p].name} <span className="ledger-muted font-mono text-[11px]">{p}</span></span>)}</td>
                    <td className="py-2.5 pr-3">{f.volumes.map((v) => <span key={v} className="block whitespace-nowrap">{VOLUME_STYLES[v].roman} {VOLUME_STYLES[v].short}</span>)}</td>
                    <td className="py-2.5 pr-3">{r.suitability.map((s) => s.replace(/_/g, " ")).join(", ")}</td>
                    <td className="py-2.5 pr-3">{r.impact.map((s) => <span key={s.kind + s.status} className="block whitespace-nowrap">{s.kind}: {s.status.replace(/_/g, " ")}</span>)}</td>
                    <td className="py-2.5 pr-3 font-mono">{f.score.toFixed(1)}</td>
                    <td className="py-2.5"><span className={r.classificationStatus === "approved" ? "" : "jw-flag"}>{r.classificationStatus}</span></td>
                  </tr>
                  <tr className="align-top"><td className="pb-3 pr-3 ledger-eyebrow">Why</td><td colSpan={7} className="pb-3 ledger-muted">{f.reasons.map((x) => `${x.text} (+${x.weight})`).join(" · ")}</td></tr>
                </Fragment>); })}</tbody>
              </table>
              <p className="mt-3 text-[12.5px] ledger-muted">Trade view: no prices, no net rates, nothing client-facing. Classification and impact states are the house&rsquo;s own; drafts are flagged.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
