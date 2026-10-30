import { NextResponse } from "next/server";
import { ADVISORS } from "@/lib/content/advisors";
import { advisorFeed } from "@/lib/advisors/feed";

// GET /api/v1/advisors/[slug] — one advisor's Desk for Iggi (Contract C3).
export const dynamic = "force-static";
export const revalidate = 3600;

export function generateStaticParams() {
  return ADVISORS.filter((a) => a.desk).map((a) => ({ slug: a.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = ADVISORS.find((x) => x.slug === slug);
  const feed = a ? advisorFeed(a) : null;
  if (!feed) return NextResponse.json({ ok: false, error: "No advisor with that slug has a Desk" }, { status: 404 });
  return NextResponse.json({ ok: true, advisor: feed }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", "Access-Control-Allow-Origin": "*" } });
}
