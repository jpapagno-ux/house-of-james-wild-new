// Advisor Desk emails (step 7): the invitation, and the short alerts that tell the house and the advisor
// something is waiting. Pure (no imports, no network) so plain Node can test them. Every alert says what
// happened and links to the screen; nothing private (tax numbers, prices for another advisor) goes in.
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export const undashMail = (s: string) => s.replace(/\s*[–—]\s*/g, ", ");

export type Mail = { subject: string; text: string; html: string };

/** One shape for every desk email: eyebrow, a heading, a few lines, one button. */
export function deskMail(o: { eyebrow: string; title: string; lines: string[]; link: string; cta: string }): Mail {
  const title = undashMail(o.title), lines = o.lines.map(undashMail);
  const subject = `${title} · James Wild & Co`.slice(0, 180);
  const text = [title, "", ...lines, "", `${o.cta}: ${o.link}`].join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#2E2B28;max-width:560px">
<p style="font:11px/1.4 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#8B2525;margin:0 0 8px">${esc(o.eyebrow)}</p>
<h1 style="font-size:24px;font-weight:normal;color:#1A1816;margin:0 0 14px">${esc(title)}</h1>
${lines.map((l) => `<p style="font-size:16px;line-height:1.5;margin:0 0 10px">${esc(l)}</p>`).join("\n")}
<p style="margin:18px 0 0"><a href="${esc(o.link)}" style="display:inline-block;background:#1A1816;color:#FFFFFF;text-decoration:none;font:12px Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;padding:12px 20px">${esc(o.cta)}</a></p></div>`;
  return { subject, text, html };
}

/**
 * The advisor's invitation (redesigned, James, 18 Nov 2026): the house lockup, the advisor's name and ADV
 * number, one button, the three steps in order and what waits on the desk. Type only, no images, so it
 * reads the same in every mail client; tables and inline styles for Outlook and Gmail.
 */
export function advisorInviteMail(o: { name: string; link: string; inviter: string | null; adv?: string | null; role?: string | null }): Mail {
  const first = undashMail(o.name.split(" ")[0]);
  const title = `${first}, your Advisor Desk is ready`;
  const who = o.inviter ? `${o.inviter} has invited you` : "You have been invited";
  const lead = `${who} to the James Wild & Co Advisor Desk: the house's Ledger, your clients, your quotes and your earnings, behind one sign-in.`;
  const steps: [string, string][] = [
    ["Accept the invitation", "Open the link and sign in with this email address."],
    ["Secure your desk", "Set up an authenticator app on your phone. You enter its code each time you sign in."],
    ["Fill in your file", "Your details, plan, agreement, documents and your Advisor DNA. The house reviews it and opens your desk."],
  ];
  const desk: [string, string][] = [
    ["The Ledger", "Every stay, voyage and safari the house has vetted, at the house's own rates."],
    ["Quote requests", "Ask the house to price and hold a stay for your client."],
    ["My clients", "Everyone you are planning for, with their quotes and trips."],
    ["Earnings", "Your commission on every booking, as it is confirmed and paid."],
  ];
  const role = o.role ? undashMail(o.role) : null;
  const subject = `${title} · James Wild & Co`.slice(0, 180);
  const text = [
    title, "", lead, "",
    ...(o.adv ? [`Your advisor number: ${o.adv}${role ? ` · ${role}` : ""}`, ""] : []),
    `Accept the invitation: ${o.link}`, "",
    "What happens next", ...steps.map(([t, l], i) => `${i + 1}. ${t}. ${l}`), "",
    "On your desk", ...desk.map(([t, l]) => `- ${t}: ${l}`), "",
    "The link works once and expires in 14 days.", "",
    "James Wild & Co · Exploring since 1982 · 1.800.419.7000 · hello@jameswildco.com",
  ].join("\n");
  const serif = "Georgia,'Times New Roman',serif", sans = "Arial,Helvetica,sans-serif";
  const label = `font:11px/1.4 ${sans};letter-spacing:.22em;text-transform:uppercase`;
  const html = `<div style="background:#F4F2EF;padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #DCD7D0;border-collapse:collapse">
<tr><td style="height:4px;background:#8B2525;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:30px 36px 22px;text-align:center;border-bottom:1px solid #DCD7D0">
<p style="${label};color:#8B2525;margin:0 0 10px">Advisor Desk · Invitation</p>
<p style="font:normal 30px/1.1 ${serif};color:#1A1816;margin:0">James Wild &amp; Co.</p>
<p style="${label};font-size:10px;color:#6B635A;margin:8px 0 0">Exploring since 1982</p>
</td></tr>
<tr><td style="padding:34px 36px 8px">
<h1 style="font:normal 32px/1.15 ${serif};color:#1A1816;margin:0 0 16px">${esc(title)}</h1>
<p style="font:16px/1.6 ${serif};color:#2E2B28;margin:0 0 22px">${esc(lead)}</p>
${o.adv ? `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 26px"><tr><td style="border-left:3px solid #8B2525;background:#F4F2EF;padding:12px 18px">
<p style="${label};font-size:10px;color:#6B635A;margin:0 0 4px">Your advisor number</p>
<p style="font:15px/1.3 'Courier New',Courier,monospace;letter-spacing:.06em;color:#8B2525;margin:0">${esc(o.adv)}</p>
${role ? `<p style="font:14px/1.4 ${serif};color:#2E2B28;margin:6px 0 0">${esc(role)}</p>` : ""}
</td></tr></table>` : ""}
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 10px"><tr>
<td style="background:#1A1816"><a href="${esc(o.link)}" style="display:inline-block;padding:16px 26px;font:12px/1 ${sans};letter-spacing:.2em;text-transform:uppercase;color:#FFFFFF;text-decoration:none">Accept the invitation</a></td>
<td style="background:#8B2525"><a href="${esc(o.link)}" style="display:inline-block;padding:16px 18px;font:14px/1 ${sans};color:#FFFFFF;text-decoration:none" aria-hidden="true">&rarr;</a></td>
</tr></table>
<p style="font:13px/1.5 ${serif};color:#6B635A;margin:0 0 6px">The link works once and expires in 14 days.</p>
</td></tr>
<tr><td style="padding:22px 36px 6px">
<p style="${label};color:#8B2525;margin:0 0 12px;padding-top:22px;border-top:1px solid #DCD7D0">What happens next</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${steps.map(([t, l], i) => `<tr><td valign="top" style="width:44px;padding:0 0 16px;font:12px/1.6 'Courier New',Courier,monospace;letter-spacing:.1em;color:#6B635A">0${i + 1}</td><td valign="top" style="padding:0 0 16px"><p style="font:18px/1.3 ${serif};color:#1A1816;margin:0">${esc(t)}</p><p style="font:14.5px/1.55 ${serif};color:#2E2B28;margin:3px 0 0">${esc(l)}</p></td></tr>`).join("\n")}
</table>
</td></tr>
<tr><td style="padding:6px 36px 26px">
<p style="${label};color:#8B2525;margin:0 0 12px;padding-top:22px;border-top:1px solid #DCD7D0">On your desk</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${desk.map(([t, l]) => `<tr><td valign="top" style="padding:0 0 12px"><p style="font:16px/1.3 ${serif};color:#1A1816;margin:0">${esc(t)}</p><p style="font:14px/1.5 ${serif};color:#6B635A;margin:2px 0 0">${esc(l)}</p></td></tr>`).join("\n")}
</table>
</td></tr>
<tr><td style="padding:18px 36px 22px;background:#F4F2EF;border-top:1px solid #DCD7D0">
<p style="font:12.5px/1.6 ${serif};color:#6B635A;margin:0 0 10px">If the button does not open, copy this address into your browser:<br><span style="font:12px/1.5 'Courier New',Courier,monospace;color:#2E2B28;word-break:break-all">${esc(o.link)}</span></p>
<p style="${label};font-size:10px;color:#6B635A;margin:0">James Wild &amp; Co · 1.800.419.7000 · hello@jameswildco.com</p>
</td></tr>
</table></div>`;
  return { subject, text, html };
}

