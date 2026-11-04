"use client";
import { useEffect, useState } from "react";
import HostPanel, { type Host, type HostConnect, type HostKind } from "./HostPanel";

// The host card, kept live from the Partner Desk (James, 4 Nov 2026). The page is built with the site's own
// card; this asks the desk once the page is open and swaps in what the partner and the house have set: a new
// host, or the house taking the call when the partner switches the card off. Pages stay fully static.
type Card = { state: HostConnect; host?: Host };

export default function LiveHostPanel({ pageKey, initial, stayName, kind, optional = false, className = "mt-16 md:mt-24 border-t ledger-rule pt-10" }:
  { pageKey: string; initial: Card; stayName: string; kind: HostKind; optional?: boolean; className?: string }) {
  const [card, setCard] = useState<Card>(initial);
  useEffect(() => {
    let live = true;
    fetch(`/api/v1/hosts/card?key=${encodeURIComponent(pageKey)}${optional ? "&optional=1" : ""}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { data?: Card } | null) => { if (live && j?.data?.state) setCard(j.data); })
      .catch(() => {});
    return () => { live = false; };
  }, [pageKey, optional]);
  if (card.state === "off") return null;
  return <div className={className}><HostPanel state={card.state} host={card.host} stayName={stayName} kind={kind} /></div>;
}
