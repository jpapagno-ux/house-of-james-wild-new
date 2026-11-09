"use client";

import Image, { getImageProps, type ImageLoaderProps } from "next/image";
import type { CSSProperties } from "react";

// <Pic>: the house opening's photographs straight from Cloudinary (James, 8 Nov 2026: "top quality images, resolutions and
// focal point"). Cloudinary serves each width the screen asks for at q_auto:best, never upscaling a smaller original
// (c_limit), and on phones swaps in a portrait cut with the subject found by Cloudinary's own focal detection (g_auto),
// so a landscape frame keeps its plane, ship or rock on a tall screen instead of the dead centre. A fixed-ratio frame
// (the 4:5 "why" photographs) is cut to that ratio around its subject at every width. Non-Cloudinary sources fall back
// to next/image as before.

const TX = /\/image\/upload\/([^/]+)\//;
const isCloudinary = (s: string) => s.includes("res.cloudinary.com") && TX.test(s);
const withTx = (src: string, t: string) => src.replace(TX, `/image/upload/${t}/`);
// a cap keeps the tallest phone cuts under Cloudinary's 25-megapixel limit (no phone asks for more)
const loader = (t: string, max = 4000) => ({ src, width }: ImageLoaderProps) => withTx(src, `${t},w_${Math.min(width, max)}`);

export default function Pic({ src, alt, sizes, priority = false, className = "", style, portrait, ratio, gravity }: {
  src: string; alt: string; sizes: string; priority?: boolean; className?: string; style?: CSSProperties;
  /** phones (under 768px): a portrait cut at this ratio, e.g. "9:16" */ portrait?: string;
  /** every width: a fixed cut at this ratio, e.g. "4:5" */ ratio?: string;
  /** the phone cut's gravity where automatic detection picks the wrong subject (east, south...) */ gravity?: string;
}) {
  if (!isCloudinary(src)) return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={85} className={className} style={style} />;
  const base = ratio ? `f_auto,q_auto:best,c_fill,g_auto,ar_${ratio}` : "f_auto,q_auto:best,c_limit";
  const common = { alt, fill: true, sizes, priority, src };
  const { props: wide } = getImageProps({ ...common, loader: loader(base) });
  // eslint-disable-next-line @next/next/no-img-element -- art-directed <picture> from getImageProps
  const img = <img {...wide} alt={alt} className={className} style={{ ...wide.style, ...style }} />;
  if (!portrait) return img;
  const { props: tall } = getImageProps({ ...common, loader: loader(`f_auto,q_auto:best,c_fill,g_${gravity ?? "auto"},ar_${portrait}`, 1600) });
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={tall.srcSet} sizes={tall.sizes} />
      {img}
    </picture>
  );
}
