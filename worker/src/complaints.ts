import { requireAuthenticatedUser, requireRole, nullableText, requiredText, type AuthUser } from "./admin";
import { supabaseQuery, updateRow } from "./backoffice-data";
import type { ComplaintStatus, Env } from "./types";
import { InputError, isRecord } from "./validation";

const statuses: ComplaintStatus[] = ["new", "in_progress", "resolved", "closed"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reference() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `SC-${new Date().getUTCFullYear()}-${Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("").slice(0, 6).toUpperCase()}`;
}

function complaintPayload(value: unknown, locale: string, sourcePath?: string, ownedEmail?: string, defaultName?: string) {
  if (!isRecord(value)) throw new InputError("Request body must be an object.");
  if (locale !== "nl-BE" && locale !== "en-BE") throw new InputError("Unsupported locale.");
  const email = (ownedEmail ?? requiredText(value.customerEmail, 254, "Email")).toLowerCase();
  if (!emailPattern.test(email)) throw new InputError("Email is invalid.");
  const path = nullableText(sourcePath ?? value.sourcePath, 300, "Source path");
  if (path && (!path.startsWith("/") || /[?#\\\u0000-\u001f]/.test(path))) throw new InputError("Source path is invalid.");
  const honeypot = nullableText(value.website, 100, "Website");
  if (honeypot) throw new InputError("Unable to submit this form.");
  return {
    reference: reference(), locale, customer_name: requiredText(value.customerName ?? defaultName, 100, "Name"), customer_email: email,
    customer_phone: nullableText(value.customerPhone, 50, "Phone"), subject: requiredText(value.subject, 200, "Subject"),
    message: requiredText(value.message, 3000, "Message"), source_path: path,
  };
}

export async function createComplaint(env: Env, value: unknown, locale: string, sourcePath?: string) {
  const payload = complaintPayload(value, locale, sourcePath);
  const result = await supabaseQuery(env, "complaints", "", { method: "POST", body: JSON.stringify(payload) });
  const row = Array.isArray(result) ? result[0] : null;
  if (!row || typeof row !== "object") throw new Error("Complaint was not stored.");
  return row as Record<string, unknown>;
}

const customerComplaintFields = "id,reference,created_at,subject,message,status,locale,email_status";
const staffReplyFields = "id,complaint_id,author_user_id,author_role,body,email_status,email_attempts,email_sent_at,email_last_error,resend_message_id,created_at";
const customerReplyFields = "id,body,email_status,created_at";

function exactEmailPattern(email: string) {
  return email.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function customerFilter(email: string) {
  return `customer_email=ilike.${encodeURIComponent(exactEmailPattern(email))}`;
}

function safeCustomerComplaint(row: unknown) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const value = row as Record<string, unknown>;
  return {
    id: value.id,
    reference: value.reference,
    created_at: value.created_at,
    subject: value.subject,
    message: value.message,
    status: value.status,
    locale: value.locale,
    email_status: value.email_status,
  };
}

function safeCustomerReply(row: unknown) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const value = row as Record<string, unknown>;
  return { id: value.id, body: value.body, email_status: value.email_status, created_at: value.created_at };
}

export async function listCustomerComplaints(request: Request, env: Env) {
  const user = await requireAuthenticatedUser(request, env);
  const rows = await supabaseQuery(env, "complaints", `?select=${customerComplaintFields}&${customerFilter(user.email)}&order=created_at.desc`);
  return { items: (Array.isArray(rows) ? rows : []).map(safeCustomerComplaint).filter(Boolean) };
}

export async function customerComplaintDetails(request: Request, env: Env, id: string) {
  const user = await requireAuthenticatedUser(request, env);
  const rows = await supabaseQuery(env, "complaints", `?select=${customerComplaintFields}&id=eq.${encodeURIComponent(id)}&${customerFilter(user.email)}&limit=1`);
  const complaint = Array.isArray(rows) ? safeCustomerComplaint(rows[0]) : null;
  if (!complaint) throw new InputError("Complaint not found.", 404);
  const replies = await supabaseQuery(env, "complaint_replies", `?select=${customerReplyFields}&complaint_id=eq.${encodeURIComponent(id)}&email_status=eq.sent&order=created_at.asc`);
  return { ...complaint, replies: (Array.isArray(replies) ? replies : []).map(safeCustomerReply).filter(Boolean) };
}

export async function createCustomerComplaint(request: Request, env: Env, value: unknown, locale: string, sourcePath?: string) {
  const user = await requireAuthenticatedUser(request, env);
  const payload = complaintPayload(value, locale, sourcePath, user.email, customerName(user));
  const result = await supabaseQuery(env, "complaints", "", { method: "POST", body: JSON.stringify(payload) });
  const row = Array.isArray(result) ? result[0] : null;
  if (!row || typeof row !== "object") throw new Error("Complaint was not stored.");
  const email = await sendComplaintEmail(env, row as Record<string, unknown>);
  return { ok: true, reference: String((row as Record<string, unknown>).reference ?? ""), createdAt: String((row as Record<string, unknown>).created_at ?? ""), status: String((row as Record<string, unknown>).status ?? "new"), emailStatus: email.ok ? "sent" : "failed" };
}

function customerName(user: AuthUser) {
  const metadata = user.user_metadata ?? {};
  const value = metadata.display_name ?? metadata.full_name ?? metadata.name;
  return typeof value === "string" ? value.trim() : "";
}

export async function listComplaints(request: Request, env: Env) {
  await requireRole(request, env, ["client_admin", "site_owner"]);
  const url = new URL(request.url); const search = url.searchParams.get("search")?.trim(); const status = url.searchParams.get("status");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1); const pageSize = 20;
  const filters = [`select=*`, `order=created_at.desc`, `limit=${pageSize}`, `offset=${(page - 1) * pageSize}`];
  if (status && statuses.includes(status as ComplaintStatus)) filters.push(`status=eq.${status}`);
  if (search) { const term = search.replace(/[(),]/g, "").slice(0, 80); filters.push(`or=(reference.ilike.*${encodeURIComponent(term)}*,customer_name.ilike.*${encodeURIComponent(term)}*,subject.ilike.*${encodeURIComponent(term)}*)`); }
  const rows = await supabaseQuery(env, "complaints", `?${filters.join("&")}`, { headers: { prefer: "count=exact" } });
  return { items: Array.isArray(rows) ? rows : [], page, pageSize };
}

export async function complaintDetails(request: Request, env: Env, id: string) {
  await requireRole(request, env, ["client_admin", "site_owner"]);
  const rows = await supabaseQuery(env, "complaints", `?id=eq.${encodeURIComponent(id)}&select=*`);
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) throw new InputError("Complaint not found.", 404);
  const replies = await supabaseQuery(env, "complaint_replies", `?select=${staffReplyFields}&complaint_id=eq.${encodeURIComponent(id)}&order=created_at.asc`);
  return { ...row, replies: Array.isArray(replies) ? replies : [] };
}

