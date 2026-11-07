import "server-only";

// Ask Vercel to rebuild the site (the project's Deploy Hook), so a change the house approved reaches the
// static pages within minutes instead of at the daily rebuild. Off until VERCEL_DEPLOY_HOOK is set; never
// throws: the approval stands either way, and the daily rebuild picks it up.
export async function requestRebuild(reason: string): Promise<"requested" | "skipped" | "failed"> {
  const hook = process.env.VERCEL_DEPLOY_HOOK;
  if (!hook || !/^https:\/\/api\.vercel\.com\//.test(hook)) return "skipped";
  try {
    const r = await fetch(hook, { method: "POST", signal: AbortSignal.timeout(5000) });
    if (!r.ok) { console.warn(`rebuild hook ${r.status} (${reason})`); return "failed"; }
    return "requested";
  } catch (e) {
    console.warn(`rebuild hook failed (${reason})`, e instanceof Error ? e.message : e);
    return "failed";
  }
}
