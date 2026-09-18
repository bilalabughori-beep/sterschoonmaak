import { corsHeaders, isAllowedOrigin, withCors } from "./cors";
import { processChat } from "./flow";
import { parseLeadRequest } from "./lead";
import { createOrGetLead, SupabaseStorageError } from "./supabase";
import type { ChatRequest, Env } from "./types";
import { InputError, parseRequest } from "./validation";
import { buildWhatsAppHandoff } from "./whatsapp";
import { createComplaint, complaintDetails, listComplaints, retryComplaintEmail, sendComplaintEmail, updateComplaint } from "./complaints";
import { createOffer, listOffers, publicOffers, updateOffer, uploadOfferImage } from "./offers";

const SERVICE_NAME = "ster-schoonmaak-chatbot";

function json(value: unknown, status = 200, request?: Request, env?: Env) {
  const response = new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8" } });
  return request && env ? withCors(response, request, env) : response;
}

async function requestJson(request: Request, maxBytes: number): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw new InputError("Request body is too large.", 413);
  const text = await request.text();
  if (text.length > maxBytes) throw new InputError("Request body is too large.", 413);
  try { return JSON.parse(text) as unknown; } catch { throw new InputError("Invalid JSON."); }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      if (!isAllowedOrigin(request, env)) return json({ error: "Origin not allowed." }, 403, request, env);
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") return json({ ok: true, service: SERVICE_NAME, phase: 3 }, 200, request, env);
    if (request.method === "GET" && url.pathname === "/version") return json({ service: SERVICE_NAME, phase: 3, model: "@cf/meta/llama-3.2-1b-instruct" }, 200, request, env);
    if (url.pathname === "/site/offers" && request.method === "GET") {
      if (!isAllowedOrigin(request, env)) return json({ error: "Origin not allowed." }, 403, request, env);
      try { return json(await publicOffers(request, env), 200, request, env); } catch (error) { return handleError(error, request, env); }
    }
    if (url.pathname === "/complaints" && request.method === "POST") {
      if (!isAllowedOrigin(request, env)) return json({ error: "Origin not allowed." }, 403, request, env);
      try {
        const complaint = await createComplaint(env, await requestJson(request, 16_000), url.searchParams.get("locale") ?? request.headers.get("x-site-locale") ?? "nl-BE", url.searchParams.get("sourcePath") ?? undefined);
        const email = await sendComplaintEmail(env, complaint);
        return json({ ok: true, reference: complaint.reference, createdAt: complaint.created_at, emailStatus: email.ok ? "sent" : "failed" }, 201, request, env);
      } catch (error) { return handleError(error, request, env); }
    }
    if (url.pathname.startsWith("/admin/")) {
      if (!isAllowedOrigin(request, env)) return json({ error: "Origin not allowed." }, 403, request, env);
      try {
        const segments = url.pathname.split("/").filter(Boolean);
        if (request.method === "GET" && segments[1] === "complaints" && !segments[2]) return json(await listComplaints(request, env), 200, request, env);
        if (request.method === "GET" && segments[1] === "complaints" && segments[2]) return json(await complaintDetails(request, env, segments[2]), 200, request, env);
        if (request.method === "PATCH" && segments[1] === "complaints" && segments[2]) return json(await updateComplaint(request, env, segments[2], await requestJson(request, 8_000)), 200, request, env);
        if (request.method === "POST" && segments[1] === "complaints" && segments[2] === "retry-email") return json(await retryComplaintEmail(request, env, segments[2]), 200, request, env);
        if (request.method === "GET" && segments[1] === "offers" && !segments[2]) return json(await listOffers(request, env), 200, request, env);
        if (request.method === "POST" && segments[1] === "offers" && !segments[2]) return json(await createOffer(request, env, await requestJson(request, 24_000)), 201, request, env);
        if (request.method === "PATCH" && segments[1] === "offers" && segments[2]) return json(await updateOffer(request, env, segments[2], await requestJson(request, 24_000)), 200, request, env);
        if (request.method === "POST" && segments[1] === "offers" && segments[2] === "upload-image") return json(await uploadOfferImage(request, env), 201, request, env);
        return json({ error: "Not found." }, 404, request, env);
      } catch (error) { return handleError(error, request, env); }
    }
    if (request.method === "POST" && url.pathname === "/lead") {
      if (!isAllowedOrigin(request, env)) return json({ error: "Origin not allowed." }, 403, request, env);
      try {
        const lead = parseLeadRequest(await requestJson(request, 16_000));
        const stored = await createOrGetLead(env, lead);
        const handoff = buildWhatsAppHandoff(stored.lead, env.WHATSAPP_TARGET_NUMBER);
        if (env.DEV_OBSERVABILITY === "true") console.log(JSON.stringify({ event: "lead_saved", reference: handoff.reference, duplicate: stored.duplicate, status: stored.lead.status }));
        return json({ ok: true, reference: handoff.reference, createdAt: stored.lead.createdAt, duplicate: stored.duplicate, whatsappUrl: handoff.url }, 200, request, env);
      } catch (error) {
        if (error instanceof InputError) return json({ error: error.message }, error.status, request, env);
        if (error instanceof SupabaseStorageError || error instanceof Error) {
          console.error(JSON.stringify({ event: "lead_save_failed", type: "storage_unavailable" }));
          return json({ error: "We could not save your request. Please try again." }, 503, request, env);
        }
        console.error(JSON.stringify({ event: "lead_save_failed", type: "unknown" }));
        return json({ error: "We could not save your request. Please try again." }, 503, request, env);
      }
    }
    if (request.method !== "POST" || url.pathname !== "/chat") return json({ error: "Not found." }, 404, request, env);
    if (!isAllowedOrigin(request, env)) return json({ error: "Origin not allowed." }, 403, request, env);
    try {
      const body = await requestJson(request, 16_000) as ChatRequest;
      const parsed = parseRequest(body);
      const result = await processChat(env, parsed.locale, parsed.state, parsed.message, parsed.action);
      if (env.DEV_OBSERVABILITY === "true") console.log(JSON.stringify({ event: "chat_request", step: result.step, aiUsed: result.aiUsed === true, aiCalls: result.aiUsed === true ? 1 : 0, complete: result.complete }));
      return json(result, 200, request, env);
    } catch (error) {
      if (error instanceof InputError || error instanceof SyntaxError) return json({ error: error instanceof Error ? error.message : "Invalid request." }, error instanceof InputError ? error.status : 400, request, env);
      console.error(JSON.stringify({ event: "chat_error", type: "request_failed" }));
      return json({ error: "The chat request could not be processed." }, 500, request, env);
    }
  },
};

function handleError(error: unknown, request: Request, env: Env): Response {
  if (error instanceof InputError) return json({ error: error.message }, error.status, request, env);
  console.error(JSON.stringify({ event: "backoffice_request_failed", type: "request_failed" }));
  return json({ error: "The request could not be processed." }, 503, request, env);
}

export default worker;
