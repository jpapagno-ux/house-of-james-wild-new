import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MapBoot from "./MapBoot";
import { VOLUME_STYLES } from "@/lib/volumes";

// The route atlas (James, 30 Oct 2026): every route in a volume on one animated chart, the
// same engine and style as the Costa Rica and Raja Ampat route pages. The globe flies from
// route to route as the traveller picks one; land routes are inked in Overland's Field Olive,
// voyages in Voyages' Admiralty Navy. The ordered list of routes is in the HTML from the start
// (search engines, no-JS readers, and the fallback if the chart can't load).

export type AtlasRoute = { id: string; label: string; href: string; where: string };

type RouteFile = { id: string; title: string; subtitle?: string; stops: { name: string }[] } & Record<string, unknown>;

const read = (id: string): RouteFile | null => {
  const f = path.join(process.cwd(), "public/maps/routes", `${id}.json`);
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as RouteFile) : null;
};
const esc = (x: unknown) => String(x ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default function RouteAtlas({ id, kind, routes, dest, eyebrow, title, line }: { id: string; kind: "overland" | "voyage"; routes: AtlasRoute[]; dest?: string; eyebrow: string; title: string; line: string }) {
  const found = routes.map((r) => ({ r, file: read(r.id) })).filter((x): x is { r: AtlasRoute; file: RouteFile } => !!x.file);
  if (!found.length) return null;
  const ink = kind === "voyage" ? VOLUME_STYLES.voyages.pad : VOLUME_STYLES.overland.pad;
  const cfg = JSON.stringify({
    routes: found.map(({ r, file }) => ({ ...file, short: r.label })),
    kind,
    destination: dest,
    kicker: kind === "voyage" ? "THE VOYAGES · BY SEA" : "THE ROUTES · BY LAND",
    caption: "Positions approximate. Choose a route above the chart; the globe flies to it and plays it day by day.",
  }).replace(/</g, "\\u003c");
  const list = found.map(({ r, file }) => `<li><strong>${esc(r.label)}</strong> · ${esc(r.where)} · ${esc(file.stops.map((s) => s.name.split(" — ")[0]).join(" → "))}</li>`).join("");
  const html =
    `<div id="${esc(id)}" data-keep="1" data-gen="1" class="jw-maps jw-site" data-jw-map="itinerary" style="--jw-overland: ${ink}; --jw-voyages: ${ink}; --jw-acc: ${ink}">` +
    `<script type="application/json">${cfg}</script>` +
    `<div class="jw-frame chart"><figure class="jw-fallback" role="img" aria-label="${esc(title)}" style="margin: 0; background: #EEF2EE; padding: 18px 20px">` +
    `<ol style="display: grid; gap: 8px; margin: 0; padding: 0 0 0 18px; font-size: 14px">${list}</ol>` +
    `</figure></div></div>`;

  return (
    <section id={`${id}-atlas`} className="mt-12 md:mt-16 scroll-mt-32" aria-labelledby={`${id}-h`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ledger-eyebrow" style={{ color: ink }}>{eyebrow}</p>
          <h2 id={`${id}-h`} className="ledger-display text-[1.9rem] md:text-[2.3rem] leading-tight mt-1">{title}</h2>
          <p className="mt-2 max-w-2xl text-[15px] ledger-muted">{line}</p>
        </div>
        <p className="flex items-center gap-4 text-[12px] font-mono uppercase tracking-[0.12em]">
          <span className="inline-flex items-center gap-2"><i className="inline-block w-6 border-t-[3px]" style={{ borderColor: VOLUME_STYLES.overland.pad }} aria-hidden="true" />By land</span>
          <span className="inline-flex items-center gap-2"><i className="inline-block w-6 border-t-[3px] border-dashed" style={{ borderColor: VOLUME_STYLES.voyages.pad }} aria-hidden="true" />By sea</span>
        </p>
      </div>
      <link rel="stylesheet" href="/maps/jw-maps.css" precedence="default" />
      <div className="mt-5" dangerouslySetInnerHTML={{ __html: html }} />
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
        {found.map(({ r }) => (
          <li key={r.id}><Link href={r.href} className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline" style={{ color: ink }}>{r.label}<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link></li>
        ))}
      </ul>
      <MapBoot />
    </section>
  );
}
