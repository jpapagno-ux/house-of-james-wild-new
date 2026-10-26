"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

// A calling card that slides in while the traveller is reading the rates,
// pointing to the group call further down. It leaves once the host card is on
// screen, never returns after that, and can be dismissed for the session.
const KEY = "jw-calling-card";

export default function CallingCard({ who, seats = 6, watch = ["rates", "rooms", "suites", "cabins"], target = "host" }: { who: string; seats?: number; watch?: string[]; target?: string }) {
  const reduce = useReducedMotionSafe();
  const [inRates, setInRates] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(KEY)) setDone(true); } catch {}
    const visible = new Set<string>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).id;
        if (id === target) {
          if (e.isIntersecting) { setDone(true); try { sessionStorage.setItem(KEY, "seen"); } catch {} }
          continue;
        }
        if (e.isIntersecting) visible.add(id); else visible.delete(id);
      }
      setInRates(visible.size > 0);
    }, { threshold: 0.15 });
    [...watch, target].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [watch, target]);

  const close = () => { setDone(true); try { sessionStorage.setItem(KEY, "closed"); } catch {} };
  const show = inRates && !done;

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          key="card"
          aria-label="Meet them before you book"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: -48, rotate: -7 }}
          animate={{ opacity: 1, x: 0, rotate: -2 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -48, rotate: -6 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed z-40 left-3 right-3 bottom-[calc(76px+env(safe-area-inset-bottom))] lg:right-auto lg:left-6 lg:bottom-6 lg:w-[300px] bg-[#fdfcf8] text-[#2b2622] border border-[#e7e1d4] shadow-[0_18px_40px_-16px_rgba(40,30,15,.55)] px-4 pt-4 pb-3.5"
        >
          <span aria-hidden="true" className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#efe6cf]/85 rotate-[3deg] shadow-sm" />
          <button type="button" onClick={close} aria-label="Dismiss" className="absolute top-1.5 right-1.5 w-8 h-8 flex items-center justify-center text-[#6f655b] hover:text-[#2b2622]"><X className="w-4 h-4" strokeWidth={1.5} /></button>
          <div className="flex items-start gap-3 pr-6">
            <span aria-hidden="true" className="hidden lg:flex shrink-0 w-12 h-12 rounded-full border-2 border-crimson/70 text-crimson items-center justify-center rotate-[-14deg] ledger-display italic text-[15px]">JW</span>
            <div className="min-w-0">
              <p className="ledger-eyebrow !text-[9.5px] !text-[#8b3a2e]">Before you book</p>
              <p className="mt-1 text-[17px] lg:text-[19px] leading-tight text-[#3b2716] -rotate-[1.5deg]" style={{ fontFamily: "'Homemade Apple', cursive" }}>Meet them first.</p>
              <p className="mt-2 text-[13.5px] leading-snug text-[#5c4a38]">One live call with {who.toLowerCase()} and an advisor. Bring up to {seats} of you.</p>
            </div>
          </div>
          <a href={`#${target}`} onClick={() => setDone(true)} className="mt-3 inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase underline underline-offset-4 decoration-crimson/60 hover:text-crimson" data-event="calling_card_click">See how it works ↓</a>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
