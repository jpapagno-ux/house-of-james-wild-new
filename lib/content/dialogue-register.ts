// The live register: every James and Iggi line on the site, built from the
// approved sources (verdicts, sign-offs, the Voice Bank picks) plus the
// labelled samples and Iggi's proposed standing lines. Pages and the Iggi
// embed read from here through approvedDialogue(); nothing else renders.
import { VERDICTS, SIGNOFFS } from "./verdicts";
import { CHOSEN } from "./voice/chosen";
import { SAMPLES } from "./iggi";
import { IGGI_STANDING, approvedDialogue, iggiSampleLines, jamesVerdictLines, signoffLines, validateDialogue, type DialogueLine } from "./dialogue";

export const DIALOGUE: DialogueLine[] = [...jamesVerdictLines(VERDICTS), ...signoffLines(SIGNOFFS, CHOSEN), ...IGGI_STANDING, ...iggiSampleLines(SAMPLES)];

const problems = validateDialogue(DIALOGUE);
if (problems.length) throw new Error(`Dialogue register:\n  ${problems.join("\n  ")}`);

/** Lines that may render, optionally narrowed. */
export const dialogue = (filter?: Parameters<typeof approvedDialogue>[1]) => approvedDialogue(DIALOGUE, filter);
/** One approved line by id, or null: pages ask for exactly the line they were designed around. */
export const dialogueLine = (id: string) => DIALOGUE.find((l) => l.id === id && l.approval.status === "approved") ?? null;
/** Counts for the review page and the docs. */
export const DIALOGUE_SUMMARY = {
  total: DIALOGUE.length,
  approved: DIALOGUE.filter((l) => l.approval.status === "approved").length,
  draft: DIALOGUE.filter((l) => l.approval.status === "draft").length,
  james: DIALOGUE.filter((l) => l.character === "james").length,
  iggi: DIALOGUE.filter((l) => l.character === "iggi").length,
};
