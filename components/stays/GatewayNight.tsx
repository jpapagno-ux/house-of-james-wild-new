import Image from "next/image";
import Link from "next/link";
import { gatewayFor } from "@/lib/content/gateways";

// "Your night in Nairobi": the house's gateway stay for a country.
export default function GatewayNight({ country, exclude, className = "mt-16" }: { country?: string | null; exclude?: string; className?: string }) {
  const g = gatewayFor(country, exclude);
  if (!g) return null;
  return (
    <section aria-label={`Your night in ${g.city}`} className={`${className} border ledger-border grid md:grid-cols-[0.9fr_1.1fr]`}>
      {g.stay.hero && (
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[260px]">
          <Image src={g.stay.hero} alt={`${g.stay.name}, ${g.city}`} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </div>
      )}
      <div className="p-6 md:p-8 flex flex-col justify-center">
        <p className="ledger-eyebrow ledger-crimson">Your night in {g.city}</p>
        <p className="ledger-display text-[1.6rem] mt-1">{g.stay.name}</p>
        <p className="mt-2 text-[15.5px] leading-relaxed">{g.line}</p>
        <Link href={`/stays/${g.stay.slug}`} className="ledger-btn self-start mt-5">See {g.stay.name}</Link>
      </div>
    </section>
  );
}
