"use client";

import type { ReactNode } from "react";
import HandNote from "@/components/notes/HandNote";

// A handwritten aside that fades in once the card is on screen, with a small
// arrow curling up toward the button above it. Kept for its callers (which sign
// "JW" in their own words); new notes use HandNote directly.
export default function FadeNote({ children }: { children: ReactNode }) {
  return <HandNote arrow="up" sign={false} className="mt-4">{children}</HandNote>;
}
