"use client";

// Tiny fetch wrapper for /api/v1: same-origin, JSON, stable error codes.
export type ApiResult<T> = { ok: true; data: T } | { ok: false; code: string; message: string };

export async function api<T = unknown>(path: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "GET", body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json.data as T };
    return { ok: false, code: json.error?.code ?? "server_error", message: json.error?.message ?? "Something went wrong" };
  } catch {
    return { ok: false, code: "network", message: "Couldn't reach the house. Check your connection and try again." };
  }
}
