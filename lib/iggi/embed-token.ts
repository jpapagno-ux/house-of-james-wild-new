// Iggi embed token — Shared Ecosystem Architecture Contract V1.0, clause C3.
//
// The host page asks this site for a short-lived token before it loads the Iggi
// iframe; the iframe forwards the token to every Iggi Core function call, and the
// Core refuses calls without a valid one once EMBED_TOKEN_SECRET is set there.
// Format: `${origin}.${exp}.${hex(hmacSHA256(secret, `${origin}|${exp}`))}` —
// the same bytes the Core verifies in base44/shared/embedSecurity.ts.
//
// The secret never reaches the browser: the token is minted server-side here.

import { createHmac, timingSafeEqual } from "node:crypto";

/** Hosts allowed to embed Iggi (Contract C3). Keep in step with the Core's ALLOWED_ORIGINS. */
export const IGGI_EMBED_HOSTS = [
  "https://jameswildco.com",
  "https://www.jameswildco.com",
  "https://house-of-james-wild-new.vercel.app",
  "https://wildcosafaris.com",
  "https://www.wildcosafaris.com",
] as const;

export const IGGI_TOKEN_TTL_SECONDS = 15 * 60;

export function isApprovedEmbedHost(origin: string | null | undefined): boolean {
  if (!origin) return false;
  return (IGGI_EMBED_HOSTS as readonly string[]).includes(origin.toLowerCase());
}

export function signEmbedToken(origin: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)): string {
  const o = origin.toLowerCase();
  const exp = nowSeconds + IGGI_TOKEN_TTL_SECONDS;
  const sig = createHmac("sha256", secret).update(`${o}|${exp}`).digest("hex");
  return `${o}.${exp}.${sig}`;
}

/** Mirror of the Core's check, used by the tests so both sides agree byte for byte. */
export function verifyEmbedToken(token: string, origin: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)): { ok: boolean; reason: string } {
  // The origin itself contains dots, so split from the right: origin . exp . sig
  const last = token.lastIndexOf("."), mid = token.lastIndexOf(".", last - 1);
  if (last < 0 || mid < 0) return { ok: false, reason: "malformed embed token" };
  const tokenOrigin = token.slice(0, mid), expStr = token.slice(mid + 1, last), sig = token.slice(last + 1);
  if (tokenOrigin !== origin.toLowerCase()) return { ok: false, reason: "token origin mismatch" };
  const exp = Number(expStr);
  if (!exp || exp < nowSeconds) return { ok: false, reason: "embed token expired" };
  const expected = createHmac("sha256", secret).update(`${tokenOrigin}|${expStr}`).digest("hex");
  if (expected.length !== sig.length) return { ok: false, reason: "bad embed token signature" };
  const ok = timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  return ok ? { ok: true, reason: "verified" } : { ok: false, reason: "bad embed token signature" };
}
