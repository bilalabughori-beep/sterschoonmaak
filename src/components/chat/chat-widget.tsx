"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { chatApiUrl, sendChatRequest, sendLeadRequest } from "./chat-api";
import { currentSourcePath, getClientRequestId } from "./chat-session";
import type { ChatAction, ChatResponse, ChatState, LeadResponse, QuickReply } from "./chat-types";

type ChatMessage = { id: number; from: "assistant" | "user"; text: string };

const initialState: ChatState = {
  step: "service",
  leadDraft: {
    serviceId: null,
    city: null,
    postalCode: null,
    frequency: null,
    preferredTime: null,
    details: null,
    name: null,
  },
};

export function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChatState>(initialState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [leadResult, setLeadResult] = useState<LeadResponse | null>(null);
  const messageId = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientRequestIdRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const addMessage = (from: ChatMessage["from"], text: string) => {
    const current = messageId.current;
    messageId.current += 1;
    setMessages((previous) => [...previous, { id: current, from, text }]);
  };

  const openChat = () => {
    if (messages.length === 0) clientRequestIdRef.current = getClientRequestId(true);
    else if (!clientRequestIdRef.current) clientRequestIdRef.current = getClientRequestId();
    setOpen(true);
    if (messages.length === 0) {
      addMessage("assistant", t("welcome"));
      setQuickReplies(serviceQuickReplies(t));
    }
  };

  const handleResponse = (response: ChatResponse) => {
    setState(response.state);
    setQuickReplies(response.quickReplies);
    addMessage("assistant", response.reply);
  };

  const submitLead = async (lead: ChatState["leadDraft"]) => {
    const clientRequestId = clientRequestIdRef.current ?? getClientRequestId();
    clientRequestIdRef.current = clientRequestId;
    setLeadError(null);
    setLeadStatus("submitting");
    try {
      const result = await sendLeadRequest({ locale, clientRequestId, sourcePath: currentSourcePath(), lead });
      setLeadResult(result);
      setLeadStatus("success");
    } catch {
      setLeadStatus("error");
      setLeadError(t("leadSaveError"));
    }
  };

  const startNewRequest = () => {
    clientRequestIdRef.current = getClientRequestId(true);
    setState(initialState);
    setQuickReplies(serviceQuickReplies(t));
    setInput("");
    setError(null);
    setLeadError(null);
    setLeadResult(null);
    setLeadStatus("idle");
    setMessages([{ id: messageId.current++, from: "assistant", text: t("welcome") }]);
    setOpen(true);
  };

  const submit = async ({ message, action, displayText }: { message?: string; action?: ChatAction; displayText: string }) => {
    if (busy) return;
    setError(null);
    if (displayText) addMessage("user", displayText);
    setBusy(true);
    try {
      const response = await sendChatRequest({ locale, state, message, action });
      handleResponse(response);
      if (response.complete) await submitLead(response.leadDraft);
    } catch (caught) {
      const errorMessage = caught instanceof Error ? caught.message : t("genericError");
      setError(errorMessage.includes("NEXT_PUBLIC_CHAT_API_URL") ? t("missingApiUrl") : t("genericError"));
    } finally {
      setBusy(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (state.step === "service" && reply.action.type === "set_field" && reply.action.field === "details" && reply.action.value === "") {
      setQuickReplies([]);
      return;
    }
    void submit({ action: reply.action, displayText: reply.label });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || busy) return;

    const displayText = value;
    setInput("");
    if (state.step === "location") {
      void submit({ action: { type: "set_field", field: "location", value }, displayText });
    } else if (state.step === "frequency") {
      void submit({ message: value, displayText });
    } else if (state.step === "preferred_time") {
      void submit({ action: { type: "set_field", field: "preferred_time", value }, displayText });
    } else if (state.step === "details") {
      void submit({ action: { type: "set_field", field: "details", value }, displayText });
    } else if (state.step === "name") {
      void submit({ action: { type: "set_field", field: "name", value }, displayText });
    } else {
      void submit({ message: value, displayText });
    }
  };

  if (pathname === "/offerte") return null;

  return (
    <div className="fixed bottom-5 right-5 z-[55] sm:bottom-7 sm:right-7">
      {open ? (
        <section className="flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-navy/20" aria-label={t("panelLabel")}>
          <header className="flex items-center justify-between bg-navy px-5 py-4 text-white">
            <div>
              <p className="text-sm font-bold">{t("title")}</p>
              <p className="mt-0.5 text-xs text-white/70">{t("subtitle")}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label={t("close")}>
              <span aria-hidden="true" className="text-xl leading-none">×</span>
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted/50 px-4 py-4" aria-live="polite">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                  <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${message.from === "user" ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-border bg-white text-navy"}`}>
                    {message.text}
                  </p>
                </div>
              ))}
              {busy ? <p className="text-xs text-muted">{leadStatus === "submitting" ? t("saving") : t("thinking")}</p> : null}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {state.step === "confirm" && leadStatus === "idle" ? (
            <p className="border-t border-border bg-white px-4 py-2 text-xs leading-5 text-muted">
              {t("privacyNotice")} {" "}
              <a href={locale === "nl-BE" ? "/privacybeleid" : "/en/privacy-policy"} className="font-semibold text-primary underline">{t("privacyLink")}</a>
            </p>
          ) : null}

          {leadStatus === "success" && leadResult ? (
            <div className="space-y-2 border-t border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              <p className="font-semibold">{t("leadSaved", { reference: leadResult.reference })}</p>
              <a href={leadResult.whatsappUrl} target="_blank" rel="noreferrer" className="block rounded-xl bg-[#25D366] px-3 py-2.5 text-center font-bold text-white hover:bg-[#1faa54]">{t("continueWhatsApp")}</a>
              <button type="button" onClick={startNewRequest} className="w-full rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100">{t("startNew")}</button>
            </div>
          ) : null}

          {leadStatus === "error" ? (
            <div className="space-y-2 border-t border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900">
              <p>{leadError}</p>
              <button type="button" onClick={() => void submitLead(state.leadDraft)} className="rounded-xl border border-red-300 px-3 py-2 font-semibold hover:bg-red-100">{t("retrySave")}</button>
            </div>
          ) : null}

          {quickReplies.length > 0 && leadStatus !== "success" ? (
            <div className="max-h-36 overflow-y-auto border-t border-border bg-white px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button key={`${reply.label}-${index}`} type="button" onClick={() => handleQuickReply(reply)} disabled={busy} className="rounded-full border border-primary/30 bg-primary/5 px-3 py-2 text-left text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50">
                    {reply.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {error ? <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">{error}</p> : null}
          {!chatApiUrl && open ? <p className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">{t("missingApiUrl")}</p> : null}
          {leadStatus !== "success" ? (
            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border bg-white p-3">
              <label htmlFor="chat-message" className="sr-only">{t("inputLabel")}</label>
              <input id="chat-message" value={input} onChange={(event) => setInput(event.target.value)} disabled={busy} placeholder={t("inputPlaceholder")} className="min-w-0 flex-1 rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-navy outline-none placeholder:text-muted focus:border-primary" />
              <button type="submit" disabled={busy || !input.trim() || !chatApiUrl} className="rounded-xl bg-primary px-3.5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-50" aria-label={t("send")}>
                {t("send")}
              </button>
            </form>
          ) : null}
        </section>
      ) : (
        <button type="button" onClick={openChat} className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:bg-navy" aria-label={t("open")}>
          <span aria-hidden="true" className="text-lg">◌</span>
          {t("open")}
        </button>
      )}
    </div>
  );
}

function serviceQuickReplies(t: ReturnType<typeof useTranslations>): QuickReply[] {
  const visible = ["office", "commercial", "restaurant", "hotel", "school", "home"] as const;
  return [
    ...visible.map((id) => ({ label: t(`serviceLabels.${id}`), action: { type: "select_service", value: id } as const })),
    { label: t("otherService"), action: { type: "set_field", field: "details", value: "" } },
  ];
}
