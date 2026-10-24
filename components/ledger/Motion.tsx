"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

// The house's scroll language, ported from the Base44 sample: sections settle
// in, stamps press down, a crimson hairline tracks reading. Only opacity and
// transform animate (no layout shift), content is always in the DOM, and
// everything is off for visitors who prefer reduced motion.

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children, delay = 0, y = 28, className = "" }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StampPress({ children, className = "", delay = 0.15 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 1.9, rotate: -24 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ type: "spring", stiffness: 420, damping: 18, mass: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  if (reduce) return null;
  return <motion.div aria-hidden="true" className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60] bg-crimson" style={{ scaleX }} />;
}
