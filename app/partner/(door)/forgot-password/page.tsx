import PasswordForms from "@/components/platform/PasswordForms";

export const metadata = { title: "Reset your password" };

export default function ForgotPassword() {
  return (
    <section className="max-w-xl">
      <p className="ledger-eyebrow ledger-crimson">Partner Desk</p>
      <h1 className="ledger-display text-[2.2rem] leading-[1.08] md:text-[2.8rem] mt-3">Reset your password</h1>
      <p className="mt-4 text-[16px] ledger-muted">Enter your work email. If it has desk access, we&rsquo;ll send a link to choose a new password.</p>
      <div className="mt-8"><PasswordForms mode="request" /></div>
    </section>
  );
}
