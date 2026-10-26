"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SIGNATURE } from "@/lib/content/signature";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

// James's JW, written with a quill as it scrolls into view. The traced
// monoline is drawn through a broad, angled nib (the path stamped along the
// nib's edge), which gives the thick-and-thin of a cut quill; a faint
// turbulence roughens the edge the way iron-gall ink bleeds into paper. The
// ink goes down wet and dark, then dries to sepia. Reduced motion: signed.
const NIB = { angle: -38, length: 34, steps: 14 }; // degrees, viewBox units, stamps

export default function Signature({ className = "w-32 md:w-40", label = "Signed, James Wild" }: { className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotionSafe();
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const done = reduce || go;
  const [x, y, w, h] = SIGNATURE.box;
  const rad = (NIB.angle * Math.PI) / 180;
  const stamps = Array.from({ length: NIB.steps }, (_, i) => { const t = i / (NIB.steps - 1) - 0.5; return [t * NIB.length * Math.cos(rad), t * NIB.length * Math.sin(rad)]; });
  const ink = done ? "#3b2716" : "#120d1f";
  const ease = "cubic-bezier(.55,.1,.35,1)";
  return (
    <div ref={ref} className={`relative ${className}`} role="img" aria-label={label}>
      <svg viewBox={`${x - 30} ${y - 30} ${w + 60} ${h + 60}`} className="w-full h-auto overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id={`c${uid}`}><rect x={x - 40} y={y - 60} height={h + 120} width={w + 80} style={{ transformOrigin: `${x - 40}px 0`, transform: done ? "scaleX(1)" : "scaleX(0)", transition: reduce ? "none" : `transform 2.8s ${ease}` }} /></clipPath>
          <filter id={`f${uid}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
          </filter>
          <path id={`p${uid}`} d={SIGNATURE.d} fillRule="evenodd" />
        </defs>
        <g clipPath={`url(#c${uid})`} filter={`url(#f${uid})`} style={{ fill: ink, transition: reduce ? "none" : "fill 2.4s ease 2.6s" }}>
          {stamps.map(([dx, dy], i) => <use key={i} href={`#p${uid}`} x={dx} y={dy} />)}
        </g>
      </svg>
      {!reduce && (
        <span aria-hidden="true" className="absolute top-[30%] pointer-events-none" style={{ left: done ? "98%" : "2%", opacity: go ? 0 : 1, transition: `left 2.8s ${ease}, opacity .6s ease 2.8s` }}>
          <svg viewBox="0 0 120 120" className="w-14 h-14 -translate-x-[6px] -translate-y-[55%] drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]" aria-hidden="true">
            {/* quill: vane, barbs, shaft, cut nib touching the page at (6,114) */}
            <path d="M112 4 C84 10 52 36 30 74 C40 64 54 56 70 50 C58 58 46 70 38 82 C60 66 90 40 112 4 Z" fill="#efe6d4" stroke="#8a7458" strokeWidth="1.2" />
            <path d="M104 12 L48 66 M96 20 L44 62 M88 28 L40 70 M80 36 L50 62 M72 44 L46 66" stroke="#b8a586" strokeWidth=".8" />
            <path d="M112 4 L14 104" stroke="#6b5338" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M14 104 L6 114 L11 102 Z" fill="#2a1a10" />
          </svg>
        </span>
      )}
    </div>
  );
}
