import portal from "@/components/platform/portal.module.css";
import SiteHeader from "@/components/ledger/SiteHeader";
import Rail, { type RailItem } from "@/components/platform/Rail";
import { loadAdvisor } from "@/lib/platform/advisor";

// The Advisor Desk shell: the site header, a masthead with the advisor's name, number and tier, the rail,
// and the page. Every page re-checks access on the server (requireAdvisor); this layout only draws.
export default async function AdvisorDeskLayout({ children }: { children: React.ReactNode }) {
  const a = await loadAdvisor();
  if (!a || a.mfa !== "ok" || (a.advisor.status !== "active" && a.advisor.status !== "invited")) return <>{children}</>;
  const active = a.advisor.status === "active";
  // Until the house activates them, an advisor sees only their file.
  const items: RailItem[] = active
    ? [{ href: "/advisor", label: "Overview" }, { href: "/advisor/ledger", label: "The Ledger" }, { href: "/advisor/requests", label: "Quote requests" }, { href: "/advisor/clients", label: "My clients" }, { href: "/advisor/earnings", label: "Earnings" }, { href: "/advisor/file", label: "My file" }]
    : [{ href: "/advisor/file", label: "My file" }];
  const later: RailItem[] = !active ? [] : [
    { href: "#", label: "My profile", soon: "soon" },
  ];
  return (
    <>
      <SiteHeader />
      <div className={portal.portal}>
        <div className="border-b ledger-border border-t-2 border-t-[#8B2525] bg-white">
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="ledger-eyebrow text-[#8B2525]">Advisor Desk</p>
            <p className="ledger-display text-[1.2rem] leading-none">{a.advisor.display_name}</p>
            <span className="font-mono text-[11.5px] tracking-[0.06em] ledger-crimson">{a.advisor.adv_number}</span>
            <div className="ml-auto flex flex-wrap items-center gap-4 text-[13px]">
              <span className="ledger-muted">{active ? a.tier.label : "File in progress"}</span>
              <span className="ledger-muted max-w-[16rem] truncate">{a.user.email}</span>
              <form action="/auth/sign-out?to=advisor" method="post"><button type="submit" className="ledger-eyebrow hover:opacity-60">Sign out</button></form>
            </div>
          </div>
        </div>
        <main id="main" className="pb-20">
          <div className="max-w-ledger mx-auto px-5 md:px-10 md:grid md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] md:gap-10 lg:gap-14 md:pt-10">
            <aside className="md:sticky md:top-24 md:self-start"><Rail items={items} later={later} house={false} root="/advisor" label="Advisor Desk" /></aside>
            <div className="pt-6 md:pt-0 min-w-0">{children}</div>
          </div>
        </main>
      </div>
    </>
  );
}
