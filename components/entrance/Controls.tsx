"use client";

import { Pause, Play } from "lucide-react";
import type { ReactNode } from "react";

// The small control in the bottom right of a volume entrance: "Pause film" /
// "Play film" (or slides), squared, white on the photograph, with an optional
// Plex Mono counter beside it ("03 / 05"). Sits above the phone action bar and the
// iPhone home indicator (.jw-entrance__rail in app/globals.css).
export function ControlRail({ children }: { children: ReactNode }) {
  return (
    <div className="jw-entrance__rail absolute right-4 md:right-8 z-[3] flex items-center gap-4">
      {children}
    </div>
  );
}

export function PauseControl({ paused, onToggle, what }: { paused: boolean; onToggle: () => void; what: "film" | "slides" }) {
  const label = `${paused ? "Play" : "Pause"} ${what}`;
  return (
    <ControlRail>
      <PauseButton paused={paused} onToggle={onToggle} label={label} />
    </ControlRail>
  );
}

export function PauseButton({ paused, onToggle, label }: { paused: boolean; onToggle: () => void; label: string }) {
  const Icon = paused ? Play : Pause;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      className="inline-flex items-center gap-2 h-9 px-3 border border-white/55 bg-black/25 backdrop-blur-sm text-white font-mono text-[10px] uppercase tracking-[0.22em] hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
      {label}
    </button>
  );
}
