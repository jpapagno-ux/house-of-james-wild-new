import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Calls from this repository's GitHub workflows (the publish run, D-18 A) carry a GitHub Actions
// OIDC token: short-lived, signed by GitHub, naming the repository and branch. No shared secret is
// stored anywhere; only a token minted for this repository's workflow, for this audience, passes.
export const SITE_REPO = "jpapagno-ux/house-of-james-wild-new";
export const PUBLISH_AUDIENCE = "jameswildco-publish-run";
const JWKS = createRemoteJWKSet(new URL("https://token.actions.githubusercontent.com/.well-known/jwks"));

export async function verifyWorkflow(req: Request, opts: { mainOnly: boolean }): Promise<{ ok: true; run: string; actor: string } | { ok: false; status: number; error: string }> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false, status: 401, error: "Missing token" };
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: "https://token.actions.githubusercontent.com", audience: PUBLISH_AUDIENCE });
    if (payload.repository !== SITE_REPO) return { ok: false, status: 403, error: "Wrong repository" };
    if (opts.mainOnly && payload.ref !== "refs/heads/main") return { ok: false, status: 403, error: `Only main may publish (got ${String(payload.ref ?? "no ref")})` };
    return { ok: true, run: `${String(payload.repository)}#${String(payload.run_id ?? "")}`, actor: String(payload.actor ?? "") };
  } catch (e) {
    return { ok: false, status: 401, error: `Invalid token: ${(e as Error).message}` };
  }
}
