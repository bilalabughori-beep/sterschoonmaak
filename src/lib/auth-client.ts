"use client";

import { createClient, type Session as SupabaseSession, type User } from "@supabase/supabase-js";
import { supabasePublicConfig } from "@/config/supabase-public";

export type Role = "client_admin" | "site_owner";
export type AuthUser = { id: string; email?: string; app_metadata?: { role?: unknown }; user_metadata?: { display_name?: string } };
export type Session = { access_token: string; refresh_token: string; expires_at: number; user: AuthUser };

const storageKey = "ster-schoonmaak-backoffice-session";
const AUTH_OPERATION_TIMEOUT_MS = 7000;
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? supabasePublicConfig.url).replace(/\/$/, "");
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? supabasePublicConfig.publishableKey;
let client: ReturnType<typeof createClient> | null = null;
let callbackPromise: Promise<Session | null> | null = null;

function getClient() {
  if (!client) {
    if (!supabaseUrl || !publishableKey) throw new Error("Supabase Auth is not configured.");
    client = createClient(supabaseUrl, publishableKey, { auth: { autoRefreshToken: true, detectSessionInUrl: false, flowType: "pkce", persistSession: true } });
  }
  return client;
}

function readSession(): Session | null { try { const raw = window.localStorage.getItem(storageKey); return raw ? JSON.parse(raw) as Session : null; } catch { return null; } }
function writeSession(session: Session | null) { try { if (session) window.localStorage.setItem(storageKey, JSON.stringify(session)); else window.localStorage.removeItem(storageKey); } catch { /* storage can be disabled */ } }
function isRole(value: unknown): value is Role { return value === "client_admin" || value === "site_owner"; }
function toAuthUser(user: User): AuthUser { return { id: user.id, email: user.email, app_metadata: user.app_metadata as AuthUser["app_metadata"], user_metadata: user.user_metadata as AuthUser["user_metadata"] }; }
function toSession(session: SupabaseSession, user = session.user): Session { return { access_token: session.access_token, refresh_token: session.refresh_token, expires_at: (session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in) * 1000, user: toAuthUser(user) }; }
function withTimeout<T>(operation: Promise<T>, message: string): Promise<T> { return new Promise((resolve, reject) => { const timer = window.setTimeout(() => reject(new Error(message)), AUTH_OPERATION_TIMEOUT_MS); operation.then((value) => { window.clearTimeout(timer); resolve(value); }, (error) => { window.clearTimeout(timer); reject(error); }); }); }

function authMessage(value: unknown, fallback = "Authentication failed."): string {
  const message = value instanceof Error ? value.message : String(value ?? "");
  if (/rate limit|too many|email.*limit|limit.*email/i.test(message)) return "We’ve sent several authentication emails recently. Please wait a while before requesting another one.";
  if (/invalid login credentials/i.test(message)) return "The email or password is incorrect.";
  if (/email not confirmed/i.test(message)) return "Please open the invitation or confirmation email before signing in.";
  return message || fallback;
}

export function friendlyAuthError(value: unknown, fallback = "Authentication failed.") { const message = authMessage(value); return message === "Authentication failed." ? fallback : message; }

async function currentSession(): Promise<Session | null> {
  const auth = getClient().auth;
  const { data, error } = await withTimeout(auth.getSession(), "Secure session initialization timed out.");
  if (error || !data.session) { writeSession(null); return null; }
  const userResponse = await withTimeout(auth.getUser(), "Secure user verification timed out.");
  if (userResponse.error || !userResponse.data.user) { writeSession(null); return null; }
  const session = toSession(data.session, userResponse.data.user);
  writeSession(session);
  return session;
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await getClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error || !data.session) throw new Error(authMessage(error));
  const session = await currentSession();
  if (!session) throw new Error("Supabase returned an incomplete session.");
  return session;
}

export async function refreshSession(): Promise<Session | null> { try { return await currentSession(); } catch { writeSession(null); return null; } }
export async function signOut() { try { await getClient().auth.signOut(); } finally { writeSession(null); } }

