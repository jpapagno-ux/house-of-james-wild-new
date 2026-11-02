import type { Extension } from "@/components/journey/ExtensionChip";

// Extensions: stays just beyond a route or a stay, shown as an ExtensionChip.
// One record per extension, so a single `live` flag switches every chip that uses it.
//
// Jícaro Island Lodge (James, 2 Nov 2026): Nicaragua is paused (Destination DST-2026-000107,
// site_status coming_soon) and the stay is held (STY-2026-000578, not on the release list).
// Until both go live the chip opens the enquiry form ("Ask James"). To go live: set the
// Nicaragua record and the stay live in the library, release jicaro-island-lodge, then set
// live: true here.
export const EXTENSIONS = {
  jicaro: {
    to: "Nicaragua",
    stay: "Jícaro Island Lodge",
    where: "Lake Nicaragua (Cayuga Collection)",
    href: "/stays/jicaro-island-lodge",
    live: false,
  },
} satisfies Record<string, Extension>;

export type ExtensionKey = keyof typeof EXTENSIONS;
export const extension = (k: string): Extension | undefined => (EXTENSIONS as Record<string, Extension>)[k];

/** Cayuga's Costa Rica hotels are the natural jumping-off point for Jícaro (Liberia LIR is about 3 hours from the lodge). */
export const CAYUGA_COSTA_RICA_EXTENSION: ExtensionKey = "jicaro";
