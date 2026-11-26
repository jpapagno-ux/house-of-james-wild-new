import Link from "next/link";
import FieldNoteCard from "./FieldNoteCard";
import { shipFieldNote } from "@/lib/field-notes/notes";

// One Field Note on a ship page (James, 26 Nov 2026), chosen by the waters she sails. Reading beside the voyage:
// it names what lives in these waters, not what any one sailing promises.
export default function ShipFieldNote({ waters, slug, hub }: { waters: string; slug: string; hub?: { name: string; path: string } }) {
  const note = shipFieldNote(waters, slug);
  if (!note) return null;
  return (
    <section id="field-note" className="mt-16 md:mt-24" aria-labelledby="field-note-h">
      <p className="ledger-eyebrow ledger-crimson">From the field</p>
      <h2 id="field-note-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">What Lives in These Waters?</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-text">What you meet depends on the route and the season. Your guide will know what is about.</p>
      <div className="mt-6"><FieldNoteCard note={note} /></div>
      <p className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
        {hub && <Link href={`${hub.path}#field-notes-h`} className="ledger-btn-ghost">More from {hub.name}</Link>}
        <Link href="/wildlife" className="ledger-btn-ghost">All wildlife</Link>
      </p>
    </section>
  );
}
