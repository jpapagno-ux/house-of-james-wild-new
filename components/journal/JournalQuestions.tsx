import JsonLd from "@/components/ledger/JsonLd";
import { faqPage, graph } from "@/lib/schema";
import SectionHead from "./SectionHead";

// JWC-STYLE-01, Stage 9. Field questions, answered straight: every question and its answer open on the page, numbered,
// two columns on a wide screen. FAQPage markup follows the same rule as the house's FaqBlock: only for house-approved
// answers (`schema`).
export default function JournalQuestions({ no, name, faqs, schema }: { no: string; name: string; faqs: { q: string; a: string }[]; schema: boolean }) {
  if (!faqs.length) return null;
  return (
    <section id="questions" aria-label="Field questions" className="bg-white">
      <SectionHead no={no} label="Field questions" title={`${name}, Answered Straight`} />
      <dl className="mt-8 border-t border-[color:var(--jw-graphite)]">
        {faqs.map((f, i) => (
          <div key={f.q} className="grid md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.2fr)] gap-x-6 gap-y-2 border-b border-[color:var(--jw-hairline)] py-6">
            <span aria-hidden className="font-mono text-[10.5px] tracking-[0.12em] text-house md:pt-1.5">Q.{String(i + 1).padStart(2, "0")}</span>
            <dt className="font-display font-medium text-[21px] leading-snug text-graphite">{f.q}</dt>
            <dd className="text-[14.5px] leading-relaxed text-stone-text">{f.a}</dd>
          </div>
        ))}
      </dl>
      {schema && <JsonLd data={graph(faqPage(faqs))} />}
    </section>
  );
}
