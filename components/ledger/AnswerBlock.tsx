// AnswerBlock — the 40–70 word answer every page leads with. It is the
// passage answer engines quote, so it states the page's answer plainly, in
// James's voice, with the facts that make it checkable.
export default function AnswerBlock({ children, label = "In short" }: { children: React.ReactNode; label?: string }) {
  return (
    <section aria-label={label} className="border-l-2 border-crimson pl-5 my-8 max-w-3xl">
      <p className="ledger-eyebrow ledger-crimson">{label}</p>
      <div className="mt-2 text-[17px] leading-relaxed">{children}</div>
    </section>
  );
}
