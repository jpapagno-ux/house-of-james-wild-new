"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";

// ZoomFrame (map audit, 3 Nov 2026; James on iPhone: "tap and zoom don't work"): zoom and pan for the house's SVG
// charts (country maps, island chains). The chart is scaled with a CSS transform, so pins, labels and the hover card
// zoom with it.
// - On the page the chart never takes a finger: one finger scrolls the page; +, - and reset always work.
// - Touch screens: "Tap to explore" lifts the chart into a full-screen layer where one finger pans, two pinch and a
//   double tap zooms in; "Done" puts it back.
// - Desktop: click into the chart, then the wheel zooms; Ctrl/Cmd + wheel always zooms; drag pans once zoomed in.
const MAX = 6;

/** layerClass: classes the chart needs from its old ancestors once it is lifted into the layer (e.g. "ledger-chart is-drawn"). */
export default function ZoomFrame({ children, label, className = "", aspect, layerClass = "" }: { children: ReactNode; label: string; className?: string; aspect: string; layerClass?: string }) {
  const [v, setV] = useState({ k: 1, x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [exploring, setExploring] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ d: number; cx: number; cy: number } | null>(null);
  const tapAt = useRef<{ t: number; x: number; y: number }>({ t: 0, x: 0, y: 0 });
  const moved = useRef(false);

  const clamp = useCallback((n: { k: number; x: number; y: number }) => {
    const el = box.current; const w = el?.clientWidth ?? 1, h = el?.clientHeight ?? 1;
    const k = Math.min(MAX, Math.max(1, n.k));
    return { k, x: Math.min(0, Math.max(w * (1 - k), n.x)), y: Math.min(0, Math.max(h * (1 - k), n.y)) };
  }, []);
  // zoom by f about a point in the frame's own pixels
  const zoomAt = useCallback((f: number, px: number, py: number) => setV((o) => clamp({ k: o.k * f, x: px - (px - o.x) * f, y: py - (py - o.y) * f })), [clamp]);
  const centre = () => { const el = box.current; return [(el?.clientWidth ?? 0) / 2, (el?.clientHeight ?? 0) / 2] as const; };
  const local = (cx: number, cy: number) => { const r = box.current!.getBoundingClientRect(); return [cx - r.left, cy - r.top] as const; };

  useEffect(() => {
    const el = box.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey || active || exploring)) return;
      e.preventDefault();
      const [x, y] = local(e.clientX, e.clientY);
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, x, y);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [active, exploring, zoomAt]);

  useEffect(() => {
    if (!exploring) return;
    document.documentElement.classList.add("jwc-locked");
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setExploring(false); };
    addEventListener("keydown", esc);
    return () => { document.documentElement.classList.remove("jwc-locked"); removeEventListener("keydown", esc); };
  }, [exploring]);
  // the frame changes size when it lifts into the layer: keep the view inside it
  useEffect(() => { setV((o) => clamp(o)); }, [exploring, clamp]);

  const takes = (e: React.PointerEvent) => e.pointerType !== "touch" || exploring;
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.pointerType !== "touch") setActive(true);
    if (!takes(e)) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    const p = [...pts.current.values()];
    last.current = p.length === 2 ? { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), cx: (p[0].x + p[1].x) / 2, cy: (p[0].y + p[1].y) / 2 } : { d: 0, cx: e.clientX, cy: e.clientY };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId)) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = [...pts.current.values()]; const l = last.current; if (!l) return;
    if (p.length === 2) {
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), cx = (p[0].x + p[1].x) / 2, cy = (p[0].y + p[1].y) / 2;
      const [x, y] = local(cx, cy), f = l.d ? d / l.d : 1;
      setV((o) => clamp({ k: o.k * f, x: x - (x - o.x) * f + (cx - l.cx), y: y - (y - o.y) * f + (cy - l.cy) }));
      last.current = { d, cx, cy }; moved.current = true;
    } else if (p.length === 1) {
      const dx = e.clientX - l.cx, dy = e.clientY - l.cy;
      if (Math.hypot(dx, dy) > 3) moved.current = true;
      setV((o) => clamp({ ...o, x: o.x + dx, y: o.y + dy }));
      last.current = { d: 0, cx: e.clientX, cy: e.clientY };
    }
  };
  const onUp = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId)) return;
    pts.current.delete(e.pointerId);
    const rest = [...pts.current.values()];
    last.current = rest.length === 1 ? { d: 0, cx: rest[0].x, cy: rest[0].y } : null;
    if (e.pointerType === "touch" && !moved.current && !rest.length) {
      const now = Date.now(), t = tapAt.current;
      if (now - t.t < 320 && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 30) { const [x, y] = local(e.clientX, e.clientY); zoomAt(1.8, x, y); tapAt.current = { t: 0, x: 0, y: 0 }; }
      else tapAt.current = { t: now, x: e.clientX, y: e.clientY };
    }
  };

  const btn = "w-9 h-9 grid place-items-center bg-white/95 border border-[#2E2B28] text-[#2E2B28] hover:bg-[#2E2B28] hover:text-white";
  const chip = "absolute z-[3] inline-flex items-center min-h-[40px] px-4 bg-[#2E2B28] text-white text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[inset_0_-3px_0_#8B2525]";
  // Exploring, the frame is portalled to <body>: an ancestor with a transform or overflow would otherwise trap the layer.
  const frame = (
    <div className={exploring ? `fixed inset-0 z-[2147483000] bg-white p-2.5 flex flex-col ${layerClass}` : `relative ${className}`} role="group" aria-label={`${label}: zoomable map`}>
      <div ref={box} className={`relative overflow-hidden select-none ${exploring ? "flex-1 min-h-0 border border-[#DCD7D0]" : ""}`}
        style={{ aspectRatio: exploring ? undefined : aspect, touchAction: exploring ? "none" : "pan-y", cursor: v.k > 1 ? "grab" : undefined }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onMouseLeave={() => setActive(false)} data-zoom={v.k.toFixed(2)}>
        <div className="absolute inset-0 origin-top-left" style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.k})`, ...(exploring ? { display: "flex", alignItems: "center" } : {}) }}>
          <div className="relative w-full" style={exploring ? { aspectRatio: aspect, maxHeight: "100%", margin: "auto" } : { height: "100%" }}>{children}</div>
        </div>
        <div className="absolute right-2 top-2 z-[3] flex flex-row md:flex-col gap-1">
          <button type="button" aria-label="Zoom in" className={btn} onClick={() => { const [x, y] = centre(); zoomAt(1.5, x, y); }}><Plus className="w-4 h-4" /></button>
          <button type="button" aria-label="Zoom out" className={btn} onClick={() => { const [x, y] = centre(); zoomAt(1 / 1.5, x, y); }}><Minus className="w-4 h-4" /></button>
          <button type="button" aria-label="Reset the view" className={btn} onClick={() => setV({ k: 1, x: 0, y: 0 })}><RotateCcw className="w-4 h-4" /></button>
          {!exploring && <button type="button" aria-label="Explore full screen" className={btn} onClick={() => setExploring(true)}><Maximize2 className="w-4 h-4" /></button>}
        </div>
        {!exploring && <button type="button" onClick={() => setExploring(true)} className={`${chip} jw-touch-only left-1/2 -translate-x-1/2 bottom-3`}>Tap to explore</button>}
        {exploring && <button type="button" onClick={() => setExploring(false)} className={`${chip} left-2 top-2`} autoFocus>Done</button>}
      </div>
    </div>
  );
  if (exploring && typeof document !== "undefined") return <>
    <div className={`relative ${className}`} style={{ aspectRatio: aspect }} aria-hidden="true" />
    {createPortal(frame, document.body)}
  </>;
  return frame;
}
