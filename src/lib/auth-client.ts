"use client";

export type Role = "client_admin" | "site_owner";
export type AuthUser = { id: string; email?: string; app_metadata?: { role?: unknown }; user_metadata?: { display_name?: string } };
export type Session = { access_token: string; refresh_token: string; expires_at: number; user: AuthUser };

const storageKey = "ster-schoonmaak-backoffice-session";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function readSession(): Session | null {
  try { const raw = window.localStorage.getItem(storageKey); return raw ? JSON.parse(raw) as Session : null; } catch { return null; }
}
function writeSession(session: Session | null) { try { if (session) window.localStorage.setItem(storageKey, JSON.stringify(session)); else window.localStorage.removeItem(storageKey); } catch { /* storage can be disabled */ } }
function isRole(value: unknown): value is Role { return value === "client_admin" || value === "site_owner"; }

async function authRequest(path: string, init: RequestInit = {}) {
  if (!supabaseUrl || !anonKey) throw new Error("Supabase Auth is not configured.");
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, { ...init, headers: { apikey: anonKey, "content-type": "application/json", ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => null) as { error_description?: string; msg?: string; access_token?: string; refresh_token?: string; expires_in?: number; user?: AuthUser } | null;
  if (!response.ok) throw new Error(body?.error_description ?? body?.msg ?? "Authentication request failed.");
  return body;
}

function fromResponse(value: { access_token?: string; refresh_token?: string; expires_in?: number; user?: AuthUser } | null): Session {
  if (!value?.access_token || !value.refresh_token || !value.user) throw new Error("Supabase returned an incomplete session.");
  return { access_token: value.access_token, refresh_token: value.refresh_token, expires_at: Date.now() + (value.expires_in ?? 3600) * 1000, user: value.user };
}

export async function signIn(email: string, password: string): Promise<Session> {
  const result = await authRequest("token?grant_type=password", { method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
  const session = fromResponse(result); writeSession(session); return session;
}

export async function refreshSession(): Promise<Session | null> {
  const current = readSession(); if (!current) return null;
  if (current.expires_at > Date.now() + 60_000) return current;
  try { const result = await authRequest("token?grant_type=refresh_token", { method: "POST", body: JSON.stringify({ refresh_token: current.refresh_token }) }); const session = fromResponse(result); writeSession(session); return session; } catch { writeSession(null); return null; }
}

export async function signOut() {
  const session = readSession();
  if (session && supabaseUrl && anonKey) await fetch(`${supabaseUrl}/auth/v1/logout`, { method: "POST", headers: { apikey: anonKey, authorization: `Bearer ${session.access_token}` } }).catch(() => undefined);
  writeSession(null);
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  await authRequest("recover", { method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase(), redirect_to: redirectTo }) });
}

export async function updatePassword(password: string, accessToken?: string) {
  const token = accessToken ?? readSession()?.access_token;
  if (!token) throw new Error("Your reset link is no longer valid.");
  const result = await authRequest("user", { method: "PUT", headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ password }) });
  if (result?.user) { const current = readSession(); if (current) writeSession({ ...current, user: result.user }); }
}

export function roleOf(session: Session | null): Role | null { const role = session?.user.app_metadata?.role; return isRole(role) ? role : null; }
export function workerApiUrl() { return process.env.NEXT_PUBLIC_BACKOFFICE_API_URL?.replace(/\/$/, "") ?? process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, "") ?? ""; }
export function getStoredSession() { return readSession(); }
