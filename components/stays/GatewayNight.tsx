import Image from "next/image";
import Link from "next/link";
import { gatewayFor } from "@/lib/content/gateways";
import { stayTone } from "@/lib/content/stay-tone";

// "Your night in Nairobi": the house's gateway stay for a country.
export default function GatewayNight({ country, exclude, className = "mt-16" }: { country?: string | null; exclude?: string; className?: string }) {
  const g = gatewayFor(country, exclude);
  if (!g) return null;
  // in the gateway stay's own pathway colour, as the other suggested stays (James, 10 Nov 2026)
  const a = stayTone(g.stay.slug).accent ?? "var(--tone-path, #2E2B28)";
  return (
    <section aria-label={`Your night in ${g.city}`} className={`${className} border grid md:grid-cols-[0.9fr_1.1fr] overflow-hidden`} style={{ borderColor: `color-mix(in srgb, ${a} 30%, #DCD7D0)`, borderTop: `3px solid ${a}` }}>
      {g.stay.hero && (
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[260px]">
          <Image src={g.stay.hero} alt={`${g.stay.name}, ${g.city}`} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </div>
      )}
      <div className="p-6 md:p-8 flex flex-col justify-center" style={{ background: `linear-gradient(165deg, color-mix(in srgb, ${a} 11%, #FFFFFF) 0%, color-mix(in srgb, ${a} 3%, #FFFFFF) 60%, #FFFFFF 100%)` }}>
        <p className="ledger-eyebrow" style={{ color: a }}>Your night in {g.city}</p>
        <p className="ledger-display text-[1.6rem] mt-1">{g.stay.name}</p>
        <p className="mt-2 text-[15.5px] leading-relaxed">{g.line}</p>
        <Link href={`/stays/${g.stay.slug}`} className="ledger-btn self-start mt-5">See {g.stay.name}</Link>
      </div>
    </section>
  );
}
