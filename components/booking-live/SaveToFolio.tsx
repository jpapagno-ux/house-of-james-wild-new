"use client";
import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { FLAGS } from "@/lib/booking-live/flags";
import { api } from "./client";

// "Save to My Folio" on a stay page. A small client island: the stay page
// stays fully static (titles, copy, JSON-LD untouched); this renders nothing
// at all while the save flag is off. Signed-out travelers are sent to sign in
// and returned to the same stay.
export default function SaveToFolio({ slug, name }: { slug: string; name: string }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "signin" | "error">("idle");
  if (!FLAGS.save) return null;
  const back = `/stays/${slug}`;
  return (
    <div className="pt-4 flex flex-wrap items-center gap-3">
      {state === "signin" ? (
        <Link href={`/account/sign-in?next=${encodeURIComponent(back)}`} className="ledger-btn">Sign in to save {name}</Link>
      ) : (
        <button type="button" disabled={state === "saving" || state === "saved"} className="ledger-btn disabled:opacity-70"
          aria-live="polite"
          onClick={async () => {
            setState("saving");
            const r = await api("/api/v1/me/favorites", "POST", { property: slug });
            setState(r.ok ? "saved" : r.code === "sign_in_required" ? "signin" : "error");
          }}>
          {state === "saved" ? <BookmarkCheck className="w-4 h-4" strokeWidth={1.5} /> : <BookmarkPlus className="w-4 h-4" strokeWidth={1.5} />}
          {state === "saved" ? "Saved to My Folio" : state === "saving" ? "Saving…" : "Save to My Folio"}
        </button>
      )}
      {state === "saved" && <Link href="/account/favorites" className="ledger-eyebrow hover:opacity-60">View my Folio</Link>}
      {state === "error" && <p role="alert" className="text-[14px] ledger-crimson">Couldn&rsquo;t save just now. Try again.</p>}
    </div>
  );
}
