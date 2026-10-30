import SiteHeader from "@/components/ledger/SiteHeader";
import { PreviewNote } from "@/components/record/Sections";
import { buildMetadata } from "@/lib/seo";
import { VOLUME_ORDER, VOLUME_STYLES } from "@/lib/volumes";
import { EmbossSeal, FinalCallBoard, InkStamp, PassportStamp, Roundel, TimeMark, VolumeIconSvg } from "@/components/ledger/VolumeKit";

// Preview: the volume kit approved on 29 Oct 2026 (design canvas "House
// Volumes Colour System"). Every mark here is drawn live from lib/volumes.ts.

export const metadata = buildMetadata({ title: "The volume kit (preview)", description: "The six volumes' colours, stamps, founder marks and offer marks.", path: "/preview/volume-kit", noindex: true });

const ENTRY: Record<string, string> = { stays: "0412", safaris: "0112", gatherings: "0149", voyages: "0027", europe: "0005", overland: "0061" };

export default function VolumeKitPreview() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-8 pb-24 bg-white">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <p className="ledger-eyebrow">Preview · the volume kit</p>
          <h1 className="ledger-display text-4xl md:text-5xl mt-2">Six volumes, one house</h1>
          <p className="mt-3 max-w-3xl ledger-muted text-[17px] leading-relaxed">White pages. Each volume&rsquo;s leather colour appears only on labels, buttons, the rule above the manifest and its marks. House oxblood stays for the JW seal and Ledger IDs.</p>

          <section className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VOLUME_ORDER.map((k) => {
              const v = VOLUME_STYLES[k];
              return (
                <div key={k} className={`theme-vol-${k} border ledger-rule bg-white`}>
                  <div className="h-28 flex items-center justify-center text-white/85" style={{ background: v.leather }}><VolumeIconSvg volume={k} size={44} stroke={2} /></div>
                  <div className="p-5">
                    <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase ledger-crimson">Volume {v.roman}</p>
                    <p className="ledger-display text-2xl mt-1">{v.label}</p>
                    <p className="font-mono text-[11px] mt-1 ledger-muted">{v.leatherName} {v.leather} · pad ink {v.pad}</p>
                    <div className="mt-4 flex gap-3">
                      <span className="ledger-btn--solid ledger-btn !py-2 !px-3 text-[11px]">Plan this</span>
                      <span className="ledger-btn !py-2 !px-3 text-[11px]">Save to My Folio</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="mt-16 border-t ledger-rule pt-8">
            <p className="ledger-eyebrow">The volume stamps · pressed from an ink pad · one per page, beside James&rsquo;s note</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
              {VOLUME_ORDER.map((k, i) => <InkStamp key={k} volume={k} no={ENTRY[k]} size={170} rotate={[-7, 4, -4, 6, -3, 5][i]} seed={13 + i * 11} />)}
            </div>
          </section>

          <section className="mt-16 border-t ledger-rule pt-8 grid md:grid-cols-3 gap-10 items-center">
            <div>
              <p className="ledger-eyebrow">Founder mark · blind emboss</p>
              <div className="mt-4 bg-white p-6 shadow-[0_14px_34px_rgba(30,20,15,0.10)] inline-flex"><EmbossSeal label="Founder favorite" size={130} /></div>
            </div>
            <div>
              <p className="ledger-eyebrow">Dated proof · passport stamp (from the Ledger)</p>
              <div className="mt-6"><PassportStamp volume="gatherings" top="Founder inspected" date="MAY 2026" place="South Africa" ledgerId="STY-2026-000149" /></div>
            </div>
            <div>
              <p className="ledger-eyebrow">Map pins, favicon, social · roundel</p>
              <div className="mt-4"><Roundel volume="gatherings" text="33°54′S · 19°06′E · Leeu House · Vol III" entry="ENTRY 0149" size={150} /></div>
            </div>
          </section>

          <section className="mt-16 border-t ledger-rule pt-8">
            <p className="ledger-eyebrow">Offer marks · Worth Another Night and Time Rewarded</p>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-8 items-end justify-items-center">
              {(["stays", "gatherings", "voyages", "europe"] as const).map((k) => (
                <div key={k} className="text-center">
                  <TimeMark volume={k} size={150} />
                  <p className="mt-3 font-mono text-[10.5px] tracking-[0.16em] uppercase" style={{ color: VOLUME_STYLES[k].leather }}>{VOLUME_STYLES[k].label} · {VOLUME_STYLES[k].timeMark === "shipclock" ? "ship's clock" : VOLUME_STYLES[k].timeMark === "candle" ? "candle clock" : VOLUME_STYLES[k].timeMark}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 border-t ledger-rule pt-8">
            <p className="ledger-eyebrow">Final Call · late-departure savings, Voyages and Overland only</p>
            <div className="mt-6 grid md:grid-cols-2 gap-8">
              <div className="bg-[#F4F2EE] p-6"><FinalCallBoard volume="voyages" saving="SAVE XX%" /></div>
              <div className="bg-[#F4F2EE] p-6"><FinalCallBoard volume="overland" saving="SAVE XX%" /></div>
            </div>
          </section>

          <PreviewNote>
            <p>Live on the site from this release: the six volume colours on their sections (Voyages moves from sea teal to Admiralty Navy), white page backgrounds, founder marks as dated passport stamps in the volume&rsquo;s ink, and offers drawn with their volume&rsquo;s time mark or the Final Call board. The ink stamp, emboss and roundel are ready here for the next record-template pass.</p>
            <p>Founder marks still print only from each record&rsquo;s house status and date in the Base44 Ledger. Offer terms come only from the Offer Ledger. &ldquo;XX%&rdquo; above is a placeholder.</p>
          </PreviewNote>
        </div>
      </main>
    </>
  );
}
