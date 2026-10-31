import Wordmark from "@/components/ledger/Wordmark";
import { JwcoSeal } from "@/components/ledger/Marks";

// Preview: the wordmark two ways, on paper and over a film, desktop and phone
// widths, for James to choose (31 Oct 2026).
export const metadata = { title: "Wordmark", robots: { index: false, follow: false } };

function Lockup({ style, light, phone }: { style: "editorial" | "seal" | "plain"; light: boolean; phone?: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: phone ? 10 : 20 }}>
      <JwcoSeal size={phone ? 40 : 78} tone={light ? "light" : "ink"} />
      <Wordmark style={style} light={light} size={phone ? 0.52 : 1} fullLine={!phone} />
    </div>
  );
}

function Row({ title, style }: { title: string; style: "editorial" | "seal" | "plain" }) {
  return (
    <section className="mt-12">
      <p className="ledger-eyebrow ledger-crimson">{title}</p>
      <div className="mt-4 grid lg:grid-cols-[1fr_390px] gap-6 items-start">
        <div className="border ledger-border">
          <div className="h-[116px] px-10 flex items-center justify-center bg-gradient-to-b from-paper to-[#FBF5F4]" style={{ borderTop: "3px solid #8B2525" }}><Lockup style={style} light={false} /></div>
          <div className="h-[116px] px-10 flex items-center justify-center bg-ink"><Lockup style={style} light /></div>
        </div>
        <div className="border ledger-border w-[390px]">
          <div className="h-[76px] px-5 grid grid-cols-[auto_1fr_auto] items-center bg-paper"><span className="w-6 h-px bg-ink" /><span className="justify-self-center"><Lockup style={style} light={false} phone /></span><span className="ledger-eyebrow !text-[10px] border border-crimson text-crimson px-3 py-2">Plan</span></div>
          <div className="h-[76px] px-5 grid grid-cols-[auto_1fr_auto] items-center bg-ink"><span className="w-6 h-px bg-paper" /><span className="justify-self-center"><Lockup style={style} light phone /></span><span className="ledger-eyebrow !text-[10px] border border-paper/70 text-paper px-3 py-2">Plan</span></div>
        </div>
      </div>
    </section>
  );
}

export default function WordmarkPreview() {
  return (
    <main className="max-w-[1400px] mx-auto px-5 md:px-10 py-12">
      <p className="ledger-eyebrow ledger-crimson">The wordmark</p>
      <h1 className="ledger-h2 mt-2">Two ways to set the name, in House Crimson</h1>
      <p className="mt-3 text-[16px] ledger-muted max-w-2xl">Paper and film, desktop (left) and phone (right). Crimson on paper, cream over a film; the house line sits on a hairline rule.</p>
      <Row title="1 · Editorial — Cormorant 700, the ampersand in italic" style="editorial" />
      <Row title="2 · The seal's own letters — wide-spaced small caps" style="seal" />
      <Row title="0 · As it is today — ink, plain ampersand (for comparison)" style="plain" />
    </main>
  );
}
