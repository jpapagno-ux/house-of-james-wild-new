import "server-only";
import { notFound, redirect } from "next/navigation";
import { FLAGS } from "./flags";
import { currentUser } from "./supabase/server";

// For /account pages: 404 while the flag is off; otherwise the signed-in
// traveler, or a redirect to sign-in that returns here afterwards.
export async function requireTraveler(returnTo: string) {
  if (!FLAGS.accounts) notFound();
  const { sb, user } = await currentUser();
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent(returnTo)}`);
  return { sb, user };
}

export const niceDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : null;
