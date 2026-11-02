import type { ReactNode } from "react";
import { watersTheme } from "@/lib/palette";

// The Amazon waters context (James, 2 Nov 2026): river voyages carry their own set (lib/palette.ts,
// WATERS_PALETTE) for buttons, accents and chip tints. display: contents, so the page's layout is untouched.
export default function Layout({ children }: { children: ReactNode }) {
  return <div className={`contents ${watersTheme("amazon")}`}>{children}</div>;
}
