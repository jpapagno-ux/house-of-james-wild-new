import { ImageResponse } from "next/og";

// The house share card (James, 13 Nov 2026: "when we send them by text ... these cards look the same and have the
// James Wild & Co logo on them"). Every page's Open Graph image is drawn here: the page's own photograph, full bleed,
// with the house band across the foot (the cream seal, the wordmark, the place's name and what it is). iMessage,
// WhatsApp, Slack, email and social previews all read this one image, so a stay sent by text from a phone, by an
// advisor or by a traveller always arrives as the same branded card. Cached at the edge for a year per URL.
//
// /og?img=<photo url>&t=<title>&k=<kicker>   (built by lib/seo.ts; never called by hand)

import { readFile } from "node:fs/promises";
import path from "node:path";

// Node runtime: the fonts and seal are read from this folder (traced into the function by next.config.ts).
export const runtime = "nodejs";
const DIR = path.join(process.cwd(), "app/og");

const W = 1200, H = 630;
// Photographs come only from the house's own library (or the site itself); anything else gets the house poster.
const ALLOWED = /^https:\/\/(res\.cloudinary\.com\/jhlnq5h5\/|house-of-james-wild-new\.vercel\.app\/|(www\.)?jameswildco\.com\/)/;
const POSTER = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_fill,w_1200,h_630,g_auto/f_jpg,q_80/jwco/site/home/home-film-poster.jpg";

/** A Cloudinary photograph cropped to the card and delivered as a JPEG the renderer can read. */
function photo(src: string | null): string {
  if (!src || !ALLOWED.test(src)) return POSTER;
  if (!src.includes("res.cloudinary.com")) return src;
  return src.replace(/\/(image|video)\/upload\//, (_m, kind) => `/${kind}/upload/c_fill,w_${W},h_${H},g_auto/f_jpg,q_80/`).replace(/\bf_auto\b/g, "f_jpg");
}

const font = (file: string) => readFile(path.join(DIR, file));

export async function GET(req: Request) {
  try { return await card(req); } catch (e) { return new Response(`share card failed: ${(e as Error).message}`, { status: 500 }); }
}

async function card(req: Request) {
  const u = new URL(req.url);
  const title = (u.searchParams.get("t") || "James Wild & Co").slice(0, 90);
  const kicker = (u.searchParams.get("k") || "").slice(0, 80);
  const [serif, italic, sans, seal] = await Promise.all([
    font("./cormorant-600.woff"), font("./cormorant-500i.woff"), font("./manrope-600.woff"),
    readFile(path.join(DIR, "seal-cream.png")),
  ]);
  const sealSrc = `data:image/png;base64,${seal.toString("base64")}`;
  // the photograph, fetched here so a slow or missing image never breaks the card (it falls back to the house ground)
  let bg: string | null = null;
  try {
    const r = await fetch(photo(u.searchParams.get("img")));
    if (r.ok) {
      bg = `data:${r.headers.get("content-type") || "image/jpeg"};base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`;
    }
  } catch { bg = null; }
  const size = title.length > 46 ? 50 : title.length > 30 ? 60 : 68;

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", background: "#1A1816" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {bg ? <img src={bg} width={W} height={H} style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }} alt="" /> : null}
        {/* the house gradient, Ink to Garnet, rising from the foot so the words always read */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(26,24,22,0) 0%, rgba(26,24,22,0.62) 42%, rgba(42,24,26,0.94) 100%)" }} />
        {/* the crimson keyline across the top, the house's single accent */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 8, background: "#8B2525", display: "flex" }} />
        <div style={{ position: "absolute", left: 56, right: 56, bottom: 44, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 860 }}>
            {kicker ? <div style={{ fontFamily: "Manrope", fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: "rgba(244,242,239,0.82)", marginBottom: 10 }}>{kicker}</div> : null}
            <div style={{ fontFamily: "Cormorant", fontSize: size, lineHeight: 1.04, color: "#FFFFFF" }}>{title}</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 18 }}>
              <div style={{ width: 44, height: 2, background: "#C9A28F", marginRight: 14, display: "flex" }} />
              <div style={{ fontFamily: "CormorantItalic", fontSize: 26, color: "rgba(244,242,239,0.9)" }}>Exploring since 1982</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sealSrc} width={132} height={132} alt="" />
            <div style={{ fontFamily: "Cormorant", fontSize: 26, letterSpacing: 5, color: "#FFFFFF", marginTop: 10 }}>JAMES WILD &amp; CO</div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Cormorant", data: serif, weight: 600, style: "normal" },
        { name: "CormorantItalic", data: italic, weight: 500, style: "italic" },
        { name: "Manrope", data: sans, weight: 600, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" },
    },
  );
}
