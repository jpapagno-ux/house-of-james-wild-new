import { Check, Minus } from "lucide-react";

// The structured lists of one unit, each rendering nothing when empty:
//   AccommodationFeatures      features / amenities, as a quiet two-column list
//   AccommodationInclusions    included[]   ✓, a simple positive treatment
//   AccommodationExclusions    excluded[]   —, quieter, never alarming
//   AccommodationImportantNotes important_notes[] (minimum stays, age rules,
//                              seasonal and configuration conditions)

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <p className="ledger-eyebrow ledger-crimson">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function AccommodationFeatures({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <Block title="Features">
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-[15px]">{items.slice(0, 12).map((f) => <li key={f} className="border-b ledger-border pb-2">{f}</li>)}</ul>
    </Block>
  );
}

export function AccommodationInclusions({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <Block title="Included">
      <ul className="grid gap-2 text-[15px]">{items.map((x) => <li key={x} className="flex gap-2.5"><Check className="w-4 h-4 mt-1 shrink-0 text-vol-stays" strokeWidth={1.5} aria-hidden="true" />{x}</li>)}</ul>
    </Block>
  );
}

export function AccommodationExclusions({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <Block title="Not included">
      <ul className="grid gap-2 text-[15px] ledger-muted">{items.map((x) => <li key={x} className="flex gap-2.5"><Minus className="w-4 h-4 mt-1 shrink-0" strokeWidth={1.5} aria-hidden="true" />{x}</li>)}</ul>
    </Block>
  );
}

export function AccommodationImportantNotes({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <Block title="Important to know">
      <ul className="grid gap-2 text-[15px] border-l-2 border-rust/50 pl-4">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </Block>
  );
}
