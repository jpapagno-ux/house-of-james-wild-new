"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useOverlayOpen } from "@/lib/overlay";

// The rule for every ambient film and slideshow in the house (homepage hero and
// the volume entrances only):
//  · never for visitors who prefer reduced motion or ask to save data;
//  · only while the element is on screen and the tab is visible;
//  · never while the House menu or search covers the page;
//  · the visitor can pause it, and a pause sticks until they press play.
// `allowed` says whether motion is permitted at all (no reduce, no Save-Data):
// when false, the page shows the poster or first photograph and no control.
// `run` says whether it should be moving right now.

type NavigatorConnection = Navigator & { connection?: { saveData?: boolean } };

export function useSaveData() {
  const [save, setSave] = useState(false);
  useEffect(() => { setSave(!!(navigator as NavigatorConnection).connection?.saveData); }, []);
  return save;
}

export function useAmbientPlay(ref: RefObject<Element | null>, { threshold = 0.25 }: { threshold?: number } = {}) {
  const reduce = useReducedMotionSafe();
  const save = useSaveData();
  const overlay = useOverlayOpen();
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting && e.intersectionRatio >= threshold), { threshold: [0, threshold, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  useEffect(() => {
    const f = () => setHidden(document.hidden);
    f();
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);

  const allowed = mounted && !reduce && !save;
  const run = allowed && inView && !hidden && !overlay && !userPaused;
  const toggle = useCallback(() => setUserPaused((p) => !p), []);
  return { allowed, run, inView, userPaused, toggle };
}
