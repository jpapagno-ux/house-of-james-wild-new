// Phase 1b preview data: which Ledger photograph illustrates each pathway
// card on the Stays landing preview. Chosen by hand from stays with a hero
// photo whose record text fits the setting; they are illustrations for the
// preview, not pathway classifications (those live in pathway-map.json).
import type { PathwayId } from "@/lib/pathways";

export const PATHWAY_CARD_STAY: Record<PathwayId, string> = {
  "PATH-01": "amor-arenal",
  "PATH-02": "benguerra-island-by-and-beyond",
  "PATH-03": "awasi-mendoza",
  "PATH-04": "tswalu-reserve",
  "PATH-05": "como-shambhala-estate",
  "PATH-06": "beyond-sussuvlei-desert-lodge",
  "PATH-07": "arijiju-laikipia",
  "PATH-08": "leeu-estates",
};

/** The six pictured prominently on the landing; the other two sit in the index below (brief §9). */
export const PROMINENT: PathwayId[] = ["PATH-04", "PATH-01", "PATH-02", "PATH-05", "PATH-07", "PATH-08"];

export const PREVIEW_ROOT = "/preview/pathways";
export const pathwayPreviewHref = (key: string) => `${PREVIEW_ROOT}/${key}`;
export const stayPreviewHref = (slug: string) => `${PREVIEW_ROOT}/stay/${slug}`;
