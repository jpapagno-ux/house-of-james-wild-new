"use client";
import { useId, useState } from "react";
import { Mail } from "lucide-react";

// Travel Notes sign-up, used on destination pages, House Sessions and /travel-notes.
export default function TravelNotesForm({ source, button = "Join", label = "Email address", className = "" }: { source: string; button?: string; label?: string; className?: string }) {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | "done" | "preview" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const r = await fetch("/api/travel-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), website: f.get("website"), source }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setState("error"); setMsg(j.error ?? "Something went wrong. Please try again."); return; }
      setState(j.live === false ? "preview" : "done");
    } catch { setState("error"); setMsg("Something went wrong. Please try again."); }
  }
  if (state === "done") return <p className={`text-[15px] ${className}`} role="status">You&rsquo;re on the list. The next letter comes when something new is filed.</p>;
  if (state === "preview") return <p className={`text-[15px] ${className}`} role="status">Thank you. Sign-ups open when the site launches; until then, write to <a className="underline" href="mailto:hello@jameswildco.com">hello@jameswildco.com</a>.</p>;
  return (
    <form onSubmit={submit} className={`flex gap-2 flex-wrap ${className}`}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <input id={id} name="email" type="email" required autoComplete="email" placeholder="Your email" className="flex-1 min-w-0 md:min-w-56 bg-paper border ledger-border px-3 py-2 text-[16px] outline-none focus:border-crimson" />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button type="submit" disabled={state === "sending"} className="ledger-btn inline-flex items-center gap-2"><Mail className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> {state === "sending" ? "Adding…" : button}</button>
      {state === "error" && <p className="w-full text-[14px] ledger-crimson" role="alert">{msg}</p>}
    </form>
  );
}
