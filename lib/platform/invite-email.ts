// The invitation email. Pure (no imports, no network) so it can be tested with plain Node.
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function inviteEmail(o: { org: string; role: string; link: string; inviter: string | null }): { subject: string; text: string; html: string } {
  const subject = `Your James Wild & Co Partner Desk invitation · ${o.org}`.slice(0, 180);
  const who = o.inviter ? `${o.inviter} has invited you` : "You have been invited";
  const text = [`${who} to the James Wild & Co Partner Desk for ${o.org} (${o.role}).`, "", "Open this link to accept. It works once and expires in 14 days:", o.link, "",
    "On the desk you keep your contacts current, answer the house's requests and send updates. Nothing you send changes the website until James Wild & Co has reviewed it."].join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#2D2A26;max-width:560px">
<p style="font:11px/1.4 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#8B2525;margin:0 0 8px">James Wild &amp; Co · Partner Desk</p>
<h1 style="font-size:24px;font-weight:normal;margin:0 0 14px">${esc(who)} to the desk for ${esc(o.org)}</h1>
<p style="font-size:16px;line-height:1.5;margin:0 0 18px">Role: ${esc(o.role)}. The link works once and expires in 14 days.</p>
<p style="margin:0 0 22px"><a href="${esc(o.link)}" style="display:inline-block;background:#8B2525;color:#F4F1ED;text-decoration:none;font:12px Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;padding:12px 20px">Accept the invitation</a></p>
<p style="font-size:14px;line-height:1.5;color:#6b665f;margin:0">On the desk you keep your contacts current, answer the house's requests and send updates. Nothing you send changes the website until James Wild &amp; Co has reviewed it.</p></div>`;
  return { subject, text, html };
}
