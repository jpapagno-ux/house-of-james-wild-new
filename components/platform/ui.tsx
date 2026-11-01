import Link from "next/link";
import type { Tone } from "@/lib/platform/labels";

// Partner Desk primitives on the production Ledger tokens: white page, paper-card
// panels, hairline rules, Cormorant headings, Manrope text, square corners, no shadows.
// Status tones use house chrome (forest, sea, rust), never a volume colour (CLAUDE.md).

const TONE: Record<Tone, string> = {
  neutral: "border-ink/25 text-ink/75 bg-paper",
  progress: "border-sea-deep/35 text-sea-deep bg-coast-mist",
  good: "border-forest/35 text-forest bg-[#EEF1EA]",
  attention: "border-rust/40 text-rust bg-rust-wash",
  closed: "border-ink/15 text-ink/55 bg-paper-card",
};

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return <span className={`inline-flex items-center gap-1.5 border px-2 py-[3px] text-[10.5px] tracking-[0.14em] uppercase font-medium whitespace-nowrap ${TONE[tone]}`}>{label}</span>;
}

export function PageHead({ eyebrow, title, lead, actions }: { eyebrow: string; title: string; lead?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b ledger-rule pb-6">
      <div className="max-w-2xl">
        <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>
        <h1 className="ledger-display text-[2.1rem] leading-[1.05] md:text-[2.7rem] mt-2">{title}</h1>
        {lead && <p className="mt-3 text-[16px] ledger-muted leading-relaxed">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3 md:justify-end">{actions}</div>}
    </header>
  );
}

export function Section({ title, aside, children, id }: { title: string; aside?: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section className="mt-10" aria-labelledby={id}>
      <div className="flex items-baseline justify-between gap-4 border-b ledger-border pb-2">
        <h2 id={id} className="ledger-display text-[1.45rem] md:text-[1.6rem] leading-tight">{title}</h2>
        {aside && <div className="text-[13px]">{aside}</div>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-paper-card border ledger-border p-5 md:p-6 ${className}`}>{children}</div>;
}

/** Definition list for record facts: label left, value right; stacks on phones. */
export function DataList({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-ink/10 border-y ledger-border">
      {rows.map(([k, v]) => (
        <div key={k} className="grid sm:grid-cols-[200px_1fr] gap-1 sm:gap-6 py-3">
          <dt className="text-[13px] ledger-muted">{k}</dt>
          <dd className="text-[15px]">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Notice({ tone = "neutral", title, children }: { tone?: "neutral" | "attention" | "good"; title?: string; children: React.ReactNode }) {
  const c = tone === "attention" ? "border-l-rust bg-rust-wash" : tone === "good" ? "border-l-forest bg-[#EEF1EA]" : "border-l-ink/40 bg-paper-card";
  return (
    <div role={tone === "attention" ? "status" : undefined} className={`border-l-[3px] ${c} px-4 py-3 text-[14.5px] leading-relaxed`}>
      {title && <p className="font-medium">{title}</p>}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="border border-dashed ledger-border px-5 py-8 text-center">
      <p className="ledger-display text-[1.3rem]">{title}</p>
      {children && <div className="mt-2 text-[14.5px] ledger-muted max-w-md mx-auto">{children}</div>}
    </div>
  );
}

/** Portfolio Health ring: one number, drawn quietly. */
export function HealthRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = 42, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Portfolio Health ${score}%`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(45,42,38,0.12)" strokeWidth="5" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--jw-accent-hex)" strokeWidth="5" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="butt" transform="rotate(-90 50 50)" />
      <text x="50" y="56" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="26" fill="#2D2A26">{score}%</text>
    </svg>
  );
}

export function CheckLine({ state, label, detail }: { state: "ok" | "attention" | "missing"; label: string; detail: string }) {
  const mark = state === "ok" ? "✓" : state === "attention" ? "!" : "–";
  const cls = state === "ok" ? "text-forest border-forest/40" : state === "attention" ? "text-rust border-rust/50" : "text-ink/50 border-ink/30";
  return (
    <li className="flex items-start gap-3 py-2">
      <span aria-hidden="true" className={`mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center border text-[12px] font-semibold ${cls}`}>{mark}</span>
      <span className="text-[14.5px] leading-snug">
        <span className="font-medium">{label}</span>
        <span className="sr-only">{state === "ok" ? " (in order)" : state === "attention" ? " (needs attention)" : " (missing)"}</span>
        <span className="block ledger-muted text-[13.5px]">{detail}</span>
      </span>
    </li>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="ledger-btn-ghost uppercase">{children}</Link>;
}

export function LedgerId({ id }: { id: string }) {
  return <span className="font-mono text-[12px] tracking-[0.06em] ledger-crimson">{id}</span>;
}