async function complaintForReply(env: Env, id: string) {
  const rows = await supabaseQuery(env, "complaints", `?select=id,reference,customer_name,customer_email,subject,locale&id=eq.${encodeURIComponent(id)}&limit=1`);
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row || typeof row !== "object") throw new InputError("Complaint not found.", 404);
  return row as Record<string, unknown>;
}

async function sendReplyEmail(env: Env, complaint: Record<string, unknown>, reply: Record<string, unknown>) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const destination = String(complaint.customer_email ?? "").trim();
  const attempts = Number(reply.email_attempts ?? 0) || 0;
  await updateRow(env, "complaint_replies", String(reply.id), { email_status: "pending", email_attempts: attempts + 1, email_last_error: null });
  if (!apiKey || !destination) {
    await updateRow(env, "complaint_replies", String(reply.id), { email_status: "failed", email_last_error: "Customer reply email is not configured." });
    return { ok: false };
  }
  const locale = complaint.locale === "en-BE" ? "en-BE" : "nl-BE";
  const isEnglish = locale === "en-BE";
  const name = escapeHtml(String(complaint.customer_name ?? ""));
  const referenceValue = String(complaint.reference ?? "");
  const referenceHtml = escapeHtml(referenceValue);
  const subjectValue = String(complaint.subject ?? "");
  const subjectHtml = escapeHtml(subjectValue);
  const bodyValue = String(reply.body ?? "");
  const bodyHtml = escapeHtml(bodyValue).replace(/\n/g, "<br>");
  const subject = isEnglish ? `Reply to your complaint – ${referenceValue}` : `Antwoord op uw klacht – ${referenceValue}`;
  const html = isEnglish
    ? `<p>Hello ${name},</p><p>We have replied to your complaint.</p><p><strong>Reference:</strong><br>${referenceHtml}<br><strong>Subject:</strong><br>${subjectHtml}</p><p>${bodyHtml}</p><p>Kind regards,<br>Ster Schoonmaak<br><a href="mailto:info@sterschoonmaak.be">info@sterschoonmaak.be</a></p>`
    : `<p>Beste ${name},</p><p>We hebben geantwoord op uw klacht.</p><p><strong>Referentie:</strong><br>${referenceHtml}<br><strong>Onderwerp:</strong><br>${subjectHtml}</p><p>${bodyHtml}</p><p>Met vriendelijke groet,<br>Ster Schoonmaak<br><a href="mailto:info@sterschoonmaak.be">info@sterschoonmaak.be</a></p>`;
  const text = isEnglish
    ? `Hello ${String(complaint.customer_name ?? "")},\n\nWe have replied to your complaint.\n\nReference: ${referenceValue}\nSubject: ${subjectValue}\n\n${bodyValue}\n\nKind regards,\nSter Schoonmaak\ninfo@sterschoonmaak.be`
    : `Beste ${String(complaint.customer_name ?? "")},\n\nWe hebben geantwoord op uw klacht.\n\nReferentie: ${referenceValue}\nOnderwerp: ${subjectValue}\n\n${bodyValue}\n\nMet vriendelijke groet,\nSter Schoonmaak\ninfo@sterschoonmaak.be`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ from: env.COMPLAINT_EMAIL_FROM?.trim() || "Ster Schoonmaak <info@sterschoonmaak.be>", to: [destination], reply_to: env.COMPLAINT_EMAIL_REPLY_TO?.trim() || "info@sterschoonmaak.be", subject, html, text }) });
  const providerBody = await response.json().catch(() => null) as { id?: unknown } | null;
  if (!response.ok) { await updateRow(env, "complaint_replies", String(reply.id), { email_status: "failed", email_last_error: `Email provider returned ${response.status}.` }); return { ok: false }; }
  await updateRow(env, "complaint_replies", String(reply.id), { email_status: "sent", email_sent_at: new Date().toISOString(), email_last_error: null, resend_message_id: typeof providerBody?.id === "string" ? providerBody.id : null });
  return { ok: true };
}

