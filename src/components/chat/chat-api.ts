import type { ChatAction, ChatResponse, ChatState, LeadResponse } from "./chat-types";

export const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, "") ?? "";

export async function sendChatRequest({
  locale,
  state,
  message,
  action,
}: {
  locale: string;
  state: ChatState;
  message?: string;
  action?: ChatAction;
}): Promise<ChatResponse> {
  if (!chatApiUrl) {
    throw new Error("NEXT_PUBLIC_CHAT_API_URL is not configured.");
  }

  const response = await fetch(`${chatApiUrl}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ locale, state, message, action }),
  });

  const body = (await response.json().catch(() => null)) as ChatResponse | { error?: string } | null;
  if (!response.ok) {
    throw new Error(body && "error" in body && body.error ? body.error : "Chat request failed.");
  }

  return body as ChatResponse;
}

export async function sendLeadRequest({
  locale,
  clientRequestId,
  sourcePath,
  lead,
}: {
  locale: string;
  clientRequestId: string;
  sourcePath: string;
  lead: ChatState["leadDraft"];
}): Promise<LeadResponse> {
  if (!chatApiUrl) throw new Error("NEXT_PUBLIC_CHAT_API_URL is not configured.");

  const response = await fetch(`${chatApiUrl}/lead`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      clientRequestId,
      locale,
      sourcePath,
      lead: {
        serviceId: lead.serviceId,
        city: lead.city,
        postalCode: lead.postalCode,
        frequency: lead.frequency,
        preferredTime: lead.preferredTime,
        details: lead.details,
        name: lead.name,
      },
    }),
  });

  const body = (await response.json().catch(() => null)) as LeadResponse | { error?: string } | null;
  if (!response.ok) {
    throw new Error(body && "error" in body && body.error ? body.error : "Lead submission failed.");
  }
  return body as LeadResponse;
}
