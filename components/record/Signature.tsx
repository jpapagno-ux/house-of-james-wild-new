"use client";

import { useEffect, useRef, useState } from "react";
import { SIGNATURE } from "@/lib/content/signature";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

// The signature, written as it scrolls into view: the ink is revealed left to
// right behind a fountain-pen nib, wet blue-black first, then drying to the
// house's iron-gall brown. Reduced motion: already signed.
export default function Signature({ className = "w-44 md:w-52", label = "Signed, James Wild" }: { className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const done = reduce || go;
  const [x, y, w, h] = SIGNATURE.box;
  const id = "sig-clip";
  return (
    <div ref={ref} className={`relative ${className}`} role="img" aria-label={label}>
      <svg viewBox={`${x} ${y} ${w} ${h}`} className="w-full h-auto overflow-visible" aria-hidden="true">
        <defs><clipPath id={id}><rect x={x} y={y - 20} height={h + 40} width={w} style={{ transformOrigin: `${x}px 0`, transform: done ? "scaleX(1)" : "scaleX(0)", transition: reduce ? "none" : "transform 2.6s cubic-bezier(.55,.1,.35,1)" }} /></clipPath></defs>
        <path d={SIGNATURE.d} fillRule="evenodd" clipPath={`url(#${id})`} strokeWidth={5} strokeLinejoin="round" style={{ stroke: done ? "#3a2a1e" : "#14233f", fill: done ? "#3a2a1e" : "#14233f", transition: reduce ? "none" : "fill 2.2s ease 2.4s, stroke 2.2s ease 2.4s" }} />
      </svg>
      {!reduce && (
        <span aria-hidden="true" className="absolute top-[18%] pointer-events-none" style={{ left: done ? "100%" : "0%", opacity: go ? 0 : 1, transition: "left 2.6s cubic-bezier(.55,.1,.35,1), opacity .5s ease 2.6s" }}>
          <svg viewBox="0 0 40 40" className="w-8 h-8 -translate-x-1 -translate-y-7 rotate-[35deg] drop-shadow" aria-hidden="true">
            <path d="M20 2 L28 22 Q20 34 20 38 Q20 34 12 22 Z" fill="#b8893b" stroke="#6e4e1e" strokeWidth="1" />
            <path d="M20 14 L20 36" stroke="#3b2a12" strokeWidth="1" />
            <circle cx="20" cy="18" r="2" fill="#3b2a12" />
          </svg>
        </span>
      )}
    </div>
  );
}
