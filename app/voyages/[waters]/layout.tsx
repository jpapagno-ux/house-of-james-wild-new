import type { ReactNode } from "react";
import { watersTheme } from "@/lib/palette";

// A voyage page under /voyages/<waters>/ takes its waters context (James, 2 Nov 2026): Amazon and Nile
// voyages carry the river sets (lib/palette.ts, WATERS_PALETTE); sea waters keep the Deep Sea set.
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ waters: string }> }) {
  const theme = watersTheme((await params).waters);
  return theme ? <div className={`contents ${theme}`}>{children}</div> : <>{children}</>;
}
