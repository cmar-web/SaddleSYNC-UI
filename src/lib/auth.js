// src/lib/auth.js

const KEY = "ss_current_user";
export const AUTH_EVENT = "auth:changed";

/** save the logged-in user and notify the app */
export function setCurrentUser(user) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {}
  // make current tab rerender listeners
  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {}
}

/** get the current user from storage or null if not logged in */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** clear current usr and notify app */
export function clearCurrentUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {}
}

/** headers with the dev auth user id if avail */
export function authHeaders(extra = {}) {
  const u = getCurrentUser();
  return u?.UserID ? { ...extra, "x-user-id": String(u.UserID) } : { ...extra };
}
