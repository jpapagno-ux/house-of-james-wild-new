import ApplyForm from "@/components/platform/ApplyForm";

export const metadata = { title: "Apply to become a partner" };

export default function ApplyPage() {
  return (
    <section className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-16 items-start">
      <div className="max-w-md">
        <p className="ledger-eyebrow ledger-crimson">Partner Desk</p>
        <h1 className="ledger-display text-[2.2rem] leading-[1.08] md:text-[2.8rem] mt-3">Apply to work with James Wild &amp; Co</h1>
        <p className="mt-4 text-[16px] leading-relaxed">The house files places it has vetted. Tell us about yours; if it&rsquo;s a fit, we&rsquo;ll be in touch and invite your team to the desk.</p>
      </div>
      <ApplyForm />
    </section>
  );
}
