"use client";

// <TerrainFlyover>: the 3D terrain pilot's client shell. It reserves the frame, checks for WebGL and reduced motion,
// and loads the MapLibre half (TerrainMap) only when the section comes within 600px of the viewport, so it never
// touches LCP. Without WebGL (or if MapLibre cannot start) the whole section steps aside: the SVG chart above remains.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TerrainKind, TerrainRoute, TerrainStop } from "./geo";
import "./terrain.css";

const TerrainMap = dynamic(() => import("./TerrainMap"), { ssr: false, loading: () => null });

export type TerrainFlyoverProps = {
  /** Ordered routes (stops with lat, lng, day and name), or `points` for a points view. */
  routes?: TerrainRoute[];
  route?: TerrainRoute;
  points?: TerrainStop[];
  kind?: TerrainKind;
  /** Route and pin colour: a volume base from lib/volumes.ts (volumeMark), passed in. */
  ink: string;
  title: string;
  exaggeration?: number;
  playLabel?: string;
  head?: ReactNode;
  note?: ReactNode;
  id?: string;
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function TerrainFlyover({ routes, route, points, kind, ink, title, exaggeration = 1.4, playLabel = "Play the voyage", head, note, id = "see-in-3d" }: TerrainFlyoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [near, setNear] = useState(false);
  const [reduced, setReduced] = useState(false);
  const list: TerrainRoute[] = routes ?? (route ? [route] : points ? [{ name: title, stops: points }] : []);
  const k: TerrainKind = kind ?? (points ? "points" : "voyage");

  useEffect(() => {
    setOk(hasWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  useEffect(() => {
    if (!ok || near || !ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "600px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ok, near]);

  if (ok === false || !list.length || !list[0].stops.length) return null;
  return (
    <section id={id} className="jw-relief mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby={`${id}-h`} data-terrain-pilot="1">
      {head}
      <div ref={ref} className="mt-6">
        {near && ok
          ? <TerrainMap routes={list} kind={k} ink={ink} exaggeration={exaggeration} reduced={reduced} playLabel={playLabel} title={title} onReady={() => undefined} onFail={() => setOk(false)} />
          : <div className="jw-relief__frame"><p className="jw-relief__wait">Raising the terrain</p></div>}
      </div>
      {note && <p className="jw-relief__note">{note}</p>}
    </section>
  );
}
