import type { Metadata } from "next";
import { SITE } from "./site";

// Indexing is on only for the production deployment on the real domain.
// Every Vercel preview (and local dev) is noindex, so nothing reaches Google
// before launch (step 9). Set NEXT_PUBLIC_INDEXING=on in production to open.
export const isIndexable = process.env.NEXT_PUBLIC_INDEXING === "on" && process.env.VERCEL_ENV === "production";

export const absoluteUrl = (path = "/") => new URL(path, SITE.url).toString();

type PageMeta = {
  title: string; // the page's own title, without the house suffix
  description: string; // 140–160 characters, the page's answer in brief
  path: string; // canonical path, e.g. "/stays/dumatau"
  image?: { url: string; alt: string };
  type?: "website" | "article";
  noindex?: boolean;
};

// One builder for every page: title pattern, canonical, Open Graph, Twitter,
// robots. Pages call buildMetadata() from generateMetadata().
// The root layout appends " | James Wild & Co" (18 characters), so a page
// title has 47 characters before it crosses Google's ~65-character display.
const SUFFIX = 18, MAX_TITLE = 65, MAX_DESC = 158;
/** The fullest title variant that still fits in search results. */
export function fitTitle(variants: string[]): string {
  return variants.find((v) => v.length + SUFFIX <= MAX_TITLE) ?? variants[variants.length - 1];
}
/** Trim a description to ~158 characters at a sentence, else a word. */
export function fitDescription(d: string): string {
  if (d.length <= MAX_DESC) return d;
  const cut = d.slice(0, MAX_DESC);
  const dot = cut.lastIndexOf(". ");
  return dot > 90 ? cut.slice(0, dot + 1) : `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`;
}

// Share image for pages that don't name one (hubs, forms): the house film poster.
export const DEFAULT_SHARE = { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_fill,w_1200,h_630/q_auto:good/f_jpg/jwco/site/home/home-film-poster.jpg", alt: "James Wild & Co, exploring since 1982" };

// The share card (app/og): drawn on whichever domain is serving production, so a link texted before the house domain
// is connected still brings its card.
const OG_ORIGIN = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : SITE.url;

/** "Cap Karoso, Indonesia: Vetted Stay" → the name, and a kicker line of where and what. */
export function shareWords(title: string): { name: string; kicker: string; head: string } {
  const [head, ...rest] = title.split(/:\s+/);
  const tail = rest.join(": ");
  const i = head.indexOf(", ");
  const name = i > 0 ? head.slice(0, i) : head;
  const where = i > 0 ? head.slice(i + 2) : "";
  const kicker = [where, tail && tail.length <= 28 ? tail : ""].filter(Boolean).join(" · ");
  return { name, kicker, head };
}

/** The branded share card for a page: its own photograph under the house band. */
export function shareCard(title: string, photo?: string | null): string {
  const { name, kicker } = shareWords(title);
  const q = new URLSearchParams({ t: name, ...(kicker ? { k: kicker } : {}), ...(photo ? { img: photo } : {}) });
  return `${OG_ORIGIN}/og?${q.toString()}`;
}

export function buildMetadata({ title, description: raw, path, image: given, type = "website", noindex }: PageMeta): Metadata {
  const image = given ?? DEFAULT_SHARE;
  const url = absoluteUrl(path);
  const description = fitDescription(raw);
  const index = isIndexable && !noindex;
  // Shared by text, mail or social, every page arrives as the same house card, with the brand in its title too
  // (James, 13 Nov 2026).
  const card = image ? { url: shareCard(title, image.url), width: 1200, height: 630, alt: image.alt } : null;
  const shareTitle = `${shareWords(title).head} | ${SITE.name}`;
  return {
    // Long titles drop the brand suffix so the keywords, not the brand, survive Google's cut.
    title: title.length + SUFFIX > MAX_TITLE ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type,
      url,
      siteName: SITE.name,
      title: shareTitle,
      description,
      locale: SITE.locale,
      ...(card ? { images: [card] } : {}),
    },
    twitter: {
      card: card ? "summary_large_image" : "summary",
      title: shareTitle,
      description,
      ...(card ? { images: [card.url] } : {}),
    },
  };
}
