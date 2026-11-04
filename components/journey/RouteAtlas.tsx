import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MapBoot from "./MapBoot";
import AtlasPicker, { type PickerGroup } from "./AtlasPicker";
import { VOLUME_STYLES } from "@/lib/volumes";
import { routeFigure } from "@/lib/content/ships/routes";

// The route atlas (James, 30 Oct 2026): every route in a volume on one animated chart, the
// same engine and style as the Costa Rica and Raja Ampat route pages. The globe flies from
// route to route as the traveller picks one; land routes are inked in Overland's Field Olive,
// voyages in Voyages' Admiralty Navy. The ordered list of routes is in the HTML from the start
// (search engines, no-JS readers, and the fallback if the chart can't load).

/** `group` (a ship): the links under the chart list by group, so many routes stay readable. */
/** `section` (an operator): on a busy atlas the picker first offers the operators, then their ships. */
export type AtlasRoute = { id: string; label: string; href: string; where: string; /** The waters for the region-first row (defaults to `where`). */ region?: string; group?: string; groupHref?: string; members?: { name: string; href: string }[]; section?: string };
/** Which legend the chart wears: river charts never say "By land / By sea" (voyages audit, 1 Nov 2026). */
export type AtlasLegend = "land-sea" | "river" | "sea" | "river-sea";

type RouteFile = { id: string; title: string; subtitle?: string; stops: { name: string }[] } & Record<string, unknown>;

