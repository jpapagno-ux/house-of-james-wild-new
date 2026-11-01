import SiteHeader from "@/components/ledger/SiteHeader";
import SiteFooter from "@/components/ledger/SiteFooter";

// The desk's front door (sign in, password, invitation, apply): the site's own
// header and a single calm column.
export default function DoorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-8 md:pt-14 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">{children}</div>
      </main>
      <SiteFooter tone="linen" />
    </>
  );
}
