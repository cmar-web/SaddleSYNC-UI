// src/lib/auth.js
const KEY_USER = "ss_current_user";
const KEY_TOKEN = "ss_auth_token";
export const AUTH_EVENT = "auth:changed";

export function setSession({ user, token }) {
  try {
    if (user) localStorage.setItem(KEY_USER, JSON.stringify(user));
    if (token) localStorage.setItem(KEY_TOKEN, token);
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {}
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getAuthToken() {
  try { return localStorage.getItem(KEY_TOKEN) || null; } catch { return null; }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY_USER);
    localStorage.removeItem(KEY_TOKEN);
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {}
}
