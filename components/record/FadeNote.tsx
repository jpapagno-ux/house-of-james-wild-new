"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

// A handwritten aside that fades in once the card is on screen, with a small
// arrow curling up toward the button above it.
export default function FadeNote({ children }: { children: ReactNode }) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.p
      initial={reduce ? false : { opacity: 0, y: 8, rotate: -3 }}
      whileInView={{ opacity: 1, y: 0, rotate: -2 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 flex items-start gap-2 text-[15px] md:text-[17px] leading-snug text-[#3b2716] max-w-md"
      style={{ fontFamily: "'Homemade Apple', cursive" }}
    >
      <svg viewBox="0 0 30 26" className="w-7 h-6 shrink-0 -mt-1 text-crimson" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M27 24 C 18 23, 8 18, 6 4" /><path d="M2 9 L 6 3 L 10 8" />
      </svg>
      <span className="pt-1">{children}</span>
    </motion.p>
  );
}
