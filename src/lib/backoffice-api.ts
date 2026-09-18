"use client";

import { getStoredSession, workerApiUrl } from "./auth-client";

async function call(path: string, init: RequestInit = {}) {
  const base = workerApiUrl(); if (!base) throw new Error("The backoffice API is not configured.");
  const session = getStoredSession();
  const response = await fetch(`${base}${path}`, { ...init, headers: { "content-type": "application/json", "x-site-locale": document.documentElement.lang || "nl-BE", ...(session ? { authorization: `Bearer ${session.access_token}` } : {}), ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => null) as { error?: string } | Record<string, unknown> | null;
  if (!response.ok) throw new Error(body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : "The request could not be completed.");
  return body;
}

export type Complaint = { id: string; reference: string; created_at: string; locale: string; customer_name: string; customer_email: string; customer_phone?: string | null; subject: string; message: string; source_path?: string | null; status: "new" | "in_progress" | "resolved" | "closed"; internal_notes?: string | null; email_status: "pending" | "sent" | "failed"; email_sent_at?: string | null; email_attempts: number; email_last_error?: string | null };
export type Offer = Record<string, unknown> & { id: string; status: "draft" | "published" | "archived"; enabled: boolean; internal_name: string; placement: string; priority: number };

export async function createComplaint(payload: Record<string, string>, locale: string, sourcePath: string) { const base = workerApiUrl(); const response = await fetch(`${base}/complaints?locale=${encodeURIComponent(locale)}&sourcePath=${encodeURIComponent(sourcePath)}`, { method: "POST", headers: { "content-type": "application/json", "x-site-locale": locale }, body: JSON.stringify(payload) }); const body = await response.json().catch(() => null) as { error?: string; reference?: string; emailStatus?: "pending" | "sent" | "failed" }; if (!response.ok) throw new Error(body?.error ?? "Complaint could not be submitted."); return body; }
export async function fetchComplaints(search = "", status = "") { const query = new URLSearchParams(); if (search) query.set("search", search); if (status) query.set("status", status); const body = await call(`/admin/complaints?${query}`) as { items: Complaint[] }; return body.items; }
export async function fetchComplaint(id: string) { return await call(`/admin/complaints/${id}`) as Complaint; }
export async function saveComplaint(id: string, payload: Record<string, unknown>) { return await call(`/admin/complaints/${id}`, { method: "PATCH", body: JSON.stringify(payload) }) as Complaint; }
export async function retryComplaint(id: string) { return await call(`/admin/complaints/${id}/retry-email`, { method: "POST", body: "{}" }) as Complaint; }
export async function fetchOffers() { return (await call("/admin/offers") as { items: Offer[] }).items; }
export async function createOffer(payload: Record<string, unknown>) { return await call("/admin/offers", { method: "POST", body: JSON.stringify(payload) }) as Offer; }
export async function saveOffer(id: string, payload: Record<string, unknown>) { return await call(`/admin/offers/${id}`, { method: "PATCH", body: JSON.stringify(payload) }) as Offer; }
export async function uploadOfferImage(file: File) { const base = workerApiUrl(); const session = getStoredSession(); const response = await fetch(`${base}/admin/offers/upload-image`, { method: "POST", headers: { authorization: `Bearer ${session?.access_token ?? ""}`, "content-type": file.type }, body: file }); const body = await response.json().catch(() => null) as { path?: string; error?: string }; if (!response.ok || !body.path) throw new Error(body.error ?? "Image upload failed."); return body.path; }
