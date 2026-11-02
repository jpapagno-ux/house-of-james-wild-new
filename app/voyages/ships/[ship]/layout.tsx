import type { ReactNode } from "react";
import { shipBySlug } from "@/lib/content/ships";
import { watersTheme } from "@/lib/palette";

// A ship page takes its waters context (James, 2 Nov 2026): Amazon and Nile ships carry the river sets
// (lib/palette.ts, WATERS_PALETTE); every other ship keeps the Deep Sea set. display: contents, so the
// page's layout is untouched.
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ ship: string }> }) {
  const theme = watersTheme(shipBySlug((await params).ship)?.waters);
  return theme ? <div className={`contents ${theme}`}>{children}</div> : <>{children}</>;
}
