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

export function buildMetadata({ title, description: raw, path, image, type = "website", noindex }: PageMeta): Metadata {
  const url = absoluteUrl(path);
  const description = fitDescription(raw);
  const index = isIndexable && !noindex;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type,
      url,
      siteName: SITE.name,
      title,
      description,
      locale: SITE.locale,
      ...(image ? { images: [{ url: image.url, alt: image.alt }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}
