import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { alertMail, type AlertEvent, type Mail } from "./advisor-mail";

// Sending desk emails (step 7). Through Resend, only when enquiries are live (ENQUIRY_LIVE=on and
// RESEND_API_KEY set), never to .test addresses, and never failing the action that caused it: a missed
// email is logged; the desk itself always shows what is waiting.
// The house's copy goes to ADVISOR_ALERTS_TO, else the advisors' enquiry inbox, else the trips inbox.

export const mailLive = () => process.env.ENQUIRY_LIVE === "on" && !!process.env.RESEND_API_KEY;
const FROM = () => process.env.ENQUIRY_FROM ?? "James Wild & Co <hello@jameswildco.com>";
export const houseAlertsTo = () => process.env.ADVISOR_ALERTS_TO ?? process.env.ENQUIRY_ADVISORS_TO ?? process.env.ENQUIRY_TRIPS_TO ?? null;

export async function sendDeskMail(to: string | null | undefined, mail: Mail, tag: string): Promise<"sent" | "off" | "skipped" | "failed"> {
  if (!to || /\.test$/i.test(to)) return "skipped";
  if (!mailLive()) { console.log(JSON.stringify({ deskMail: "off", tag, subject: mail.subject })); return "off"; }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM(), to: [to], subject: mail.subject, text: mail.text, html: mail.html }), signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) { console.error(JSON.stringify({ deskMail: "failed", tag, status: r.status })); return "failed"; }
    return "sent";
  } catch (x) { console.error(JSON.stringify({ deskMail: "failed", tag, error: x instanceof Error ? x.message : String(x) })); return "failed"; }
}

/** To the house: something on the desk is waiting. */
export const houseAlert = (e: AlertEvent, req: Request, path: string) => sendDeskMail(houseAlertsTo(), alertMail(e, new URL(req.url).origin, path), e.kind);
/** To an advisor, at the notice address on their file. */
export const advisorAlert = (to: string | null, e: AlertEvent, req: Request, path: string) => sendDeskMail(to, alertMail(e, new URL(req.url).origin, path), e.kind);

/** The advisor's notice address from their details (read as the house). Null until they file their details. */
export async function noticeEmail(sb: SupabaseClient, advisorId: string): Promise<string | null> {
  const { data } = await sb.from("advisor_details").select("notice_email").eq("advisor_id", advisorId).maybeSingle();
  return (data as { notice_email?: string } | null)?.notice_email ?? null;
}
