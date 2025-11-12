import { getAuthToken, clearSession } from "./auth";

export async function api(path, opts = {}) {
  const headers = new Headers(opts.headers || {});

  
  if (!headers.has("Content-Type") && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // attach JWT bearer token
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const r = await fetch((import.meta.env.VITE_API_URL || "") + path, {
    ...opts,
    headers,
  });

  // auto-sign-out on 401
  if (r.status === 401) {
    clearSession();
  }

  const contentType = r.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!r.ok) {
    const msg = isJson ? (await r.json()).error || "Request failed" : await r.text();
    throw new Error(msg);
  }

  return isJson ? r.json() : r.text();
}