export async function createComplaintReply(request: Request, env: Env, complaintId: string, value: unknown) {
  const user = await requireRole(request, env, ["client_admin", "site_owner"]);
  if (!isRecord(value)) throw new InputError("Request body must be an object.");
  const body = requiredText(value.body, 5000, "Reply");
  const complaint = await complaintForReply(env, complaintId);
  const result = await supabaseQuery(env, "complaint_replies", "", { method: "POST", body: JSON.stringify({ complaint_id: complaintId, author_user_id: user.id, author_role: user.app_metadata?.role, body }) });
  const reply = Array.isArray(result) ? result[0] : null;
  if (!reply || typeof reply !== "object") throw new Error("Reply was not stored.");
  await sendReplyEmail(env, complaint, reply as Record<string, unknown>);
  const rows = await supabaseQuery(env, "complaint_replies", `?select=${staffReplyFields}&id=eq.${encodeURIComponent(String((reply as Record<string, unknown>).id))}&limit=1`);
  return Array.isArray(rows) ? rows[0] : reply;
}

export async function retryComplaintReply(request: Request, env: Env, complaintId: string, replyId: string) {
  await requireRole(request, env, ["client_admin", "site_owner"]);
  const complaint = await complaintForReply(env, complaintId);
  const rows = await supabaseQuery(env, "complaint_replies", `?select=${staffReplyFields}&id=eq.${encodeURIComponent(replyId)}&complaint_id=eq.${encodeURIComponent(complaintId)}&limit=1`);
  const reply = Array.isArray(rows) ? rows[0] : null;
  if (!reply || typeof reply !== "object") throw new InputError("Reply not found.", 404);
  await sendReplyEmail(env, complaint, reply as Record<string, unknown>);
  const updated = await supabaseQuery(env, "complaint_replies", `?select=${staffReplyFields}&id=eq.${encodeURIComponent(replyId)}&limit=1`);
  return Array.isArray(updated) ? updated[0] : reply;
}

export async function updateComplaint(request: Request, env: Env, id: string, value: unknown) {
  const user = await requireRole(request, env, ["client_admin", "site_owner"]);
  if (!isRecord(value)) throw new InputError("Request body must be an object.");
  const status = value.status === undefined ? undefined : value.status;
  if (status !== undefined && (typeof status !== "string" || !statuses.includes(status as ComplaintStatus))) throw new InputError("Status is invalid.");
  const notes = value.internalNotes === undefined ? undefined : nullableText(value.internalNotes, 3000, "Internal notes");
  if (status === undefined && value.internalNotes === undefined) throw new InputError("Nothing to update.");
  const payload: Record<string, unknown> = { updated_by: user.id };
  if (status !== undefined) { payload.status = status; payload.resolved_at = status === "resolved" || status === "closed" ? new Date().toISOString() : null; }
  if (value.internalNotes !== undefined) payload.internal_notes = notes;
  return updateRow(env, "complaints", id, payload);
}

