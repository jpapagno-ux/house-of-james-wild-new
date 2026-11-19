// One email shell for the whole house (James, 18 Nov 2026: "designed, easy to see on a phone, a watercolour
// header"): advisor desk, partner desk, Booking Live traveller emails and enquiries all wear it.
// Mobile first: one column; the watercolour scene full width; the crimson seal on white (readable in light and
// dark mail apps, unlike a light logo on a dark band that Gmail washes out); a large heading; a full-width button
// and the link written out beneath it. Table layout, inline styles, no web fonts. Import-free: plain Node tests it.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
/** The house's email header, a watercolour panorama (savanna, lagoon, mountains, the hare). */
export const MAIL_HEADER = `${CLD}/c_fill,g_auto,w_1200,h_520,q_auto:good,f_jpg/jwco/email/header-house-watercolour`;
export const SITE_ORIGIN = "https://house-of-james-wild-new.vercel.app";
const SANS = "Helvetica,Arial,sans-serif", SERIF = "Georgia,'Times New Roman',serif";

export type ShellInput = {
  eyebrow: string; title: string; sub?: string | null;
  /** Body HTML, already escaped by the caller. */
  body: string;
  cta?: { label: string; url: string } | null;
  foot?: string | null;
  photo?: string | null; header?: string | null; origin?: string | null;
};

/** A paragraph in the shell's body style (text is escaped). */
export const para = (s: string) => `<p style="margin:0 0 14px">${esc(s)}</p>`;

export function mailShell(o: ShellInput): string {
  let origin = o.origin ?? SITE_ORIGIN;
  if (!o.origin && o.cta) { try { origin = new URL(o.cta.url).origin; } catch { /* keep the house origin */ } }
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:#F4F2EF">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F4F2EF" style="background:#F4F2EF"><tr><td align="center" style="padding:16px 8px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #DCD7D0">
<tr><td style="padding:0;line-height:0"><img src="${esc(o.header ?? MAIL_HEADER)}" width="600" alt="A watercolour of savanna, lagoon and mountains, with the James Wild hare" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
<tr><td align="center" style="padding:22px 24px 6px">
<img src="${esc(origin)}/brand/jwco-hare-240.png" width="84" height="84" alt="James Wild &amp; Co seal" style="display:block;width:84px;height:84px;border:0">
<p style="margin:10px 0 0;font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8B2525">${esc(o.eyebrow)}</p>
</td></tr>
${o.photo ? `<tr><td align="center" style="padding:18px 24px 0"><img src="${esc(o.photo)}" width="120" height="150" alt="" style="display:block;width:120px;height:150px;border:0;object-fit:cover"></td></tr>` : ""}
<tr><td align="center" style="padding:18px 28px 0">
<h1 style="margin:0;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:1.2;color:#1A1816">${esc(o.title)}</h1>
${o.sub ? `<p style="margin:8px 0 0;font-family:${SANS};font-size:14px;color:#6B635A">${esc(o.sub)}</p>` : ""}
</td></tr>
<tr><td style="padding:22px 28px 0;font-family:${SANS};font-size:17px;line-height:1.6;color:#2E2B28">
${o.body}
</td></tr>
${o.cta ? `<tr><td style="padding:8px 28px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#1A1816" style="background:#1A1816">
<a href="${esc(o.cta.url)}" style="display:block;padding:18px 20px;font-family:${SANS};font-size:17px;font-weight:bold;color:#FFFFFF;text-decoration:none">${esc(o.cta.label)} &#8594;</a>
</td></tr></table>
<p style="margin:14px 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:#6B635A;text-align:center;word-break:break-all">Or open: <a href="${esc(o.cta.url)}" style="color:#2E2B28">${esc(o.cta.url)}</a></p>
</td></tr>` : `<tr><td style="padding:0 0 14px"></td></tr>`}
${o.foot ? `<tr><td style="padding:0 28px 22px;font-family:${SANS};font-size:13px;line-height:1.5;color:#6B635A">${esc(o.foot)}</td></tr>` : ""}
<tr><td align="center" style="border-top:1px solid #CFC8BF;padding:18px 24px;font-family:${SERIF};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6B635A">James Wild &amp; Co · Journey design since 1982</td></tr>
</table></td></tr></table></body></html>`;
}