const read = (id: string): RouteFile | null => {
  const f = path.join(process.cwd(), "public/maps/routes", `${id}.json`);
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as RouteFile) : null;
};
const esc = (x: unknown) => String(x ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default function RouteAtlas({ id, kind, routes, dest, eyebrow, title, line, chart, kicker, figure, legend = "land-sea", globe = false }: { id: string; legend?: AtlasLegend; /** Open on the globe (the global voyages atlas only); every other atlas opens fitted to its waters (map audit, 2 Nov 2026). */ globe?: boolean; kind: "overland" | "voyage"; routes: AtlasRoute[]; dest?: string; eyebrow: string; title: string; line: string; /** Engine options (e.g. a river overlay for the Nile). */ chart?: object; kicker?: string; /** Draw the engraved route figure, boat and all, as the fallback (voyages without a hand-drawn figure). */ figure?: boolean }) {
  const found = routes.map((r) => ({ r, file: read(r.id) })).filter((x): x is { r: AtlasRoute; file: RouteFile } => !!x.file);
  if (!found.length) return null;
  const ink = kind === "voyage" ? VOLUME_STYLES.voyages.pad : VOLUME_STYLES.overland.pad;
  const words = kind === "voyage" ? VOLUME_STYLES.voyages.deep : VOLUME_STYLES.overland.deep; // volume words use the deep (House Standard)
  const cfg = JSON.stringify({
    routes: found.map(({ r, file }) => ({ ...file, short: r.label })),
    kind,
    destination: dest,
    kicker: kicker ?? (kind === "voyage" ? "THE VOYAGES · BY SEA" : "THE ROUTES · BY LAND"),
    chart: { ...(chart ?? {}), ...(globe ? { intro: "globe" } : {}) },
    caption: globe ? "Positions approximate. Point to or tap a region to fly there first, then choose a ship and a route; the chart sails it day by day." : "Positions approximate. Choose a route above the chart; the chart flies to it and sails it day by day.",
  }).replace(/</g, "\\u003c");
  const grouped = found.some(({ r }) => r.group);
  const list = found.map(({ r, file }) => `<li><strong>${esc(grouped && r.group ? `${r.group}: ${r.label}` : r.label)}</strong> · ${esc(r.where)} · ${esc(file.stops.map((s) => s.name.split(" — ")[0]).join(" → "))}</li>`).join("");
  // Without script (or before the chart loads) the routes list in order; on a grouped atlas the
  // long list folds behind "List every route" (phones collapse it; wide screens keep it open where
  // the browser supports styling the open state, see .jw-atlas-list in globals.css).
  const listHtml = grouped
    ? `<details class="jw-atlas-list"><summary style="cursor: pointer; min-height: 44px; display: flex; align-items: center; font-size: 14px">List every route (${found.length})</summary><ol style="display: grid; gap: 8px; margin: 8px 0 0; padding: 0 0 0 18px; font-size: 14px">${list}</ol></details>`
    : `<ol style="display: grid; gap: 8px; margin: 0; padding: 0 0 0 18px; font-size: 14px">${list}</ol>`;
  const html =
    `<div id="${esc(id)}" data-keep="1" data-gen="1" class="jw-maps jw-site" data-jw-map="itinerary" style="--jw-overland: ${ink}; --jw-voyages: ${ink}; --jw-acc: ${ink}">` +
    `<script type="application/json">${cfg}</script>` +
    (figure
      ? `<div class="jw-frame chart"><figure class="jw-fallback" style="margin: 0; background: ${VOLUME_STYLES.voyages.tint}">` +
        routeFigure({ id: `${id}-fig`, routes: found.map((x) => x.file as Parameters<typeof routeFigure>[0]["routes"][number]), chart, label: title }) +
        `<figcaption style="padding: 14px 20px 16px">${listHtml}</figcaption>`
      : `<div class="jw-frame chart"><figure class="jw-fallback" role="img" aria-label="${esc(title)}" style="margin: 0; background: #F4F2EF; padding: 18px 20px">` +
        listHtml) +
    `</figure></div></div>`;

  // Ship chips: each group's routes in chart order (R0, R1… as the engine keys them).
  const groups: PickerGroup[] = [];
  found.forEach(({ r }, i) => {
    if (!r.group) return;
    let g = groups.find((x) => x.label === r.group);
    if (!g) { g = { label: r.group, href: r.groupHref ?? r.href, members: r.members, section: r.section, region: r.region ?? r.where, routes: [] }; groups.push(g); }
    g.routes.push({ key: `R${i}`, label: r.label });
  });

  return (
    <section id={`${id}-atlas`} className="mt-12 md:mt-16" aria-labelledby={`${id}-h`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ledger-eyebrow" style={{ color: words }}>{eyebrow}</p>
          <h2 id={`${id}-h`} className="ledger-display text-[1.9rem] md:text-[2.3rem] leading-tight mt-1">{title}</h2>
          <p className="mt-2 max-w-2xl text-[15px] ledger-muted">{line}</p>
        </div>
        <p className="flex items-center gap-4 text-[13px]">
          {legend === "land-sea" && <span className="inline-flex items-center gap-2"><i className="inline-block w-6 border-t-[3px]" style={{ borderColor: VOLUME_STYLES.overland.pad }} aria-hidden="true" />By land</span>}
          {(legend === "river" || legend === "river-sea") && <span className="inline-flex items-center gap-2"><i className="inline-block w-6 border-t-[3px]" style={{ borderColor: VOLUME_STYLES.voyages.pad }} aria-hidden="true" />By river</span>}
          {legend !== "river" && <span className="inline-flex items-center gap-2"><i className="inline-block w-6 border-t-[3px] border-dashed" style={{ borderColor: VOLUME_STYLES.voyages.pad }} aria-hidden="true" />By sea</span>}
        </p>
      </div>
      <link rel="stylesheet" href="/maps/jw-maps.css" precedence="default" />
      {grouped && <AtlasPicker groups={groups} />}
      <div className={grouped ? "mt-3 jw-atlas" : "mt-5"} dangerouslySetInnerHTML={{ __html: html }} />
      {!grouped && (
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
          {found.map(({ r }) => (
            <li key={r.id}><Link href={r.href} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline" style={{ color: words }}>{r.label}<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link></li>
          ))}
        </ul>
      )}
      <MapBoot />
    </section>
  );
}
