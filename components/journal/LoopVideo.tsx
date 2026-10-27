"use client";

import { useEffect, useRef, useState } from "react";

// A silent, looping clip in place of a photograph. Nothing downloads until it
// scrolls near the screen; it plays only while visible; with reduced motion
// it stays on its poster frame.
export default function LoopVideo({ src, poster, label, className = "" }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); v.play().catch(() => {}); } else v.pause();
    }, { rootMargin: "200px 0px", threshold: 0.15 });
    io.observe(v); return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} className={className} poster={poster} muted loop playsInline preload="none" aria-label={label} src={on ? src : undefined} />
  );
}
