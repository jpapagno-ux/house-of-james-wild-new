// The advisor training program (James, 19 Nov 2026). It is being designed: this file holds the words the
// desk shows until its sessions are scheduled, and the one rule for the registration note. Change the
// name, line and status here when the program is named and dated; nothing else needs to move.
// Pure (no imports, no network) so plain Node can test it.

export const TRAINING = {
  name: "Advisor training",
  line: "The founder's method, taught at the desk: how to vet a stay, read a season and file a journey a traveler can trust.",
  status: "Opening soon",
  detail: "The program is being designed now. Register and the house writes to you first with the dates and how it runs. Registering costs nothing and commits you to nothing.",
} as const;

export const TRAINING_NOTE_MAX = 500;

type Parsed = { ok: true; note: string | null } | { ok: false; message: string };

/** POST body { note? }: an optional line on what the advisor most wants to learn. Blank becomes null. */
export function parseTrainingNote(body: unknown): Parsed {
  if (body === null || body === undefined) return { ok: true, note: null };
  if (typeof body !== "object" || Array.isArray(body)) return { ok: false, message: "Send the note as text" };
  const b = body as Record<string, unknown>;
  const extra = Object.keys(b).find((k) => k !== "note");
  if (extra) return { ok: false, message: `Unexpected field: ${extra}` };
  if (b.note === undefined || b.note === null) return { ok: true, note: null };
  if (typeof b.note !== "string") return { ok: false, message: "Send the note as text" };
  const note = b.note.trim();
  if (note.length > TRAINING_NOTE_MAX) return { ok: false, message: `Keep the note under ${TRAINING_NOTE_MAX} characters` };
  return { ok: true, note: note || null };
}
