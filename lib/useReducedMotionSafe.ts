"use client";
import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

// framer-motion's useReducedMotion reads the media query on the client's first
// render, which differs from the server render and breaks hydration (React
// #418) for visitors who prefer reduced motion. This returns false until the
// component has mounted, then the real preference.
export function useReducedMotionSafe() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!reduce : false;
}
