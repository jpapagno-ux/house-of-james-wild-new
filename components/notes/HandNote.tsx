"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

// The house's handwritten aside, site-wide (James, 3 Nov 2026: "I love these little arrows, let's keep using
// them site wide"). One note in James's hand, with a small crimson arrow drawn toward what it is about:
//   up     curls up toward the button or line above (the original FadeNote)
//   down   drops toward the list or form below
//   left / right   points sideways at a neighbour (mirrors on narrow screens are the caller's choice)
// The note fades in once it is on screen and the arrow draws itself; with reduced motion both are simply there.
// Rules: one note per screen at most, every word true and James's own, signed "JW" (sign={false} to leave it off).
// With href the whole note is a link (to an anchor on the page, or a page).
export type ArrowDirection = "up" | "down" | "left" | "right" | "none";

const ARROWS: Record<Exclude<ArrowDirection, "none">, { box: string; d: string[]; size: string }> = {
  up: { box: "0 0 30 26", d: ["M27 24 C 18 23, 8 18, 6 4", "M2 9 L 6 3 L 10 8"], size: "w-7 h-6 -mt-1" },
  down: { box: "0 0 30 30", d: ["M4 3 C 14 4, 22 10, 23 26", "M18 21 L 23 27 L 27 20"], size: "w-7 h-7 mt-1" },
  right: { box: "0 0 40 22", d: ["M2 14 C 12 4, 26 4, 36 12", "M30 6 L 37 12 L 29 16"], size: "w-9 h-5" },
  left: { box: "0 0 40 22", d: ["M38 14 C 28 4, 14 4, 4 12", "M10 6 L 3 12 L 11 16"], size: "w-9 h-5" },
};

export default function HandNote({ children, arrow = "up", sign = true, href, tone = "ink", className = "", label }: {
  children: ReactNode;
  arrow?: ArrowDirection;
  sign?: boolean;
  href?: string;
  /** ink on paper (default), or ivory over a photograph */
  tone?: "ink" | "ivory";
  className?: string;
  /** Accessible name when the note is a link and its words alone don't say where it goes. */
  label?: string;
}) {
  const reduce = useReducedMotionSafe();
  const a = arrow === "none" ? null : ARROWS[arrow];
  const after = arrow === "right";
  const colour = tone === "ivory" ? "text-[#FFFDF7]" : "text-[#3b2716]";
  const svg = a && (
    <svg viewBox={a.box} className={`${a.size} shrink-0 ${tone === "ivory" ? "text-[#FFFDF7]" : "text-house"}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {a.d.map((d, i) => (
        <motion.path key={i} d={d}
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: i === 0 ? 0.7 : 0.25, delay: 1.0 + i * 0.7, ease: "easeOut" }} />
      ))}
    </svg>
  );
  const body = (
    <>
      {!after && svg}
      <span className="pt-1">{children}{sign && <> <span className="whitespace-nowrap">JW</span></>}</span>
      {after && svg}
    </>
  );
  const cls = `flex ${arrow === "left" || arrow === "right" ? "items-center" : "items-start"} gap-2 text-[15px] md:text-[17px] leading-snug max-w-md ${colour} ${className}`;
  const motionProps = {
    initial: reduce ? false : { opacity: 0, y: 8, rotate: -3 },
    whileInView: { opacity: 1, y: 0, rotate: -2 },
    viewport: { once: true, amount: 0.8 },
    transition: { duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    style: { fontFamily: "'Homemade Apple', cursive" },
  };
  return href ? (
    <motion.a href={href} aria-label={label} {...motionProps} className={`${cls} decoration-1 underline-offset-[5px] hover:underline focus-visible:underline`}>{body}</motion.a>
  ) : (
    <motion.p {...motionProps} className={cls}>{body}</motion.p>
  );
}
