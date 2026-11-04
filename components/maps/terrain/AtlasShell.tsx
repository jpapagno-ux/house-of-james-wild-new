"use client";

// <AtlasShell>: the country atlas client shell. It checks for WebGL and reduced motion, and loads the MapLibre
// half only when needed: on a wide screen when the section comes within 600px of the viewport, on a phone only after a
// tap on the still poster ("Tap to explore"). Without WebGL the poster stays and the list below carries every place.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AtlasData, AtlasLayer } from "./atlas";
import "./terrain.css";

const AtlasMap = dynamic(() => import("./AtlasMap"), { ssr: false, loading: () => null });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function AtlasShell({ data, title, poster }: { data: AtlasData; title: string; poster: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [phone, setPhone] = useState(false);
  const [go, setGo] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [initial, setInitial] = useState<Partial<Record<AtlasLayer, boolean>> | undefined>(undefined);

  useEffect(() => {
    setOk(hasWebGL());
    setPhone(window.matchMedia("(max-width: 639px)").matches);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    // ?layers=pins,dives opens with those layers (for review links and screenshots).
    const want = new URLSearchParams(window.location.search).get("layers");
    if (want) { const set = new Set(want.split(",")); setInitial({ pins: set.has("pins"), parks: set.has("parks"), dives: set.has("dives"), volcanoes: set.has("volcanoes") }); }
    return () => mq.removeEventListener?.("change", on);
  }, []);

  useEffect(() => {
    if (!ok || phone || go || !ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { rootMargin: "600px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ok, phone, go]);

  return (
    <div ref={ref} className="mt-6 jw-atlas__shell">
      {go && ok
        ? <AtlasMap data={data} title={title} reduced={reduced} initial={initial} onFail={() => { setOk(false); setGo(false); }} />
        : (
          <div className="jw-atlas__poster">
            {poster}
            {ok && phone && <button type="button" className="jw-relief__btn jw-relief__btn--main jw-atlas__tap" onClick={() => setGo(true)}>Tap to explore</button>}
            {ok !== false && !phone && <p className="jw-relief__wait jw-atlas__wait">Raising the terrain</p>}
          </div>
        )}
    </div>
  );
}
