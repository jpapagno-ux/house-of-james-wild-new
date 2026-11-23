import type { FieldNote } from "@/lib/field-notes/notes";

// A Field Note: white card, crimson top rule, a house watercolour cut out by Cloudinary, three plain lines.
// One or two per page; no outbound links; the "where" link stays inside the house.
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";

export default function FieldNoteCard({ note }: { note: FieldNote }) {
  // A cut-out animal has its paper removed; a scene keeps its painted setting, which fades into the white card.
  const fx = note.image.scene ? "" : "e_background_removal/e_trim:10/";
  const src = (w: number) => `${CLD}/${fx}w_${w},f_auto,q_auto/v${note.image.version}/${note.image.publicId}`;
  return (
    <article className="border border-[color:var(--jw-hairline)] border-t-2 border-t-[color:var(--jw-crimson)] bg-white px-5 py-6 md:px-9 md:py-9 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 md:items-center">
      <div>
        <p className="flex justify-between font-mono text-[10px] tracking-[0.24em] uppercase"><span className="text-house">Field Note</span><span className="text-stone-text">{note.region} · {note.no}</span></p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(900)} srcSet={`${src(600)} 600w, ${src(900)} 900w, ${src(1400)} 1400w`} sizes="(min-width: 768px) 40vw, 90vw" width={note.image.width} height={note.image.height} alt={note.image.alt} loading="lazy" className="mt-4 block w-full h-auto" style={note.image.scene ? { filter: "brightness(1.035) contrast(1.04)" } : undefined} />
      </div>
      <div className="mt-3 md:mt-0">
        <h3 className="font-display text-[31px] md:text-[40px] leading-[1.05] text-graphite">{note.title}</h3>
        <p className="font-display italic text-[16.5px] md:text-[18px] text-stone-text mt-1.5">{note.latin}</p>
        <p className="mt-4 text-[14.5px] md:text-[15.5px] leading-relaxed text-graphite">{note.body}</p>
        <dl className="mt-5 border-t border-[color:var(--jw-hairline)]">
          {note.rows.map((r) => (
            <div key={r.label} className="flex gap-3 py-2.5 border-b border-[color:var(--jw-hairline)]">
              <dt className="shrink-0 basis-[96px] pt-[3px] font-mono text-[9px] tracking-[0.18em] uppercase text-stone-text">{r.label}</dt>
              <dd className="text-[13.5px] md:text-[14.5px] leading-snug text-graphite">{r.text}</dd>
            </div>
          ))}
        </dl>
        <a href={note.where.href} className="ledger-btn-ghost mt-5 inline-flex">{note.where.label}</a>
      </div>
    </article>
  );
}
