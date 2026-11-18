// The invitation email. Pure (no imports, no network) so it can be tested with plain Node.
import { mailShell, para } from "../mail-shell.ts";

export function inviteEmail(o: { org: string; role: string; link: string; inviter: string | null }): { subject: string; text: string; html: string } {
  const subject = `Your James Wild & Co Partner Desk invitation · ${o.org}`.slice(0, 180);
  const who = o.inviter ? `${o.inviter} has invited you` : "You have been invited";
  const text = [`${who} to the James Wild & Co Partner Desk for ${o.org} (${o.role}).`, "", "Open this link to accept. It works once and expires in 14 days:", o.link, "",
    "On the desk you keep your contacts current, answer the house's requests and send updates. Nothing you send changes the website until James Wild & Co has reviewed it."].join("\n");
  const html = mailShell({ eyebrow: "James Wild & Co · Partner Desk", title: `${who} to the desk for ${o.org}`, sub: `Role: ${o.role}`,
    body: [para("The link works once and expires in 14 days."), para("On the desk you keep your contacts current, answer the house's requests and send updates. Nothing you send changes the website until James Wild & Co has reviewed it.")].join("\n"),
    cta: { label: "Accept the invitation", url: o.link } });
  return { subject, text, html };
}
