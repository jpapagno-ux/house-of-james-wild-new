// Dispatches from the road: short lines from travelers about a stay, shown as ticket stubs.
// A dispatch is shown only when the traveler chose to share it and the House approved it.
// First name and date only; never a family name, never a child's name.

export type Dispatch = {
  firstName: string;
  date: string; // as printed, e.g. "7 Aug 2026"
  line: string;
  sample?: boolean;
};

export default function Dispatches({ stay, items, open = false }: { stay: string; items: Dispatch[]; open?: boolean }) {
  if (!items.length && !open) return null;
  return (
    <section aria-label={`Dispatches from ${stay}`} className="bg-mist py-10">
      <div className="max-w-ledger mx-auto px-5 md:px-10">
        <p className="ledger-eyebrow">Dispatches from the road</p>
        <h2 className="font-display text-2xl md:text-3xl mt-2">{items.length ? `What travelers found at ${stay}` : `Be the first to send a dispatch from ${stay}`}</h2>
        <ul className="mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3" role="list">
          {!items.length && (
            <li className="snap-start shrink-0 w-[17rem] bg-paper border border-dashed border-black/30 flex">
              <div className="flex-1 p-4">
                <p className="font-display italic text-lg leading-snug">This stub is waiting for its first line.</p>
                <p className="text-sm mt-2">Travelers send a dispatch from My Folio: one find from the road, a first name and a date.</p>
              </div>
              <div className="w-20 border-l border-dashed border-black/30 p-3 flex flex-col justify-between text-right">
                <p className="text-sm font-medium">You</p>
                <p className="ledger-id text-[10px] leading-tight">Date to come</p>
              </div>
            </li>
          )}
          {items.map((d, i) => (
            <li key={i} className="snap-start shrink-0 w-[17rem] bg-paper border border-black/15 flex">
              <div className="flex-1 p-4">
                {d.sample && <p className="house-chip inline-block mb-2">Sample</p>}
                <p className="font-display italic text-lg leading-snug">{d.line}</p>
              </div>
              <div className="w-20 border-l border-dashed border-black/30 p-3 flex flex-col justify-between text-right">
                <p className="text-sm font-medium">{d.firstName}</p>
                <p className="ledger-id text-[10px] leading-tight">{d.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
