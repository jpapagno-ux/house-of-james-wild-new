import { CompanyForm, ProfileForm } from "@/components/platform/forms";
import PasswordForms from "@/components/platform/PasswordForms";
import { DataList, Notice, PageHead, Section } from "@/components/platform/ui";
import { requireDesk } from "@/lib/platform/membership";
import { ROLE_LABEL } from "@/lib/platform/roles";

export const metadata = { title: "Account" };

export default async function Account({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const desk = await requireDesk("/partner/account");
  const sp = await searchParams;
  const [{ data: me }, { data: org }] = await Promise.all([
    desk.sb.from("profiles").select("first_name, last_name, phone").eq("id", desk.user.id).maybeSingle(),
    desk.sb.from("organizations").select("name, partner_code, website, phone, general_email, address, preferred_communication, media_kit_url, hq_country").eq("id", desk.org.id).maybeSingle(),
  ]);
  return (
    <div>
      <PageHead eyebrow="Account" title="You and your company" />
      {sp.welcome && <div className="mt-6"><Notice tone="good" title="Welcome to the desk">Choose a password below so you can sign in directly next time.</Notice></div>}
      <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
        <Section title="You">
          <DataList rows={[["Email", desk.user.email ?? "—"], ["Role", desk.membership ? ROLE_LABEL[desk.membership.role] : "James Wild & Co"]]} />
          <div className="mt-6"><ProfileForm initial={{ firstName: me?.first_name ?? "", lastName: me?.last_name ?? "", phone: me?.phone ?? "" }} /></div>
        </Section>
        <Section title="Password">
          <p className="mb-4 text-[14px] ledger-muted">At least 10 characters. Supabase Auth checks it against known breaches when the house has that protection on.</p>
          <PasswordForms mode="set" after="/partner/account" />
        </Section>
      </div>
      <Section title="Company details">
        <DataList rows={[["Company", org?.name ?? desk.org.name], ["Partner code", org?.partner_code ?? "—"], ["Head office", org?.hq_country ?? "—"]]} />
        <p className="mt-2 text-[12.5px] ledger-muted">The company name and partner code are kept by the house. Ask your James Wild &amp; Co contact to change them.</p>
        <div className="mt-6">
          {desk.canAdmin || desk.houseEditor ? (
            <CompanyForm initial={{ website: org?.website ?? "", phone: org?.phone ?? "", generalEmail: org?.general_email ?? "", address: org?.address ?? "", preferredCommunication: org?.preferred_communication ?? "", mediaKitUrl: org?.media_kit_url ?? "" }} />
          ) : (
            <DataList rows={[["Website", org?.website ?? "—"], ["General email", org?.general_email ?? "—"], ["Main phone", org?.phone ?? "—"], ["Media kit", org?.media_kit_url ?? "—"]]} />
          )}
        </div>
      </Section>
    </div>
  );
}
