import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import SiteFooter from "@/components/ledger/SiteFooter";
import Rail, { type RailItem } from "@/components/platform/Rail";
import OrgSwitcher from "@/components/platform/OrgSwitcher";
import { loadDesk } from "@/lib/platform/membership";
import { ROLE_LABEL } from "@/lib/platform/roles";

// The Partner Desk shell: the site header, a masthead naming the organization in
// view, the rail, and the page. Every page below re-checks access on the server.
export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  // The page's own requireDesk() sends signed-out people to sign in with the right return path.
  const loaded = await loadDesk();
  if (!loaded?.org) return <>{children}</>;
  const desk = { ...loaded, org: loaded.org };
  const { count } = await desk.sb.from("content_requests").select("id", { count: "exact", head: true })
    .eq("organization_id", desk.org.id).in("status", ["open", "changes_requested"]);
  const items: RailItem[] = [
    { href: "/partner", label: "Overview" },
    { href: "/partner/portfolio", label: "My Portfolio" },
    { href: "/partner/requests", label: "Requests", count: count ?? 0 },
    { href: "/partner/submissions", label: "Updates & approvals" },
    { href: "/partner/contacts", label: "Contacts" },
    { href: "/partner/team", label: "Team" },
    { href: "/partner/account", label: "Account" },
    { href: "/partner/support", label: "Support" },
  ];
  const later: RailItem[] = [
    { href: "#", label: "Content", soon: "Stage 2" },
    { href: "#", label: "Rooms & Accommodation", soon: "Stage 2" },
    { href: "#", label: "Rates & Offers", soon: "Stage 2" },
    { href: "#", label: "Media Library", soon: "Stage 3" },
    { href: "#", label: "Partner Dispatch", soon: "Stage 3" },
    { href: "#", label: "Founder Notes", soon: "Stage 3" },
    { href: "#", label: "Resources", soon: "Stage 3" },
  ];
  const who = desk.membership ? ROLE_LABEL[desk.membership.role] : "James Wild & Co · viewing";
  return (
    <>
      <SiteHeader />
      <div className="border-b ledger-rule bg-paper-card">
        <div className="max-w-ledger mx-auto px-5 md:px-10 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="ledger-eyebrow ledger-crimson">Partner Desk</p>
          <p className="ledger-display text-[1.2rem] leading-none">{desk.org.name}</p>
          {desk.org.partner_code && <span className="font-mono text-[11.5px] tracking-[0.06em] ledger-crimson">{desk.org.partner_code}</span>}
          <div className="ml-auto flex flex-wrap items-center gap-4 text-[13px]">
            {desk.orgs.length > 1 && <OrgSwitcher orgs={desk.orgs.map((o) => ({ slug: o.slug ?? "", name: o.name }))} current={desk.org.slug ?? ""} />}
            <span className={desk.house && !desk.membership ? "border ledger-crimson-border ledger-crimson px-2 py-[2px] text-[11px] tracking-[0.12em] uppercase" : "ledger-muted"}>{who}</span>
            <Link href="/partner/account" className="ledger-muted hover:opacity-70 max-w-[16rem] truncate">{desk.user.email}</Link>
            <form action="/auth/sign-out?to=partner" method="post"><button type="submit" className="ledger-eyebrow hover:opacity-60">Sign out</button></form>
          </div>
        </div>
      </div>
      <main id="main" className="pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10 md:grid md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] md:gap-10 lg:gap-14 md:pt-10">
          <aside className="md:sticky md:top-24 md:self-start"><Rail items={items} later={later} house={desk.houseEditor} /></aside>
          <div className="pt-6 md:pt-0 min-w-0">{children}</div>
        </div>
      </main>
      <SiteFooter tone="linen" />
    </>
  );
}
