"use client";
import { useEffect, useRef, type ReactNode } from "react";

// Holds a stamp or badge laid over a photograph: transparent, re-inked for the picture, and
// pressed in when it comes into view (styles in globals.css, .jw-onphoto).
export default function PhotoStamp({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { el.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`jw-onphoto ${className}`}>{children}</div>;
}
