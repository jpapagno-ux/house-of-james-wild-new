import Signature from "@/components/record/Signature";
import type { PlaceNote as Note } from "@/lib/content/place-notes";

// A white slip from James beside the "In short" answer on region and country
// pages: a line of advice with a little wit, initialled. When a Captain's Log
// post exists for the place, it links there.
export default function PlaceNote({ place, note }: { place: string; note: Note }) {
  return (
    <aside className="relative bg-[#fdfcf8] border border-[#e7e1d4] px-5 pt-5 pb-3 rotate-[-1deg] shadow-[0_10px_24px_-14px_rgba(60,45,25,0.45)] max-w-[380px]" aria-label={`A note from James on ${place}`}>
      <span className="absolute -top-2 left-8 w-12 h-4 bg-[#e9dfcb]/85 -rotate-[4deg]" aria-hidden="true" />
      <p className="ledger-eyebrow !text-[9.5px] !text-[#8b3a2e]">{note.origin ? "Where it started" : "A note from James"} · {place}</p>
      <p className="mt-2 text-[16px] md:text-[17px] leading-snug text-[#3b2716]" style={{ fontFamily: "'Homemade Apple', cursive" }}>{note.line}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        {note.blog ? <a href={note.blog.href} className="text-[11px] tracking-[0.14em] uppercase underline underline-offset-4 text-[#8a7f70] hover:text-[#8b3a2e]">From the Captain&rsquo;s Log: {note.blog.title} →</a> : <span />}
        <Signature className="w-16 shrink-0" />
      </div>
    </aside>
  );
}
