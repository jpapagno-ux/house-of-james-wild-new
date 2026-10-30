import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { PreviewNote } from "@/components/record/Sections";
import { PathwayChip, PathwayChips } from "@/components/pathways/Pathway";
import { IMPACT, PATHWAY_LIST, type Pathway } from "@/lib/pathways";
import { VOLUME_BRIEF_ID, VOLUME_ORDER, VOLUME_STYLES } from "@/lib/volumes";
import { pathwayPreviewHref, stayPreviewHref } from "@/lib/content/pathways/preview";
import { pathwayStays } from "@/lib/content/pathways";
import { buildMetadata } from "@/lib/seo";

// PREVIEW · the Wild Pathways token sheet (palette addendum §8): the
// repository's house tokens beside the brief's, the eight pathway accents
// with their usage rules, the impact palette, and the volume ID alias map.
// Review page for James; noindex.

export const metadata = buildMetadata({ title: "Wild Pathways: token sheet (preview)", description: "House palette, pathway accents and impact palette for review.", path: "/preview/pathways", noindex: true });

const lum = (hex: string) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)]; return ((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(1); };

const HOUSE: [string, string, string, string][] = [
  ["Page background", "#F2EEE7 warm ivory", "#FFFFFF white · card #F6F4F0", "Keep white (James, 29 Oct volume kit; confirmed 30 Oct)"],
  ["Type", "#26221E espresso", "#2D2A26 ink", "Keep ink"],
  ["Accent / CTA", "#A65332 muted rust", "#8B2525 oxblood (seal, Ledger IDs); #94512F residence rust", "Keep oxblood; rust stays for residences and PATH-07"],
  ["Display face", "Cormorant Garamond", "Cormorant Garamond", "Match"],
  ["Body face", "DM Sans", "Manrope", "Keep Manrope (option C)"],
];

function Swatch({ p }: { p: Pathway }) {
  return (
    <li className={`pathway-${p.id.slice(-2)} border ledger-border`}>
      <div className="h-24 bg-pathway flex items-end p-3"><span className="text-white ledger-display text-[1.35rem] leading-none">{p.name}</span></div>
      <div className="p-4 text-[13.5px] grid gap-1.5">
        <p className="flex justify-between"><span className="font-mono text-[11px] ledger-muted">{p.id}</span><span className="ledger-muted">{p.setting}</span></p>
        <p>Accent <code>{p.accent}</code>{p.proposed && <span className="ledger-muted"> · addendum {p.proposed}</span>}</p>
        <p>Text <code className="text-pathway-text">{p.text}</code> <span className="ledger-muted">{ratio(p.text, "#FFFFFF")}:1 on white · {ratio(p.text, p.tint)}:1 on tint</span></p>
        <p>White on accent <span className="ledger-muted">{ratio("#FFFFFF", p.accent)}:1</span></p>
        <div className="mt-1 flex gap-2 flex-wrap"><PathwayChip pathway={p} primary /><PathwayChip pathway={p} /></div>
        <Link href={pathwayPreviewHref(p.key)} className="ledger-btn-ghost mt-2 self-start">Open the collection</Link>
      </div>
    </li>
  );
}

export default function PathwaysTokenSheet() {
  const sample = pathwayStays({ includeDrafts: true });
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Previews", path: "/preview/pathways" }]} />
          <header className="mt-6 max-w-3xl">
            <p className="ledger-eyebrow ledger-crimson">Wild Pathways · Phase 1b review</p>
            <h1 className="ledger-display text-[2.3rem] md:text-[3.3rem] leading-[1.1] mt-3">Palette, Pathways and Previews</h1>
            <p className="mt-4 text-[18px] ledger-muted leading-relaxed">The repository&rsquo;s house tokens beside the brief&rsquo;s, the eight pathway accents with their contrast figures, the impact palette, and links to the preview pages.</p>
          </header>
          <div className="mt-6"><PreviewNote>Everything on this page is additive: no live token, volume colour or page changed. Branch <code>feature/wild-pathways-foundation</code>.</PreviewNote></div>

          <section className="mt-12" aria-labelledby="previews-h">
            <p className="ledger-eyebrow ledger-crimson">Preview pages</p>
            <h2 id="previews-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">What to Look At</h2>
            <ul className="mt-6 grid sm:grid-cols-2 gap-4 text-[15px]">
              <li className="border ledger-border p-5"><Link href="/preview/pathways/stays" className="ledger-display text-xl hover:text-crimson">Stays landing with pathways →</Link><p className="mt-1 ledger-muted">Six prominent cards, all eight reachable, featured stays with chips, impact intro, Compass and Ledger entries.</p></li>
              {sample.map((r) => <li key={r.slug} className="border ledger-border p-5"><Link href={stayPreviewHref(r.slug)} className="ledger-display text-xl hover:text-crimson">{r.stay.name} →</Link><p className="mt-1 ledger-muted">Featured-stay template with the Impact Note and Follow the Pathway.</p><div className="mt-2"><PathwayChips primary={r.primary} secondary={r.secondary} /></div></li>)}
            </ul>
          </section>

          <section className="mt-14 border-t ledger-rule pt-8" aria-labelledby="house-h">
            <p className="ledger-eyebrow ledger-crimson">House palette</p>
            <h2 id="house-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Brief Versus Repository</h2>
            <table className="mt-6 w-full text-[14.5px] border-t ledger-rule"><thead><tr className="text-left ledger-eyebrow"><th className="py-2 pr-3">Token</th><th className="py-2 pr-3">Brief V1.3 / V1.4</th><th className="py-2 pr-3">Repository (live)</th><th className="py-2">Decision</th></tr></thead>
              <tbody>{HOUSE.map(([t, b, r, d]) => <tr key={t} className="border-t ledger-border align-top"><td className="py-2.5 pr-3 font-medium">{t}</td><td className="py-2.5 pr-3 ledger-muted">{b}</td><td className="py-2.5 pr-3">{r}</td><td className="py-2.5">{d}</td></tr>)}</tbody></table>
          </section>

          <section className="mt-14 border-t ledger-rule pt-8" aria-labelledby="path-h">
            <p className="ledger-eyebrow ledger-crimson">Eight pathway accents</p>
            <h2 id="path-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">One Accent Per Pathway</h2>
            <ul className="mt-4 max-w-3xl text-[15px] ledger-muted grid gap-1.5">
              <li>· Primary pathway sets a record&rsquo;s default accent; secondary pathways print as smaller chips on their tint.</li>
              <li>· Accents are for fills, markers and rules. Pathway-coloured words use the text variant, which clears 4.5:1 on white, card and tint.</li>
              <li>· PATH-03, 04 and 05 were each darkened the smallest step that lets white text pass AA on a solid fill (agreed 30 Oct).</li>
              <li>· The name is always printed beside the colour. Selected and active states carry a second indicator, never colour alone.</li>
            </ul>
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{PATHWAY_LIST.map((p) => <Swatch key={p.id} p={p} />)}</ul>
          </section>

          <section className="mt-14 border-t ledger-rule pt-8" aria-labelledby="impact-h">
            <p className="ledger-eyebrow ledger-crimson">Impact palette</p>
            <h2 id="impact-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Where Your Stay Gives Back</h2>
            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-[14px]">
              <div className="border ledger-border"><div className="h-16" style={{ background: IMPACT.panel }} /><p className="p-3">Soft sage panel <code>{IMPACT.panel}</code></p></div>
              <div className="border ledger-border"><div className="h-16" style={{ background: IMPACT.copy }} /><p className="p-3">Forest copy and icons <code>{IMPACT.copy}</code> · {ratio(IMPACT.copy, IMPACT.panel)}:1 on sage</p></div>
              <div className="border ledger-border"><div className="h-16" style={{ background: IMPACT.highlight }} /><p className="p-3">Selective rust <code>{IMPACT.highlight}</code> · {ratio(IMPACT.highlight, IMPACT.panel)}:1 on sage</p></div>
            </div>
          </section>

          <section className="mt-14 border-t ledger-rule pt-8" aria-labelledby="vol-h">
            <p className="ledger-eyebrow ledger-crimson">Volume IDs</p>
            <h2 id="vol-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Brief Aliases, Live Romans</h2>
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VOLUME_ORDER.map((k) => { const v = VOLUME_STYLES[k]; return <li key={k} className="border ledger-border p-4 flex items-center gap-4"><span className="h-10 w-10 shrink-0" style={{ background: v.leather }} aria-hidden="true" /><span className="text-[14.5px]"><span className="ledger-display text-lg block">Vol {v.roman} · {v.label}</span><span className="ledger-muted">{VOLUME_BRIEF_ID[k]} in the brief · {v.leatherName}</span></span></li>; })}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
