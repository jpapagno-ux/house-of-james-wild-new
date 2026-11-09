import JsonLd from "./JsonLd";
import { faqPage, graph } from "@/lib/schema";
import { FieldIcon, type FieldIconName } from "./FieldIcon";

// FaqBlock — visible questions and answers with matching FAQPage schema.
// Uses <details> so every answer is in the HTML, open or closed.
// `schema` (Contract D15, 31 Oct 2026): FAQPage markup only for house-approved
// Q&A — a record the Ledger has AEO-approved, or copy James approved in code.
// Generated fallbacks (best months, getting there…) render visibly but unmarked,
// so rich-result eligibility rests on approved answers alone.
export default function FaqBlock({ faqs, title = "Questions, answered", schema = true, icon }: { faqs: { q: string; a: string }[]; title?: string; schema?: boolean; /** a field icon beside the eyebrow, as SectionHead */ icon?: FieldIconName }) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="mt-16 border-t ledger-rule pt-8">
      <div data-sechead>
        <div className="flex items-center gap-3">{icon && <FieldIcon name={icon} height={26} className="ledger-crimson" />}<p className="ledger-eyebrow">Field questions</p></div>
        <h2 id="faq-heading" className="ledger-display text-2xl md:text-3xl mt-2">{title}</h2>
      </div>
      <div className="mt-6 border-t ledger-border">
        {faqs.map((f) => (
          <details key={f.q} className="group border-b ledger-border py-4">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-6">
              <span className="ledger-display text-lg">{f.q}</span>
              <span className="ledger-crimson text-xl leading-none group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
            </summary>
            <p className="mt-3 text-[16px] leading-relaxed ledger-muted max-w-3xl">{f.a}</p>
          </details>
        ))}
      </div>
      {schema && <JsonLd data={graph(faqPage(faqs))} />}
    </section>
  );
}
