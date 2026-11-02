import Link from "next/link";
import s from "./coming.module.css";

// What's Coming's copy of the house button family (James, 2 Nov 2026). Scoped to components/coming and named Wc*
// so it can be swapped for the shared House Standard component (branch house-standard) at merge.
// - WcLedgerColumn, THE LEDGER COLUMN, for "Plan with James": a 56px row with a 1px Ink border and a Manrope label,
//   then a House Crimson cell with a white arrow that widens from 56px to 84px on hover or focus.
// - WcEditorialLine, THE EDITORIAL LINE, for quiet links: no box, Cormorant italic, an arrow that stretches from
//   34px to 60px, and a 1px rule beneath growing from 28% to 100%.
// One element each: in the house look the Wc classes restyle it; in concept A (?look=a) the same element keeps its
// ledger-btn classes and the extra parts are hidden, so the first preview is unchanged.
type Tone = "light" | "dark";
type Common = { children: React.ReactNode; tone?: Tone; className?: string; legacy: string };

export function WcLedgerColumn({ href, children, tone = "light", className = "", legacy }: Common & { href: string }) {
  return (
    <Link href={href} className={`${legacy} ${s.lcol} ${tone === "dark" ? s.lcolDark : ""} ${className}`}>
      <span className={s.lcolLabel}>{children}</span>
      <span className={s.lcolCell} aria-hidden="true">
        <svg viewBox="0 0 20 12" width="20" height="12"><path d="M0 6h18M13 1l5 5-5 5" fill="none" stroke="#FFFFFF" strokeWidth="1.4" /></svg>
      </span>
    </Link>
  );
}

export function WcEditorialLine({ href, onClick, children, tone = "light", className = "", legacy }: Common & { href?: string; onClick?: () => void }) {
  const cls = `${legacy} ${s.eline} ${tone === "dark" ? s.elineDark : ""} ${className}`;
  const inner = (<><span className={s.elineText}>{children}</span><span className={s.elineArrow} aria-hidden="true" /></>);
  if (href?.startsWith("#")) return <a href={href} className={cls}>{inner}</a>;
  return href ? <Link href={href} className={cls}>{inner}</Link> : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}
