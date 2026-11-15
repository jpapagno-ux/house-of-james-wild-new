"use client";

// The Terra Y route maps: the overview under the hero (plays the route stop by stop while in view) and the day-log
// companion (a sticky map that follows the day cards as they scroll by). The MapLibre half loads only near the
// viewport and only with WebGL; without it the section keeps its frame and the day log reads on its own.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TyStop } from "@/lib/content/terra-y";

const TerraYMap = dynamic(() => import("./TerraYMap"), { ssr: false, loading: () => null });

function useNear(ref: React.RefObject<HTMLElement | null>, margin = "600px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el); return () => io.disconnect();
  }, [ref, near, margin]);
  return near;
}
const webgl = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } };
const useReduced = () => { const [r, setR] = useState(false); useEffect(() => { setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []); return r; };

function Frame({ children, className = "", ok }: { children: ReactNode; className?: string; ok: boolean }) {
  return (
    <div className={`ty-map relative overflow-hidden ${className}`}>
      {children}
      {!ok && <div className="absolute inset-0 grid place-items-center ty-mono text-[10.5px]" style={{ color: "var(--ty-glacier)" }}>Charting the route</div>}
    </div>
  );
}

/** Under the hero: the whole route, then each stop in turn while the map is on screen. */
export function TyRouteOverview({ stops, labels, title }: { stops: TyStop[]; labels: string[]; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNear(ref);
  const reduced = useReduced();
  const [gl, setGl] = useState(true);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  useEffect(() => setGl(webgl()), []);
  // Start once, when the map is ready and half in view; stop when it leaves.
  useEffect(() => {
    const el = ref.current; if (!el || !ready || reduced) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), { threshold: 0.5 });
    io.observe(el); return () => io.disconnect();
  }, [ready, reduced]);
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setActive((a) => (a + 1 >= stops.length ? -1 : a + 1)), active < 0 ? 2600 : 5200);
    return () => clearTimeout(id);
  }, [playing, active, stops.length]);
  return (
    <div ref={ref}>
      <Frame ok={ready} className="aspect-[4/5] sm:aspect-[16/9] max-h-[78svh] border" >
        {near && gl && <TerraYMap stops={stops} active={active} label={(i) => labels[i]} reduced={reduced} onReady={() => setReady(true)} onFail={() => setGl(false)} />}
      </Frame>
      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={`${title} route`}>
        <button type="button" className="ty-chipbtn" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "Pause the route" : "Play the route"}</button>
        {stops.map((s, i) => (
          <button key={i} type="button" className="ty-chipbtn" aria-pressed={active === i} onClick={() => { setPlaying(false); setActive(i); }}>
            <span className="ty-mono text-[9.5px] opacity-70">{labels[i]}</span> {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Beside the day log: a sticky map that follows whichever day card is in the middle of the screen. */
export function TyRouteScroll({ stops, labels, children }: { stops: TyStop[]; labels: string[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNear(ref, "300px");
  const reduced = useReduced();
  const [gl, setGl] = useState(true);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(-1);
  useEffect(() => setGl(webgl()), []);
  useEffect(() => {
    const root = ref.current; if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-ty-stop]"));
    const io = new IntersectionObserver((es) => {
      const on = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (on) { const i = Number(on.target.getAttribute("data-ty-stop")); if (i >= 0) setActive(i); }
    }, { rootMargin: "-45% 0px -45% 0px" });
    cards.forEach((c) => io.observe(c)); return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-8 items-start">
      <div className="order-2 lg:order-1 min-w-0">{children}</div>
      <div className="order-1 lg:order-2 sticky top-[calc(var(--jw-header-h,80px)+8px)] z-10">
        <Frame ok={ready} className="h-[38svh] lg:h-[calc(100svh-var(--jw-header-h,80px)-32px)] border">
          {near && gl && <TerraYMap stops={stops} active={active} label={(i) => labels[i]} reduced={reduced} onReady={() => setReady(true)} onFail={() => setGl(false)} />}
        </Frame>
      </div>
    </div>
  );
}
