"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

// RouteLine — a dotted route with four waypoints that draws itself as the
// Overland section scrolls into view. Decorative, hidden from readers.
export default function RouteLine() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "start 30%"] });
  const length = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const d = "M4 30 C 90 4, 160 50, 250 26 S 420 8, 500 30 S 660 52, 796 20";
  return (
    <div ref={ref}>
    <svg viewBox="0 0 800 56" className="mt-5 w-full h-10 md:h-12 ledger-crimson" aria-hidden="true" fill="none">
      <path d={d} stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
      <motion.path d={d} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" style={reduce ? undefined : { pathLength: length }} />
      {[[4, 30], [250, 26], [500, 30], [796, 20]].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="4" fill="#F4F1ED" stroke="currentColor" strokeWidth="1.5" />
      ))}
    </svg>
    </div>
  );
}
