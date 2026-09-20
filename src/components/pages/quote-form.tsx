"use client";

import { FormEvent, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { serviceRegistry } from "@/config/services";
import { toTelHref, toWhatsAppHref } from "@/lib/contact-links";
import { sendLeadRequest } from "@/components/chat/chat-api";
import { currentSourcePath, getClientRequestId } from "@/components/chat/chat-session";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

type FormState = { name: string; email: string; phone: string; serviceId: string; location: string; frequency: string; preferredTime: string; message: string };
const initialState: FormState = { name: "", email: "", phone: "", serviceId: "", location: "", frequency: "one_time", preferredTime: "", message: "" };

export function QuoteForm() {
  const t = useTranslations("quotePage");
  const servicesT = useTranslations("services");
  const locale = useLocale();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const phoneHref = toTelHref(siteConfig.contact.phone);
  const whatsappFallback = useMemo(() => toWhatsAppHref(siteConfig.contact.whatsapp, t("whatsappMessage")), [t]);

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  function validate() {
    if (!form.name.trim() || form.name.trim().length > 100) return t("validation.name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return t("validation.email");
    if (!/^[+0-9()[\]\s.-]{7,40}$/.test(form.phone.trim())) return t("validation.phone");
    if (!serviceRegistry.some((service) => service.id === form.serviceId)) return t("validation.service");
    if (!form.location.trim() || form.location.trim().length > 150) return t("validation.location");
    if (!form.message.trim() || form.message.trim().length > 600) return t("validation.message");
    return null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setBusy(true); setError(null);
    const location = form.location.trim();
    const postalCode = location.match(/\b\d{4}\b/)?.[0] ?? null;
    const city = location.replace(/\b\d{4}\b/, "").replace(/[|/,]+/g, " ").trim() || null;
    try {
      const result = await sendLeadRequest({
        locale,
        clientRequestId: getClientRequestId(true),
        sourcePath: currentSourcePath(),
        lead: {
          serviceId: form.serviceId as never,
          city,
          postalCode,
          frequency: form.frequency as never,
          preferredTime: form.preferredTime.trim() || null,
          details: form.message.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
      });
      setReference(result.reference);
      setWhatsappUrl(result.whatsappUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("submitError"));
    } finally { setBusy(false); }
  }

  if (reference) return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">{t("successEyebrow")}</p><h2 className="mt-3 text-2xl font-semibold">{t("successTitle")}</h2><p className="mt-3 text-base leading-7">{t("successDescription", { reference })}</p><div className="mt-6 flex flex-col gap-3 sm:flex-row">{whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 font-semibold text-white hover:bg-[#1faa54]">{t("continueWhatsApp")}</a> : null}<button type="button" onClick={() => { setReference(null); setWhatsappUrl(null); setForm(initialState); }} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-300 px-5 py-3 font-semibold hover:bg-emerald-100">{t("newRequest")}</button></div></div>;

  const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-navy outline-none transition-colors placeholder:text-muted focus:border-primary";
  return <form onSubmit={submit} className="space-y-5" noValidate><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-navy">{t("name")}<input required maxLength={100} value={form.name} onChange={(event) => update("name", event.target.value)} className={inputClass} autoComplete="name" /></label><label className="block text-sm font-semibold text-navy">{t("email")}<input required type="email" maxLength={320} value={form.email} onChange={(event) => update("email", event.target.value)} className={inputClass} autoComplete="email" /></label><label className="block text-sm font-semibold text-navy">{t("phone")}<input required type="tel" maxLength={40} value={form.phone} onChange={(event) => update("phone", event.target.value)} className={inputClass} autoComplete="tel" /></label><label className="block text-sm font-semibold text-navy">{t("service")}<select required value={form.serviceId} onChange={(event) => update("serviceId", event.target.value)} className={inputClass}><option value="">{t("servicePlaceholder")}</option>{serviceRegistry.map((service) => <option key={service.id} value={service.id}>{servicesT(`overview.items.${service.id}.title`)}</option>)}</select></label><label className="block text-sm font-semibold text-navy">{t("location")}<input required maxLength={150} value={form.location} onChange={(event) => update("location", event.target.value)} className={inputClass} placeholder={t("locationPlaceholder")} autoComplete="street-address" /></label><label className="block text-sm font-semibold text-navy">{t("frequency")}<select value={form.frequency} onChange={(event) => update("frequency", event.target.value)} className={inputClass}>{(["one_time", "daily", "several_per_week", "weekly", "recurring_custom", "not_sure"] as const).map((key) => <option key={key} value={key}>{t(`frequencies.${key}`)}</option>)}</select></label></div><label className="block text-sm font-semibold text-navy">{t("preferredTime")}<input maxLength={200} value={form.preferredTime} onChange={(event) => update("preferredTime", event.target.value)} className={inputClass} placeholder={t("preferredTimePlaceholder")} /></label><label className="block text-sm font-semibold text-navy">{t("message")}<textarea required maxLength={600} rows={5} value={form.message} onChange={(event) => update("message", event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base leading-7 text-navy outline-none transition-colors placeholder:text-muted focus:border-primary" placeholder={t("messagePlaceholder")} /></label>{error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">{error}</p> : null}<Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">{busy ? t("sending") : t("submit")}</Button><p className="text-sm leading-6 text-muted">{t("privacyNote")} <a href={whatsappFallback ?? undefined} className="font-semibold text-primary underline">{t("contactFallback")}</a>{phoneHref ? <> · <a href={phoneHref} className="font-semibold text-primary underline">{siteConfig.contact.phoneDisplay}</a></> : null}</p></form>;
}