export function resetRedirect(role: Role) {
  if (typeof window === "undefined") return `https://sterschoonmaak.be/${role === "site_owner" ? "owner" : "backoffice"}/reset`;
  const hostname = window.location.hostname.toLowerCase();
  const origin = hostname === "www.sterschoonmaak.be" ? "https://sterschoonmaak.be" : window.location.origin;
  return `${origin}/${role === "site_owner" ? "owner" : "backoffice"}/reset`;
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const { error } = await getClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) throw new Error(authMessage(error));
}

export async function updatePassword(password: string) {
  const { data, error } = await getClient().auth.updateUser({ password });
  if (error || !data.user) throw new Error(authMessage(error, "Your password could not be updated."));
  const session = await currentSession();
  if (!session) throw new Error("Your password was updated, but the session could not be restored.");
  return session;
}

function authParams(url: URL) {
  const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));
  return { accessToken: fragment.get("access_token") ?? url.searchParams.get("access_token"), refreshToken: fragment.get("refresh_token") ?? url.searchParams.get("refresh_token"), code: url.searchParams.get("code"), tokenHash: url.searchParams.get("token_hash"), type: url.searchParams.get("type") ?? fragment.get("type"), error: url.searchParams.get("error") ?? fragment.get("error"), errorDescription: url.searchParams.get("error_description") ?? fragment.get("error_description") };
}

export function hasAuthCallbackUrl() {
  if (typeof window === "undefined") return false;
  const params = authParams(new URL(window.location.href));
  return Boolean(params.accessToken || params.refreshToken || params.code || params.tokenHash || params.error || params.errorDescription);
}

function cleanAuthUrl() {
  try {
    const url = new URL(window.location.href);
    ["code", "token_hash", "type", "error", "error_description", "error_code", "access_token", "refresh_token", "expires_at", "expires_in", "token_type", "provider_token", "provider_refresh_token"].forEach((name) => url.searchParams.delete(name));
    url.hash = "";
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
  } catch {
    // URL cleanup must never prevent the reset page from resolving.
  }
}

export async function consumeAuthCallback(): Promise<Session | null> {
  if (typeof window === "undefined") return null;
  if (callbackPromise) return callbackPromise;
  if (!hasAuthCallbackUrl()) return currentSession();
  callbackPromise = (async () => {
    const url = new URL(window.location.href);
    const params = authParams(url);
    try {
      const auth = getClient().auth;
      if (params.error || params.errorDescription) throw new Error(params.errorDescription ?? params.error ?? "The authentication link is no longer valid.");
      if (params.code) {
        const { error } = await withTimeout(auth.exchangeCodeForSession(params.code), "Secure callback initialization timed out.");
        if (error) throw error;
      } else if (params.tokenHash) {
        const { error } = await withTimeout(auth.verifyOtp({ token_hash: params.tokenHash, type: (params.type ?? "recovery") as "invite" | "recovery" }), "Secure callback initialization timed out.");
        if (error) throw error;
      } else if (params.accessToken && params.refreshToken) {
        const { error } = await withTimeout(auth.setSession({ access_token: params.accessToken, refresh_token: params.refreshToken }), "Secure callback initialization timed out.");
        if (error) throw error;
      } else {
        throw new Error("The authentication link is incomplete.");
      }
      return await currentSession();
    } catch (error) {
      throw new Error(authMessage(error, "The authentication link is no longer valid."));
    } finally {
      cleanAuthUrl();
    }
  })();
  try { return await callbackPromise; } finally { callbackPromise = null; }
}

export function roleOf(session: Session | null): Role | null { const role = session?.user.app_metadata?.role; return isRole(role) ? role : null; }
export function getStoredSession() { return readSession(); }
export function workerApiUrl() { return process.env.NEXT_PUBLIC_BACKOFFICE_API_URL?.replace(/\/$/, "") ?? process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, "") ?? ""; }
