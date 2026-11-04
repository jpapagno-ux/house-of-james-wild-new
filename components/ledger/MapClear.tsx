"use client";

import { useEffect } from "react";

// MapClear: the fixed bottom chrome (the stay page's "Ask about" card and phone bar, the quick actions bar)
// steps aside while a map ([data-map]: the 3D terrain map with its controls, the Ledger charts, the chart
// flyover) reaches the lower part of the screen, so it never covers a map or its Chart/Satellite toggle
// (map fix, 3 Nov 2026). It only sets <html data-map-clear>; the slide and its reduced-motion form live in
// app/globals.css. Maps that mount late (the terrain map loads near the viewport) are picked up as they appear.
export default function MapClear() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const root = document.documentElement;
    const inView = new Set<Element>();
    const seen = new Set<Element>();
    // Only the lower band of the screen counts: a map whose bottom edge sits high up does not meet the bar.
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target); else inView.delete(e.target);
      }
      if (inView.size) root.dataset.mapClear = ""; else delete root.dataset.mapClear;
    }, { rootMargin: "-70% 0px 0px 0px" });
    const scan = () => {
      document.querySelectorAll("[data-map]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
      // Maps that left the page (client navigation) no longer hold the bar back.
      for (const el of seen) if (!el.isConnected) { seen.delete(el); inView.delete(el); io.unobserve(el); }
      if (!inView.size) delete root.dataset.mapClear;
    };
    scan();
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = window.setTimeout(() => { queued = 0; scan(); }, 250);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
      if (queued) window.clearTimeout(queued);
      delete root.dataset.mapClear;
    };
  }, []);
  return null;
}
