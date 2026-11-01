"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Switches the organization in view (people in more than one, and the house).
export default function OrgSwitcher({ orgs, current }: { orgs: { slug: string; name: string }[]; current: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function change(slug: string) {
    setBusy(true);
    await fetch("/api/v1/partner/org", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ org: slug }) });
    router.refresh();
    setBusy(false);
  }
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Organization in view</span>
      <select value={current} disabled={busy} onChange={(e) => change(e.target.value)} className="bg-paper border ledger-border px-2 py-1 text-[13px] max-w-[14rem]">
        {orgs.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}
      </select>
    </label>
  );
}
