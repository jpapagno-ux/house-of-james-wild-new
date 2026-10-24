import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import { VOLUMES } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="max-w-ledger mx-auto px-5 md:px-10 pt-16">
        <p className="ledger-eyebrow ledger-crimson">Not in the Ledger</p>
        <h1 className="ledger-display text-4xl md:text-5xl mt-3">This page isn&apos;t filed yet.</h1>
        <p className="mt-4 text-[17px] ledger-muted max-w-xl">It may be coming in a later build step, or the address has changed. Try one of the volumes:</p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {VOLUMES.map((v) => <li key={v.href}><Link href={v.href} className="ledger-btn">{v.label}</Link></li>)}
        </ul>
      </main>
    </>
  );
}
