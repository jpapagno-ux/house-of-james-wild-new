"use client";

import { useId, useState, type ReactNode } from "react";

// JWC-STYLE-01 primitive. One row that opens: a house icon, a title in the display serif, a plus that turns to a
// cross, and the detail folded beneath. White ground, hairline between rows. The detail stays in the page (hidden,
// not removed) so search and answer engines read every row. Keyboard: a real button with aria-expanded.
type Props = {
  title: ReactNode;
  children: ReactNode;
  /** A small line icon to the left of the title (a house icon; passed in). */
  icon?: ReactNode;
  /** Small capitals above the title, e.g. "Day 01 · Sorong". */
  eyebrow?: string;
  /** A thumbnail or mark to the far left (day by day rows). */
  lead?: ReactNode;
  defaultOpen?: boolean;
  as?: "h3" | "h4";
  className?: string;
};

export default function AccordionRow({ title, children, icon, eyebrow, lead, defaultOpen = false, as: Tag = "h3", className = "" }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`bg-white border-t border-[color:var(--jw-hairline)] ${className}`}>
      <Tag className="m-0">
        <button type="button" aria-expanded={open} aria-controls={`${id}p`} id={`${id}b`} onClick={() => setOpen((o) => !o)} className="group flex w-full items-center gap-4 py-4 text-left focus-visible:outline-offset-[-2px]">
          {lead && <span className="shrink-0">{lead}</span>}
          {icon && <span aria-hidden className="shrink-0 w-6 h-6 inline-flex items-center justify-center text-graphite">{icon}</span>}
          <span className="min-w-0 flex-1">
            {eyebrow && <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-house mb-0.5">{eyebrow}</span>}
            <span className="block font-display font-medium text-[21px] leading-snug text-graphite">{title}</span>
          </span>
          <span aria-hidden className="relative shrink-0 w-7 h-7 border border-[color:var(--jw-keyline)] group-hover:border-[color:var(--jw-graphite)] transition-colors">
            <span className={`absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-graphite transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-45" : ""}`} />
            <span className={`absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-graphite transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-45" : ""}`} />
          </span>
        </button>
      </Tag>
      <div id={`${id}p`} role="region" aria-labelledby={`${id}b`} hidden={!open} className={`pb-5 text-[14.5px] leading-relaxed text-stone-text ${icon ? "pl-10" : ""} pr-11`}>
        {children}
      </div>
    </div>
  );
}
