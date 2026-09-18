import type { Env, NormalizedLead, StoredLead } from "./types";

export class SupabaseStorageError extends Error {
  constructor(message = "Supabase storage failed.") {
    super(message);
    this.name = "SupabaseStorageError";
  }
}

function requireConfig(env: Env): { baseUrl: string; secretKey: string } {
  const baseUrl = env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const secretKey = env.SUPABASE_SECRET_KEY?.trim();
  if (!baseUrl || !/^https:\/\//i.test(baseUrl) || !secretKey) throw new SupabaseStorageError("Supabase is not configured.");
  return { baseUrl, secretKey };
}

function headers(secretKey: string, prefer?: string): HeadersInit {
  return {
    apikey: secretKey,
    "content-type": "application/json",
    ...(prefer ? { prefer } : {}),
  };
}

function toStoredLead(value: unknown): StoredLead | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" || typeof row.client_request_id !== "string" || typeof row.created_at !== "string" ||
    (row.locale !== "en-BE" && row.locale !== "nl-BE") || typeof row.service_id !== "string" ||
    typeof row.frequency !== "string" || typeof row.customer_name !== "string" || row.status !== "new"
  ) return null;
  return {
    id: row.id,
    clientRequestId: row.client_request_id,
    createdAt: row.created_at,
    locale: row.locale,
    serviceId: row.service_id as StoredLead["serviceId"],
    city: typeof row.city === "string" ? row.city : null,
    postalCode: typeof row.postal_code === "string" ? row.postal_code : null,
    frequency: row.frequency as StoredLead["frequency"],
    preferredTime: typeof row.preferred_time === "string" ? row.preferred_time : null,
    details: typeof row.details === "string" ? row.details : null,
    name: row.customer_name,
    sourcePath: typeof row.source_path === "string" ? row.source_path : null,
    status: "new",
  };
}

async function readJson(response: Response): Promise<unknown> {
  try { return await response.json(); } catch { return null; }
}

async function findLead(baseUrl: string, secretKey: string, clientRequestId: string): Promise<StoredLead | null> {
  const url = `${baseUrl}/rest/v1/website_chat_leads?select=*&client_request_id=eq.${encodeURIComponent(clientRequestId)}&limit=1`;
  let response: Response;
  try {
    response = await fetch(url, { headers: headers(secretKey) });
  } catch {
    throw new SupabaseStorageError();
  }
  if (!response.ok) throw new SupabaseStorageError();
  const body = await readJson(response);
  return Array.isArray(body) ? toStoredLead(body[0]) : null;
}

export async function createOrGetLead(env: Env, lead: NormalizedLead): Promise<{ lead: StoredLead; duplicate: boolean }> {
  const { baseUrl, secretKey } = requireConfig(env);
  const url = `${baseUrl}/rest/v1/website_chat_leads?on_conflict=client_request_id`;
  const payload = {
    client_request_id: lead.clientRequestId,
    locale: lead.locale,
    service_id: lead.serviceId,
    city: lead.city,
    postal_code: lead.postalCode,
    frequency: lead.frequency,
    preferred_time: lead.preferredTime,
    details: lead.details,
    customer_name: lead.name,
    source_path: lead.sourcePath,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: headers(secretKey, "resolution=ignore-duplicates,return=representation"),
      body: JSON.stringify(payload),
    });
  } catch {
    throw new SupabaseStorageError();
  }

  if (!response.ok && response.status !== 409) throw new SupabaseStorageError();
  const body = await readJson(response);
  const inserted = Array.isArray(body) ? toStoredLead(body[0]) : null;
  if (inserted) return { lead: inserted, duplicate: false };

  const existing = await findLead(baseUrl, secretKey, lead.clientRequestId);
  if (!existing) throw new SupabaseStorageError();
  return { lead: existing, duplicate: true };
}
