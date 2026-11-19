// Partner Desk invitation email (James, 19 Nov 2026). Pure, like advisor-mail.ts: the house mail shell, one button.
import { deskMail, type Mail } from "./advisor-mail.ts";

export function partnerInviteMail(o: { name: string | null; org: string; link: string; inviter: string | null; role: "partner_admin" | "partner_contributor"; entries: string[] }): Mail {
  const first = o.name?.trim().split(/\s+/)[0] || null;
  const places = o.entries.length === 0 ? null
    : o.entries.length <= 3 ? o.entries.join(", ")
    : `${o.entries.slice(0, 3).join(", ")} and ${o.entries.length - 3} more`;
  const what = o.role === "partner_admin"
    ? "Open the link and sign in with this email address, then choose a password. A short set-up then walks you through each part of the desk: your company details, contacts, hosts, rooms, rates and offers, documents, commercial terms, banking and policies, and your team. Save as you go and come back any time."
    : "Open the link and sign in with this email address, then choose a password. You can then keep the record current and answer the house's requests.";
  return deskMail({
    eyebrow: "James Wild & Co · Partner Desk",
    title: first ? `${first}, your Partner Desk is ready` : `${o.org}: your Partner Desk is ready`,
    sub: places ? `${o.org} · ${places}` : o.org,
    lines: [
      `${o.inviter ? `${o.inviter} has invited you` : "You have been invited"} to the James Wild & Co Partner Desk, where ${o.org} keeps its record with the house current.`,
      what,
      "Nothing you enter changes the website until the house approves it. The link works once and expires in 14 days.",
    ],
    link: o.link, cta: "Accept the invitation",
  });
}
