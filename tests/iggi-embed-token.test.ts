import { test } from "node:test";
import assert from "node:assert/strict";
import { signEmbedToken, verifyEmbedToken, isApprovedEmbedHost, IGGI_TOKEN_TTL_SECONDS } from "../lib/iggi/embed-token.ts";

const SECRET = "test-secret-not-for-production";
const ORIGIN = "https://www.jameswildco.com";

test("token round-trips and names its origin", () => {
  const token = signEmbedToken(ORIGIN, SECRET, 1_800_000_000);
  assert.ok(token.startsWith(`${ORIGIN}.${1_800_000_000 + IGGI_TOKEN_TTL_SECONDS}.`));
  assert.deepEqual(verifyEmbedToken(token, ORIGIN, SECRET, 1_800_000_000), { ok: true, reason: "verified" });
});

test("token is refused for another origin, after expiry, and with the wrong secret", () => {
  const token = signEmbedToken(ORIGIN, SECRET, 1_800_000_000);
  assert.equal(verifyEmbedToken(token, "https://evil.example", SECRET, 1_800_000_000).ok, false);
  assert.equal(verifyEmbedToken(token, ORIGIN, SECRET, 1_800_000_000 + IGGI_TOKEN_TTL_SECONDS + 1).ok, false);
  assert.equal(verifyEmbedToken(token, ORIGIN, "other-secret", 1_800_000_000).ok, false);
  assert.equal(verifyEmbedToken("not.a.real.token", ORIGIN, SECRET).ok, false);
});

test("only Contract C3 hosts may embed", () => {
  assert.equal(isApprovedEmbedHost("https://jameswildco.com"), true);
  assert.equal(isApprovedEmbedHost("https://WWW.jameswildco.com"), true);
  assert.equal(isApprovedEmbedHost("https://wildearthstays.com"), false);
  assert.equal(isApprovedEmbedHost(null), false);
});
