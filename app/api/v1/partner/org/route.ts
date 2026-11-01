import { cookies } from "next/headers";
import { ORG_COOKIE, withMember } from "@/lib/platform/membership";
import { error, jsonBody, ok } from "@/lib/platform/api";

// POST /api/v1/partner/org — { org: "<slug>" } chooses the organization in view.
// Only an organization the person may already open can be chosen.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  const body = (await jsonBody(req)) as { org?: unknown } | undefined;
  const slug = typeof body?.org === "string" ? body.org : "";
  const org = desk.orgs.find((o) => o.slug === slug);
  if (!org) return error("not_found", "Unknown organization", requestId);
  (await cookies()).set(ORG_COOKIE, slug, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 90 });
  return ok({ org: org.slug }, requestId);
});
