"use client";
import { useEffect, useRef, useState } from "react";
import CompassAtlas, { type AtlasFit } from "@/components/compass/CompassAtlas";
import type { ChartData } from "@/components/destination/LedgerChart";
import { resolveAtlasPlaces, type AtlasPlace, type IggiPlace } from "@/lib/atlas/resolve";

// IggiAtlas — Iggi hands the places it named to the Atlas (board §D item 3, James 4 Nov 2026:
// "Compass chooses · Atlas shows · Iggi explains and hands over"). The Core posts `ji:atlas` with
// the journey's recommended stays (slug, Ledger ID, name, reason); this resolves them against the
// Ledger's pinned places and flies the camera to each, exactly as the Compass does. Places the
// Ledger cannot pin are still listed, as text, so nothing Iggi said goes missing.
//
// Both JSON files are fetched once, on first use; a page with no handoff never loads them.

export type { IggiPlace };
type Place = AtlasPlace;

let worldP: Promise<ChartData> | null = null;
let placesP: Promise<Place[]> | null = null;
const world = () => (worldP ??= fetch("/atlas/world.json").then((r) => r.json() as Promise<ChartData>));
const places = () => (placesP ??= fetch("/atlas/places.json").then((r) => r.json()).then((j: { places: Place[] }) => j.places));

export default function IggiAtlas({ stays, title, focus }: { stays: IggiPlace[]; title?: string | null; focus?: number }) {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [fits, setFits] = useState<AtlasFit[] | null>(null);
  const [unpinned, setUnpinned] = useState<string[]>([]);
  const host = useRef<HTMLDivElement>(null);
  const key = stays.map((s) => s.ledger_id || s.slug || s.name || "").join("|");

  useEffect(() => {
    let cancelled = false;
    Promise.all([world(), places()]).then(([w, ps]) => {
      if (cancelled) return;
      const { fits: out, unpinned: miss } = resolveAtlasPlaces(stays, ps);
      setChart(w); setFits(out.map((p) => ({ slug: p.slug, name: p.name, href: p.href, country: p.country, lat: p.lat, lng: p.lng, ledgerId: p.ledgerId }))); setUnpinned(miss);
    }).catch(() => { if (!cancelled) { setFits([]); setUnpinned(stays.map((s) => s.name || "").filter(Boolean)); } });
    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Iggi's "Show on the Atlas" button: bring the chart into view once it is ready.
  useEffect(() => {
    if (!focus || !fits?.length || !host.current) return;
    host.current.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }, [focus, fits]);

  if (!fits) return <p className="mt-6 text-[14px] ledger-muted" aria-live="polite">Opening the Atlas…</p>;
  if (!fits.length && !unpinned.length) return null;
  return (
    <div ref={host} className="scroll-mt-28" data-iggi-atlas>
      {chart && fits.length > 0 && (
        <CompassAtlas chart={chart} fits={fits} id="iggi-atlas-h" title={title ? `${title}, on the Atlas.` : "Where Iggi's places are."} explain={`${fits.length} Ledger record${fits.length === 1 ? "" : "s"} Iggi named in this chat, flown to in the order given. Open any of them; a person finishes the trip.`} caption="Iggi named these from the Ledger; the Atlas shows where they are. Click a number to fly there." />
      )}
      {unpinned.length > 0 && (
        <p className="mt-3 text-[13.5px] ledger-muted">Not pinned on the Atlas yet: {unpinned.join(", ")}. Iggi named {unpinned.length === 1 ? "it" : "them"}; the house adds a pin once the record is checked.</p>
      )}
    </div>
  );
}
