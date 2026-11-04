import type { ReactNode } from "react";
import { watersTheme } from "@/lib/palette";

// The By River hub's waters context (James, 2 Nov 2026): between the Amazon greens and the Nile lapis
// (lib/palette.ts, WATERS_PALETTE.river). display: contents, so the page's layout is untouched.
export default function Layout({ children }: { children: ReactNode }) {
  return <div className={`contents ${watersTheme("river")}`}>{children}</div>;
}
