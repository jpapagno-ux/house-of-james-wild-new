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

export function advisorInviteMail(o: { name: string; link: string; inviter: string | null }): Mail {
  const first = o.name.split(" ")[0];
  return deskMail({
    eyebrow: "James Wild & Co · Advisor Desk",
    title: `${first}, your Advisor Desk is ready`,
    lines: [
      `${o.inviter ? `${o.inviter} has invited you` : "You have been invited"} to the James Wild & Co Advisor Desk.`,
      "Open the link, sign in with this email address and set up an authenticator app on your phone. Then fill in your file: your details, plan, agreement, documents and your Advisor DNA. The house reviews it and opens your desk.",
      "The link works once and expires in 14 days.",
    ],
    link: o.link, cta: "Accept the invitation",
  });
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
