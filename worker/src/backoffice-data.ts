import type { Env } from "./types";
import { SupabaseStorageError } from "./supabase";

function config(env: Env) {
  const baseUrl = env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = env.SUPABASE_SECRET_KEY?.trim();
  if (!baseUrl || !key) throw new SupabaseStorageError("Supabase is not configured.");
  return { baseUrl, key };
}

function requestHeaders(key: string, prefer = "return=representation") { return { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer }; }
async function body(response: Response): Promise<unknown> { return response.json().catch(() => null); }

export async function supabaseQuery(env: Env, table: string, query: string, init: RequestInit = {}): Promise<unknown> {
  const { baseUrl, key } = config(env);
  const response = await fetch(`${baseUrl}/rest/v1/${table}${query}`, {
    ...init,
    headers: { ...requestHeaders(key, init.method === "PATCH" ? "return=representation" : "return=representation"), ...(init.headers ?? {}) },
  });
  const responseBody = await body(response);
  if (!response.ok) {
    console.error(JSON.stringify({ event: "supabase_admin_error", table, status: response.status }));
    throw new SupabaseStorageError();
  }
  return responseBody;
}

export async function updateRow(env: Env, table: string, id: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const result = await supabaseQuery(env, table, `?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) });
  return Array.isArray(result) && result[0] && typeof result[0] === "object" ? result[0] as Record<string, unknown> : {};
}

export function encodeFilter(value: string): string { return encodeURIComponent(value.replace(/[(),]/g, "")); }
