import type { BackofficeRole, Env } from "./types";
import { InputError } from "./validation";

export type AuthUser = { id: string; email?: string; email_confirmed_at?: string | null; app_metadata?: { role?: unknown }; user_metadata?: Record<string, unknown> };

export async function requireAuthenticatedUser(request: Request, env: Env): Promise<AuthUser & { email: string }> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) throw new InputError("Authentication required.", 401);
  const baseUrl = env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const anonOrServiceKey = env.SUPABASE_SECRET_KEY?.trim();
  if (!baseUrl || !anonOrServiceKey) throw new InputError("Authentication is not configured.", 503);

  const response = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: anonOrServiceKey, authorization },
  });
  if (!response.ok) throw new InputError("Your session is no longer valid.", 401);
  const user = (await response.json().catch(() => null)) as AuthUser | null;
  if (!user?.id || typeof user.email !== "string" || !user.email.trim() || !user.email_confirmed_at) throw new InputError("Your account does not have a verified email address.", 403);
  return { ...user, email: user.email.trim().toLowerCase() };
}

export async function requireRole(request: Request, env: Env, roles: BackofficeRole[]): Promise<AuthUser> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) throw new InputError("Authentication required.", 401);
  const baseUrl = env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const anonOrServiceKey = env.SUPABASE_SECRET_KEY?.trim();
  if (!baseUrl || !anonOrServiceKey) throw new InputError("Authentication is not configured.", 503);

  const response = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: anonOrServiceKey, authorization },
  });
  if (!response.ok) throw new InputError("Your session is no longer valid.", 401);
  const user = (await response.json().catch(() => null)) as AuthUser | null;
  const role = user?.app_metadata?.role;
  if (!user?.id || typeof role !== "string" || !roles.includes(role as BackofficeRole)) throw new InputError("You are not authorized for this area.", 403);
  return user;
}

export function publicUrl(value: string): string {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (/^https:\/\/[^\s]+$/i.test(value)) return value;
  throw new InputError("CTA URL must be a relative path or HTTPS URL.");
}

export function nullableText(value: unknown, max: number, field: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new InputError(`${field} is invalid.`);
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length > max) throw new InputError(`${field} is too long.`);
  return normalized || null;
}

export function requiredText(value: unknown, max: number, field: string): string {
  const result = nullableText(value, max, field);
  if (!result) throw new InputError(`${field} is required.`);
  return result;
}

export function isoDate(value: unknown, field: string): string | null {
  const result = nullableText(value, 40, field);
  if (!result) return null;
  if (!Number.isFinite(Date.parse(result))) throw new InputError(`${field} is invalid.`);
  return new Date(result).toISOString();
}

export function intValue(value: unknown, fallback: number, min: number, max: number, field: string): number {
  if (value === undefined || value === null || value === "") return fallback;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new InputError(`${field} is invalid.`);
  return number;
}
