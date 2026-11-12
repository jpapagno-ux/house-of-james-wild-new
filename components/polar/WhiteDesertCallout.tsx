import Link from "next/link";
import Pic from "@/components/opening/Pic";
import { WD } from "@/lib/content/white-desert";

// The one Antarctic stay the house sells (James, 12 Nov 2026), shown wherever Antarctica is: the polar voyages hub and
// the Antarctica destination. By air to the interior, as the alternative to the ships and the Peninsula.
export default function WhiteDesertCallout({ className = "mt-12 md:mt-16" }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="wd-h">
      <Link href={WD.path} className="group grid md:grid-cols-[1.2fr_1fr] border ledger-border bg-white/60 overflow-hidden">
        <figure className="relative aspect-[16/9] md:aspect-auto md:min-h-[320px] overflow-hidden bg-mist">
          <Pic src={WD.hero.url} alt={WD.hero.alt} ratio="16:9" sizes="(max-width: 768px) 100vw, 55vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </figure>
        <div className="p-6 md:p-10 flex flex-col justify-center">
          <p className="text-[10.5px] tracking-[0.14em] uppercase font-medium ledger-muted">Antarctica by air · the interior</p>
          <h2 id="wd-h" className="ledger-display text-[1.9rem] md:text-[2.4rem] leading-tight mt-2">White Desert</h2>
          <p className="mt-3 text-[16px] leading-relaxed">{WD.tagline}. The South Pole, the Emperor colonies and the Blue Rivers, with no Drake Passage.</p>
          <p className="mt-5 ledger-btn self-start">See the camps and rates <span aria-hidden="true">&rarr;</span></p>
        </div>
      </Link>
    </section>
  );
}
