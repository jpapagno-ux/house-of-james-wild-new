// Browser-side calls to the Partner Desk API. Returns the stable envelope
// ({ data } or { error: { code, message } }) so forms can show the message as written.
export type ApiResult<T = unknown> = { ok: true; data: T } | { ok: false; code: string; message: string; field?: string };

export async function api<T = unknown>(method: "POST" | "PATCH" | "DELETE", url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const r = await fetch(url, { method, headers: body === undefined ? undefined : { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const j = await r.json().catch(() => null);
    if (r.ok && j && "data" in j) return { ok: true, data: j.data as T };
    return { ok: false, code: j?.error?.code ?? "server_error", message: j?.error?.message ?? "Something went wrong. Try again.", field: j?.error?.field };
  } catch {
    return { ok: false, code: "network", message: "No connection. Check your network and try again." };
  }
}
