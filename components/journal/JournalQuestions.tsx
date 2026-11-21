import JsonLd from "@/components/ledger/JsonLd";
import { faqPage, graph } from "@/lib/schema";
import SectionHead from "./SectionHead";

// JWC-STYLE-01, Stage 9. Field questions, answered straight: each question a fold (the first one open), numbered; every answer stays in the page
// source for search and answer engines. FAQPage markup follows the same rule as the house's FaqBlock: only for house-approved
// answers (`schema`).
export default function JournalQuestions({ no, name, faqs, schema }: { no: string; name: string; faqs: { q: string; a: string }[]; schema: boolean }) {
  if (!faqs.length) return null;
  return (
    <section id="questions" aria-label="Field questions" className="bg-white">
      <SectionHead no={no} label="Field questions" title={`${name}, Answered Straight`} />
      <div className="mt-8 border-t border-[color:var(--jw-graphite)]">
        {faqs.map((f, i) => (
          <details key={f.q} open={i === 0} className="group border-b border-[color:var(--jw-hairline)]">
            <summary className="flex cursor-pointer list-none items-baseline gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <span aria-hidden className="w-10 shrink-0 font-mono text-[10.5px] tracking-[0.12em] text-house">Q.{String(i + 1).padStart(2, "0")}</span>
              <h3 className="flex-1 font-display font-medium text-[21px] leading-snug text-graphite">{f.q}</h3>
              <span aria-hidden className="shrink-0 font-display text-[24px] leading-none text-house transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
            </summary>
            <p className="pb-6 pl-14 pr-8 max-w-3xl text-[14.5px] leading-relaxed text-stone-text">{f.a}</p>
          </details>
        ))}
      </div>
      {schema && <JsonLd data={graph(faqPage(faqs))} />}
    </section>
  );
}
