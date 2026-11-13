// No outbound links (James, 13 Nov 2026: "I don't want to link to any external URLs ... for any voyage, for any
// stay, for any gathering, for any hotel whatsoever ... a hard freeze"). A link may leave the page only for the
// house's own sites and accounts; every other address (an operator, hotel, cruise line, tour company, booking
// site, OTA, tourism board, airport, park authority, news site) is shown as plain text with no link. The fact and
// its source stay in the data. Checked site-wide by scripts/audit/external-links.mjs.
const HOUSE = /(^|\.)(jameswildco\.com|house-of-james-wild-new\.vercel\.app|polarcrossings\.com|wildearthstays?\.com|wildcosafaris\.com|calendly\.com|instagram\.com|facebook\.com|pinterest\.com|x\.com|youtube\.com|base44\.app|res\.cloudinary\.com)$/;
export function linkable(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) return true;
  try { return HOUSE.test(new URL(url).hostname); } catch { return false; }
}