export async function retryComplaintEmail(request: Request, env: Env, id: string) {
  const user = await requireRole(request, env, ["client_admin", "site_owner"]);
  const rows = await supabaseQuery(env, "complaints", `?id=eq.${encodeURIComponent(id)}&select=*`); const row = Array.isArray(rows) ? rows[0] as Record<string, unknown> : null;
  if (!row) throw new InputError("Complaint not found.", 404);
  await sendComplaintEmail(env, row, user.id);
  return complaintDetails(request, env, id);
}

export async function sendComplaintEmail(env: Env, row: Record<string, unknown>, updatedBy?: string) {
  const currentAttempts = Number(row.email_attempts ?? 0) || 0;
  await updateRow(env, "complaints", String(row.id), { email_status: "pending", email_attempts: currentAttempts + 1, email_last_error: null, ...(updatedBy ? { updated_by: updatedBy } : {}) });
  const apiKey = env.RESEND_API_KEY?.trim(); const destination = String(row.customer_email ?? "").trim();
  if (!apiKey || !destination) { await updateRow(env, "complaints", String(row.id), { email_status: "failed", email_last_error: "Customer confirmation email is not configured." }); return { ok: false }; }
  const locale = row.locale === "en-BE" ? "en-BE" : "nl-BE";
  const name = escapeHtml(String(row.customer_name ?? ""));
  const subjectLine = escapeHtml(String(row.subject ?? ""));
  const complaintReference = escapeHtml(String(row.reference ?? ""));
  const isEnglish = locale === "en-BE";
  const subject = isEnglish ? `We received your complaint – ${String(row.reference)}` : `We hebben uw klacht ontvangen – ${String(row.reference)}`;
  const html = isEnglish
    ? `<p>Hello ${name},</p><p>We have received and registered your complaint.</p><p><strong>Reference:</strong><br>${complaintReference}</p><p><strong>Subject:</strong><br>${subjectLine}</p><p>Ster Schoonmaak will review your complaint.</p><p>Please keep your reference number if you contact us about this complaint.</p><p>Kind regards,<br>Ster Schoonmaak<br><a href="mailto:info@sterschoonmaak.be">info@sterschoonmaak.be</a></p>`
    : `<p>Beste ${name},</p><p>We hebben uw klacht ontvangen en geregistreerd.</p><p><strong>Referentie:</strong><br>${complaintReference}</p><p><strong>Onderwerp:</strong><br>${subjectLine}</p><p>Ster Schoonmaak zal uw klacht bekijken.</p><p>Bewaar uw referentienummer als u later contact met ons opneemt.</p><p>Met vriendelijke groet,<br>Ster Schoonmaak<br><a href="mailto:info@sterschoonmaak.be">info@sterschoonmaak.be</a></p>`;
  const text = isEnglish
    ? `Hello ${String(row.customer_name ?? "")},\n\nWe have received and registered your complaint.\n\nReference: ${String(row.reference)}\nSubject: ${String(row.subject ?? "")}\n\nSter Schoonmaak will review your complaint. Please keep your reference number if you contact us about this complaint.\n\nKind regards,\nSter Schoonmaak\ninfo@sterschoonmaak.be`
    : `Beste ${String(row.customer_name ?? "")},\n\nWe hebben uw klacht ontvangen en geregistreerd.\n\nReferentie: ${String(row.reference)}\nOnderwerp: ${String(row.subject ?? "")}\n\nSter Schoonmaak zal uw klacht bekijken.\n\nBewaar uw referentienummer als u later contact met ons opneemt.\n\nMet vriendelijke groet,\nSter Schoonmaak\ninfo@sterschoonmaak.be`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ from: env.COMPLAINT_EMAIL_FROM?.trim() || "Ster Schoonmaak <info@sterschoonmaak.be>", to: [destination], reply_to: env.COMPLAINT_EMAIL_REPLY_TO?.trim() || "info@sterschoonmaak.be", subject, html, text }) });
  if (!response.ok) { await updateRow(env, "complaints", String(row.id), { email_status: "failed", email_last_error: `Email provider returned ${response.status}.` }); return { ok: false }; }
  await updateRow(env, "complaints", String(row.id), { email_status: "sent", email_sent_at: new Date().toISOString(), email_last_error: null });
  return { ok: true };
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character); }
