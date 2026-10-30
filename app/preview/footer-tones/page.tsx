import SiteFooter from "@/components/ledger/SiteFooter";

// Preview: the footer in each tone, stacked, for James to compare (30 Oct 2026).
export const metadata = { title: "Footer tones", robots: { index: false, follow: false } };

export default function FooterTones() {
  return (
    <main className="pt-10">
      {(["linen", "parchment", "stone", "crimson"] as const).map((t) => (
        <section key={t} aria-label={t}>
          <p className="max-w-[1400px] mx-auto px-10 mt-12 ledger-eyebrow ledger-crimson">{t}</p>
          <SiteFooter tone={t} />
        </section>
      ))}
    </main>
  );
}
