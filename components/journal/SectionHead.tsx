import type { ReactNode } from "react";

// JWC-STYLE-01 primitive. The numbered section heading: "No. 01", a hairline, a mono label on the right, then the
// title in the display serif and an optional line beneath. House Standard tokens only, on Paper.
type Props = {
  /** The section number as printed, e.g. "01". */
  no?: string;
  /** The mono label at the right end of the rule, e.g. "Rooms and rates". */
  label?: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Anchor for the jump row. */
  id?: string;
  as?: "h2" | "h3";
  /** A slot under the title, before the lede (the voyages flag rule in a later stage). */
  rule?: ReactNode;
  className?: string;
};

export default function SectionHead({ no, label, title, lede, id, as: Tag = "h2", rule, className = "" }: Props) {
  return (
    <header id={id} className={`bg-white ${className}`}>
      <div className="flex items-center gap-4">
        {no && <span className="font-mono text-[11px] tracking-[0.18em] text-house shrink-0">No. {no}</span>}
        <span aria-hidden className="h-px flex-1 bg-keyline" />
        {label && <span className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-stone-text shrink-0">{label}</span>}
      </div>
      <Tag className="font-display font-medium text-graphite text-[34px] leading-[1.1] md:text-[44px] mt-4">{title}</Tag>
      {rule && <div className="mt-3">{rule}</div>}
      {lede && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-stone-text">{lede}</p>}
    </header>
  );
}
