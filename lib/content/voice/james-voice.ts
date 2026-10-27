// James's Voice Bank: one place for the lines that make the house sound like
// James. bank.json holds every proposed line (what's on the site now plus
// the alternates, and the new categories: why a place made the Ledger, why
// it didn't, mistakes, struck-out buzzwords, sign-offs, postmark lines and
// the review pages' own wording). James marks them on the pinned "James's
// Voice Bank" page (claude.ai artifact JW8ybHnhwER5BgXmk5xet6, db collection
// "picks"); his choices are copied into CHOSEN below and each page reads from
// here. Nothing in bank.json goes live until it appears in CHOSEN.
import bank from "./bank.json";

export type VoiceItem = { id: string; label?: string; now?: string; alts?: string[]; line?: string; check?: string };
export type VoiceSection = { id: string; title: string; intro: string; kind: "swap" | "add"; where: string; items: VoiceItem[] };
export const VOICE_BANK = bank as VoiceSection[];

/** James's picks, by item id: the line to use. Empty until he marks the bank. */
export const CHOSEN: Record<string, string> = {};

/** Chosen lines for one section, in bank order. */
export const chosenIn = (section: string) =>
  (VOICE_BANK.find((s) => s.id === section)?.items ?? []).map((i) => CHOSEN[i.id]).filter(Boolean) as string[];