export type AlertEvent =
  | { kind: "dna_sent"; advisor: string }
  | { kind: "document_sent"; advisor: string; document: string }
  | { kind: "request_sent"; advisor: string; ref: string; stay: string; dates: string }
  | { kind: "invitation_accepted"; advisor: string }
  | { kind: "request_moved"; ref: string; stay: string; status: "pricing" | "held" | "confirmed" | "declined" }
  | { kind: "dna_decided"; status: "approved" | "returned" }
  | { kind: "document_decided"; document: string; status: "accepted" | "returned" }
  | { kind: "activated" };

const MOVED: Record<string, string> = {
  pricing: "The house is pricing it with the property.",
  held: "It is priced and held. Open it to see the price and the hold date, and copy the words for your client.",
  confirmed: "It is confirmed.",
  declined: "The property cannot offer it. Open it to see the house's note.",
};

/** What each event says, and where its button goes (a path on the site). */
export function alertMail(e: AlertEvent, origin: string, path: string): Mail {
  const link = `${origin}${path}`;
  const house = "James Wild & Co · House desk", adv = "James Wild & Co · Advisor Desk";
  switch (e.kind) {
    case "dna_sent": return deskMail({ eyebrow: house, title: `Advisor DNA to review: ${e.advisor}`, lines: [`${e.advisor} has sent their Advisor DNA and card words. Nothing reaches the website until you approve it.`], link, cta: "Review it" });
    case "document_sent": return deskMail({ eyebrow: house, title: `Document to review: ${e.advisor}`, lines: [`${e.advisor} has uploaded a document: ${e.document}.`], link, cta: "Review it" });
    case "request_sent": return deskMail({ eyebrow: house, title: `Quote request ${e.ref}: ${e.stay}`, lines: [`${e.advisor} asks the house to price and hold ${e.stay}, ${e.dates}.`], link, cta: "Open the request" });
    case "invitation_accepted": return deskMail({ eyebrow: house, title: `${e.advisor} accepted the invitation`, lines: [`${e.advisor} has signed in and can now fill in their file. You will hear when there is something to review.`], link, cta: "Open their file" });
    case "request_moved": return deskMail({ eyebrow: adv, title: `${e.ref} · ${e.stay}`, lines: [MOVED[e.status]], link, cta: "Open the request" });
    case "dna_decided": return deskMail({ eyebrow: adv, title: e.status === "approved" ? "Your Advisor DNA is approved" : "The house returned your Advisor DNA",
      lines: [e.status === "approved" ? "What you sent is now on file. Once your desk is active, the website shows it on the pages you know." : "Open it to read the house's note, change what it asks and send it again."], link, cta: "Open it" });
    case "document_decided": return deskMail({ eyebrow: adv, title: e.status === "accepted" ? `Accepted: ${e.document}` : `Returned: ${e.document}`,
      lines: [e.status === "accepted" ? "The house has accepted this document." : "Open your documents to read why and upload it again."], link, cta: "Open my documents" });
    case "activated": return deskMail({ eyebrow: adv, title: "Your Advisor Desk is open", lines: ["The house has activated your file. The Ledger, quote requests, your clients and your earnings are open to you now."], link, cta: "Open the desk" });
  }
}
