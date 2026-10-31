import { SITE } from "@/lib/site";

// Wordmark — the house name as a mark, not a heading (31 Oct 2026).
//   editorial: Cormorant 700, the ampersand in italic 500, tracked tight
//   seal:      the seal's own letters — wide-spaced small caps, Cormorant 600
// Crimson on paper, cream over a film. `size` scales the whole lockup line.
export type WordmarkStyle = "editorial" | "seal" | "plain";

export default function Wordmark({ style = "editorial", light = false, size = 1, rule = true, line = true, fullLine = true }: { style?: WordmarkStyle; light?: boolean; size?: number; rule?: boolean; line?: boolean; fullLine?: boolean }) {
  const color = light ? "#F4F1ED" : style === "plain" ? undefined : "var(--jw-accent-hex)";
  const sub = light ? "rgba(244,241,237,0.8)" : "var(--jw-accent-hex)";
  return (
    <span className="flex flex-col min-w-0" style={{ color }}>
      {style === "seal" ? (
        <span className="font-display whitespace-nowrap leading-none" style={{ fontWeight: 600, fontVariant: "small-caps", letterSpacing: "0.14em", fontSize: `${2.05 * size}rem` }}>James Wild &amp; Co.</span>
      ) : style === "editorial" ? (
        <span className="font-display whitespace-nowrap leading-none" style={{ fontWeight: 700, letterSpacing: "-0.025em", fontSize: `${2.6 * size}rem` }}>
          James Wild <span style={{ fontStyle: "italic", fontWeight: 500, letterSpacing: 0, margin: "0 0.04em" }}>&amp;</span> Co.
        </span>
      ) : (
        <span className="font-display whitespace-nowrap leading-none" style={{ fontWeight: 700, letterSpacing: "-0.02em", fontSize: `${2.6 * size}rem` }}>James Wild &amp; Co.</span>
      )}
      {rule && <span className="block h-px mt-2" style={{ background: light ? "rgba(244,241,237,0.4)" : "rgb(var(--jw-accent) / 0.35)" }} aria-hidden="true" />}
      {line && (
        <span className="ledger-eyebrow whitespace-nowrap" style={{ color: sub, fontSize: `${10 * Math.max(size, 0.85)}px`, letterSpacing: "0.32em", marginTop: rule ? 6 : 8 }}>
          Exploring since {SITE.exploringSince}{fullLine && <span> · {SITE.homeOf}</span>}
        </span>
      )}
    </span>
  );
}
