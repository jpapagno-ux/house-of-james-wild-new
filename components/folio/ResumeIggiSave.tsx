"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearPending, readPending, saveFolioToAccount } from "@/lib/folio/account-save";

// After the magic link (Iggi Stage 2, 21 Nov 2026): the Folio, sketch and chat Iggi handed over before sign-in are
// waiting in this browser. Save them to the account once, then open the journey. Mounted on /account/folios.
export default function ResumeIggiSave() {
  const sp = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "failed">("idle");
  useEffect(() => {
    if (sp.get("resume") !== "iggi") return;
    const p = readPending();
    if (!p) return;
    setState("saving");
    void saveFolioToAccount(p).then((res) => {
      if (res.ok) { clearPending(); router.replace(`/account/folios/${res.id}?kept=1`); }
      else setState("failed");
    });
  }, [sp, router]);
  if (state === "idle") return null;
  return (
    <p className="text-[15px] ledger-muted" aria-live="polite">
      {state === "saving" ? "Keeping the Folio Iggi opened, with the sketch and your chat…" : "The Folio Iggi opened couldn't be saved just now. It is still on your shelf under My Folio; open Iggi again and choose Keep as my Folio."}
    </p>
  );
}
