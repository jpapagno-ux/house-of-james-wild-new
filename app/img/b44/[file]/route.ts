// /img/b44/[file]: serves Ledger images stored in the Base44 library with
// the right image Content-Type. Base44 returns AVIF files as
// application/octet-stream, which the Next.js image optimizer (and some
// browsers) refuse, so those photos showed as broken. Routing them through
// here fixes that; next/image then optimizes them like any local image.
// Cached at the edge for a year (files are content-addressed and never change).

const ORIGIN = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";
const TYPES: Record<string, string> = { avif: "image/avif", webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif" };

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  if (!/^[\w.%-]+$/.test(file) || !TYPES[ext]) return new Response("Not found", { status: 404 });
  const upstream = await fetch(`${ORIGIN}/${file}`, { next: { revalidate: 31536000 } });
  if (!upstream.ok) return new Response("Not found", { status: 404 });
  return new Response(upstream.body, {
    headers: { "Content-Type": TYPES[ext], "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" },
  });
}
