"use client";

// <RouteViews>: one map frame, two views of the same voyage (James, 8 Nov 2026: "pick one and have a chance to open the
// other one... to save space; I think the 3D is the better one"). A squared switch (house chips) above the frame:
// "3D Flyover" (the MapTiler terrain, opened first) and "Itinerary Chart" (the house's engraved jw-chart).
// The chart is always in the page: it is what search engines and answer engines read (stop names, days), what prints,
// and what shows where WebGL is missing or the reader prefers reduced motion. The itinerary tabs of the day log drive
// both views (routeIndex), so the 3D map carries no second picker.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TerrainFlyoverProps } from "./TerrainFlyover";

const TerrainFlyover = dynamic(() => import("./TerrainFlyover"));

type View = "3d" | "chart";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function RouteViews({ chart, terrain, routeIndex = 0, className = "" }: { chart: ReactNode; terrain: Omit<TerrainFlyoverProps, "head" | "note">; routeIndex?: number; className?: string }) {
  const [can3d, setCan3d] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("3d");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ok = hasWebGL() && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCan3d(ok);
    if (!ok) setView("chart");
  }, []);

  const show = (v: View) => {
    setView(v);
    // the chart engine measures its frame: tell it the frame is back
    if (v === "chart") requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  };

  const three = can3d !== false && view === "3d";
  return (
    <div className={`jw-views ${className}`} data-view={three ? "3d" : "chart"}>
      {can3d !== false && (
        <div className="jw-views__switch" role="tablist" aria-label="Map view">
          <button type="button" role="tab" className="house-chip jw-views__tab" aria-selected={three} onClick={() => show("3d")}>3D Flyover</button>
          <button type="button" role="tab" className="house-chip jw-views__tab" aria-selected={!three} onClick={() => show("chart")}>Itinerary Chart</button>
        </div>
      )}
      <div className="jw-views__panes">
        <div ref={chartRef} className="jw-views__chart" aria-hidden={three || undefined}>{chart}</div>
        {three && (
          <div className="jw-views__3d">
            <TerrainFlyover {...terrain} bare routeIndex={routeIndex} hideRoutePicker onFail={() => { setCan3d(false); show("chart"); }} />
          </div>
        )}
      </div>
    </div>
  );
}
