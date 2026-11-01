import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Mail } from "./emails";

// Sending: Resend when RESEND_API_KEY is set, otherwise a structured log line
// (so Preview without keys still shows what would go out). Never throws — a
// failed email must never fail the booking action that caused it.
// From myfolio@ (INBOXES.folio); the house copy goes to the trips inbox.

const FROM = () => process.env.FOLIO_FROM ?? "James Wild & Co · My Folio <myfolio@jameswildco.com>";
export const HOUSE_INBOX = () => process.env.BOOKING_LIVE_HOUSE_TO ?? "hello@jameswildco.com";

export async function sendMail(to: string | null | undefined, mail: Mail, replyTo?: string | null): Promise<"sent" | "dry" | "skipped" | "failed"> {
  if (!to) return "skipped";
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log(JSON.stringify({ mail: "dry-run", to, subject: mail.subject })); return "dry"; }
  try {
    const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM(), to: [to], reply_to: replyTo ?? HOUSE_INBOX(), subject: mail.subject, text: mail.text, html: mail.html }), signal: AbortSignal.timeout(15_000) });
    if (!res.ok) { console.error(JSON.stringify({ mail: "failed", to, status: res.status, subject: mail.subject })); return "failed"; }
    return "sent";
  } catch (e) { console.error(JSON.stringify({ mail: "failed", to, error: e instanceof Error ? e.message : String(e) })); return "failed"; }
}

/** The traveler's name and email, read with the service role (the caller already authorised the action). */
export async function traveler(admin: SupabaseClient, userId: string): Promise<{ first: string | null; name: string; email: string | null }> {
  const { data } = await admin.from("profiles").select("first_name, last_name, email").eq("id", userId).maybeSingle();
  const name = [data?.first_name, data?.last_name].filter(Boolean).join(" ") || "Traveler";
  return { first: data?.first_name ?? null, name, email: data?.email ?? null };
}

export const originOf = (req: Request) => new URL(req.url).origin;
