import FieldNoteCard from "@/components/field-notes/FieldNoteCard";
import type { FieldNote } from "@/lib/field-notes/notes";

// A set of Field Notes: the first in full, the rest folded so the page stays short on a phone.
// Folded notes stay in the page source (native <details>), so search and answer engines still read them.
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";

function Folded({ note }: { note: FieldNote }) {
  const src = `${CLD}/w_700,f_auto,q_auto/v${note.image.version}/${note.image.publicId}`;
  return (
    <details className="group border border-[color:var(--jw-hairline)] bg-white">
      <summary className="cursor-pointer list-none px-4 pt-4 pb-4 [&::-webkit-details-marker]:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={note.image.width} height={note.image.height} alt={note.image.alt} loading="lazy" className="block w-full h-auto" style={{ filter: "brightness(1.035) contrast(1.04)" }} />
        <span className="mt-2 block font-mono text-[9px] tracking-[0.22em] uppercase text-stone-text">Field Note · {note.no}</span>
        <span className="mt-1 block font-display text-[23px] leading-tight text-graphite">{note.title}</span>
        <span className="mt-2 inline-block font-display italic text-[16px] text-graphite border-b border-[color:var(--jw-crimson)] group-open:hidden">Read the note</span>
      </summary>
      <div className="px-4 pb-5">
        <p className="font-display italic text-[15.5px] text-stone-text">{note.latin}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-graphite">{note.body}</p>
        <dl className="mt-4 border-t border-[color:var(--jw-hairline)]">
          {note.rows.map((r) => (
            <div key={r.label} className="py-2 border-b border-[color:var(--jw-hairline)]">
              <dt className="font-mono text-[9px] tracking-[0.18em] uppercase text-stone-text">{r.label}</dt>
              <dd className="mt-0.5 text-[13.5px] leading-snug text-graphite">{r.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}

export default function FieldNoteSet({ notes }: { notes: FieldNote[] }) {
  const [first, ...rest] = notes;
  if (!first) return null;
  return (
    <div className="grid gap-8">
      <FieldNoteCard note={first} />
      {rest.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">{rest.map((n) => <Folded key={n.id} note={n} />)}</div>}
    </div>
  );
}
