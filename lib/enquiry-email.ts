import type { Enquiry } from "./enquiry";

// Turns a validated enquiry into the email the house receives. Pure (no
// imports, no network) so it can be tested with plain Node; the route sends
// it through Resend. User text is HTML-escaped; replies go straight to the
// traveller (reply_to).

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const KIND: Record<string, string> = { "advisor-application": "Advisor application", partner: "Partner submission", iggi: "Trip enquiry (from Iggi)", compass: "Trip enquiry (from the Compass)" };

export function enquiryEmail(e: Enquiry): { subject: string; text: string; html: string } {
  const c = e.context ?? {};
  const kind = (c.from && KIND[c.from]) || "Trip enquiry";
  const about = c.trip || e.where || "a journey";
  const rows: [string, string | undefined][] = [
    ["Name", e.name], ["Email", e.email], ["Phone", e.phone],
    ["Reply by", e.contact === "email" ? "Email" : `${e.contact === "phone" ? "Phone" : "Video"} call${e.callTime ? `, ${e.callTime}` : ""}`],
    ["Where", e.where], ["When", e.when], ["How long", e.nights],
    ["Travellers", `${e.adults} adult${e.adults === 1 ? "" : "s"}${e.children ? `, ${e.children} child${e.children === 1 ? "" : "ren"}` : ""}`],
    ["Budget", e.budget], ["Interests", e.interests?.join(", ")],
    ["Writing to", c.advisor], ["Trip", c.trip], ["Option / cabin", c.option], ["Add-ons", c.addons],
    ["Estimate", c.estimate ? `US$${Number(c.estimate).toLocaleString("en-US")} (price builder, example prices)` : undefined],
    ["Own advisor", e.hasAdvisor ? e.advisorDetails : undefined],
    ["Travel Notes", e.travelNotes ? "Yes, opted in" : "No"],
  ];
  const filled = rows.filter(([, v]) => v && String(v).trim());
  const subject = `${kind}: ${e.name} · ${about}`.slice(0, 180);
  const text = [`${kind} from jameswildco.com`, "", ...filled.map(([k, v]) => `${k}: ${v}`), "", "Message:", e.message?.trim() || "(none)"].join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#2D2A26;max-width:620px">
<p style="font:12px/1.4 monospace;letter-spacing:.12em;text-transform:uppercase;color:#8B2525;margin:0 0 6px">${esc(kind)}</p>
<h1 style="font-size:22px;margin:0 0 16px">${esc(e.name)} · ${esc(about)}</h1>
<table style="border-collapse:collapse;width:100%;font-size:15px">${filled.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b665f;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;border-bottom:1px solid #e6e1d9">${esc(String(v))}</td></tr>`).join("")}</table>
<p style="font-size:15px;margin:18px 0 4px;color:#6b665f">Message</p>
<p style="font-size:16px;white-space:pre-wrap;margin:0">${esc(e.message?.trim() || "(none)")}</p>
<p style="font-size:12px;color:#8a857d;margin-top:24px">Reply to this email to answer ${esc(e.name.split(" ")[0])} directly.</p></div>`;
  return { subject, text, html };
}
