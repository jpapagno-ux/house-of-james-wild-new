"use client";

import { useEffect, useState } from "react";

// One signal for "something is covering the page" (the House menu, the search
// panel). The header raises it; any ambient film or slideshow listens and holds
// still while it is up, so nothing plays behind a menu (bug, 2 Nov 2026: the
// homepage film kept running under the menu and volume cards).
// The state lives on <html data-overlay="…"> so a component that mounts while a
// menu is already open reads it straight away.

const EVENT = "jw:overlay";
const open = new Set<string>();

export function setOverlay(name: string, isOpen: boolean) {
  if (typeof document === "undefined") return;
  if (isOpen) open.add(name); else open.delete(name);
  const root = document.documentElement;
  if (open.size) root.dataset.overlay = [...open].join(" "); else delete root.dataset.overlay;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: open.size > 0 }));
}

export const overlayIsOpen = () => typeof document !== "undefined" && !!document.documentElement.dataset.overlay;

/** True while the House menu or the search panel covers the page. */
export function useOverlayOpen() {
  const [up, setUp] = useState(false);
  useEffect(() => {
    setUp(overlayIsOpen());
    const on = (e: Event) => setUp(!!(e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return up;
}
