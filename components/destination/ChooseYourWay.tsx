import type React from "react";
import Link from "next/link";
import { RecordCard } from "@/components/hub/Hub";
import { JourneyCard } from "./Journeys";
import VolumeTabs, { type VolumeTab } from "./VolumeTabs";
import type { ChartData } from "./LedgerChart";
import { isResidence } from "@/lib/content/ledger-counts";
import { recordHref } from "@/lib/ledger/urls";
import { volumeInk, type VolumeKey } from "@/lib/volumes";
import type { Reserve } from "@/lib/content/reserves";
import type { Journey } from "@/lib/content/preview/journeys";

// "Choose your way" for region and country pages (James, 31 Oct 2026, approved): one tab per volume,
// inked by volume (docs/brand-colours.md). Picking a tab swaps the cards and filters the map's pins
// to the same records (Safaris lights the reserves and the safari lodges, in Saddle Leather).
export type CywStay = { slug: string; name: string; ledgerId?: string | null; tagline?: string | null; country?: string | null; image?: string | null; category?: string | null; reserveChild?: boolean; volumes?: string[] | null };

export default function ChooseYourWay({ place, stayVol, featured, stayCount, stays, reserves, journeys, chart, staysHref = "/stays" }: {
  place: string; stayVol: VolumeKey; featured: CywStay[]; stayCount: number; stays: CywStay[]; reserves: Reserve[]; journeys: Journey[]; chart?: ChartData; staysHref?: string;
}) {
  const withImg = stays.filter((s) => s.image);
  const residences = withImg.filter((s) => isResidence(s.name, s.category ?? null) || s.volumes?.includes("gatherings"));
  const safariStays = withImg.filter((s) => s.volumes?.includes("safaris") && !residences.includes(s));
  const res = reserves.filter((x) => x.stay.hero);
  const routes = journeys.filter((j) => j.kind === "route"), voyages = journeys.filter((j) => j.kind === "voyage");
  const card = (s: CywStay, v: VolumeKey) => <li key={s.slug}><RecordCard name={s.name} id={s.ledgerId ?? ""} line={s.tagline ?? s.country ?? ""} eyebrow={s.country ?? undefined} image={{ url: s.image as string, alt: `${s.name}${s.country ? `, ${s.country}` : ""}` }} href={recordHref("stay", s.slug)} volume={v} /></li>;
  const more = (href: string, label: string, ink: string) => <Link href={href} className="mt-6 inline-flex items-center gap-1.5 text-[15px] underline underline-offset-4" style={{ color: ink }}>{label} →</Link>;
  const grid = (cards: React.ReactNode[], m: React.ReactNode) => <><ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cards}</ul>{m}</>;
  const jgrid = (list: Journey[], m: React.ReactNode) => <><ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((j) => <li key={j.ledgerId}><JourneyCard j={j} chart={chart} /></li>)}</ul>{m}</>;
  const S = volumeInk(stayVol), SF = volumeInk("safaris"), G = volumeInk("gatherings"), V = volumeInk("voyages"), O = volumeInk("overland");

  const tabs = [
    featured.length > 0 && { key: "stays", label: stayVol === "europe" ? "Europe stays" : "Stays", count: stayCount, ink: S, pin: { show: ["stay"] },
      content: grid(featured.filter((s) => s.image).slice(0, 8).map((s) => card(s, s.reserveChild ? "safaris" : isResidence(s.name, s.category ?? null) ? "gatherings" : stayVol)), more(staysHref, `All ${stayCount} stays in ${place}`, S)) },
    res.length + safariStays.length > 0 && { key: "safaris", label: "Safaris & reserves", count: res.length + safariStays.length, ink: SF, pin: { show: ["reserve"], ids: safariStays.map((s) => s.slug), tint: SF },
      content: grid([
        ...res.map((x) => <li key={x.slug}><RecordCard name={x.name} id={x.rsv} line={`${x.camps.length} camps & residences · ${x.area}`} eyebrow={`Reserve${x.stay.country ? ` · ${x.stay.country}` : ""}`} image={{ url: x.stay.hero as string, alt: `${x.name}, ${x.area}` }} href={`/safaris/${x.slug}`} volume="safaris" /></li>),
        ...safariStays.slice(0, Math.max(0, 8 - res.length)).map((s) => card(s, "safaris")),
      ], more("/safaris", "The safari desk", SF)) },
    residences.length > 0 && { key: "gatherings", label: "Gatherings", count: residences.length, ink: G, pin: { show: ["residence"] },
      content: grid(residences.slice(0, 8).map((s) => card(s, "gatherings")), more("/gatherings", "Family residences, all regions", G)) },
    voyages.length > 0 && { key: "voyages", label: "Voyages", count: voyages.length, ink: V, pin: { show: ["vessel"] }, content: jgrid(voyages, more("/voyages", "All voyages", V)) },
    routes.length > 0 && { key: "routes", label: "Overland routes", count: routes.length, ink: O, content: jgrid(routes, more("/overland", "All Overland routes", O)) },
  ].filter(Boolean) as VolumeTab[];

  return <VolumeTabs title={`${place}, by How You Travel`} intro="Stays, safaris, family residences, voyages and routes, each in its volume's colour. Pick one and the map shows only those." tabs={tabs} />;
}
