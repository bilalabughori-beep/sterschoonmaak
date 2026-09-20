"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { createOffer, fetchOffers, saveOffer, uploadOfferImage, type Offer } from "@/lib/backoffice-api";
import { useBackofficeLocale } from "@/lib/backoffice-i18n";
import { OfferPreview, OfferPreviewFrame, type OfferData } from "@/components/offers/offer-presentational";
import { type OfferDraft, type OfferErrors, toDateTimeLocal, toIso, validateOffer } from "./offer-validation";

const emptyDraft: OfferDraft = {
  id: "new", status: "draft", internalName: "", placement: "homepage_offer", priority: 0,
  startsAt: "", endsAt: "", badgeNl: "", badgeEn: "", titleNl: "", titleEn: "", subtitleNl: "", subtitleEn: "",
  descriptionNl: "", descriptionEn: "", oldPriceLabel: "", newPriceLabel: "", discountLabel: "", ctaLabelNl: "", ctaLabelEn: "", ctaUrl: "",
  imagePath: "", imageName: "", imageAltNl: "", imageAltEn: "", theme: "brand", layout: "banner", dismissible: true,
};

type Action = "save" | "publish" | "unpublish" | "archive";
type Translate = (key: string) => string;

export function OfferManager() {
  const { t, locale } = useBackofficeLocale();
  const [items, setItems] = useState<Offer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try { setItems(await fetchOffers()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : t("requestFailed")); }
    finally { setLoading(false); }
  };

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const timer = window.setTimeout(() => setNow(Date.now()), 0); return () => window.clearTimeout(timer); }, []);

  const selected = selectedId && selectedId !== "new" ? items.find((item) => item.id === selectedId) ?? null : null;
  const saveResult = (result: Offer, action: Action) => {
    setItems((current) => current.some((item) => item.id === result.id)
      ? current.map((item) => item.id === result.id ? { ...item, ...result } : item)
      : [result, ...current]);
    setSelectedId(action === "archive" ? null : result.id);
  };

  return <div className="max-w-[1440px]">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("websiteManagement")}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("offers")}</h1><p className="mt-3 max-w-2xl text-muted">{t("offersDescription")}</p></div>
      <button type="button" onClick={() => { setError(null); setSelectedId("new"); }} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-navy">{t("newOffer")}</button>
    </div>
    {error ? <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
    <div className="mt-8 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-border bg-surface p-3">
        <div className="flex items-center justify-between px-2 py-2"><h2 className="text-sm font-bold text-navy">{t("offers")}</h2><span className="text-xs text-muted">{items.length}</span></div>
        {loading ? <p className="p-4 text-sm text-muted">{t("loadingOffers")}</p> : items.length === 0 ? <p className="rounded-xl border border-dashed border-border p-5 text-sm leading-6 text-muted">{t("noOffers")}</p> : <div className="mt-2 space-y-2">{items.map((item) => <OfferListCard key={item.id} item={item} active={selectedId === item.id} locale={locale} now={now} t={t} onClick={() => { setError(null); setSelectedId(item.id); }} />)}</div>}
      </aside>
      <section className="min-w-0">{selectedId === "new" ? <OfferEditor key="new" initial={null} t={t} onSaved={saveResult} /> : selected ? <OfferEditor key={selected.id} initial={selected} t={t} onSaved={saveResult} /> : <EmptyEditor t={t} onNew={() => setSelectedId("new")} />}</section>
    </div>
  </div>;
}

function OfferListCard({ item, active, locale, now, t, onClick }: { item: Offer; active: boolean; locale: string; now: number | null; t: Translate; onClick: () => void }) {
  const scheduled = now !== null && item.status === "published" && item.starts_at && Date.parse(String(item.starts_at)) > now;
  const state = scheduled ? t("scheduled") : item.status === "published" ? t("publishedState") : item.status === "archived" ? t("archived") : t("draftState");
  return <button type="button" onClick={onClick} className={`w-full rounded-xl border p-4 text-start transition ${active ? "border-primary bg-[#eef4ff] shadow-sm" : "border-transparent hover:border-border hover:bg-surface-muted"}`}><div className="flex items-start justify-between gap-3"><span className="line-clamp-2 font-semibold text-navy">{item.internal_name}</span><span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">{state}</span></div><p className="mt-3 text-xs text-muted">{placementLabel(item.placement, t)} · {t("priority")} {item.priority}</p><p className="mt-2 text-xs text-muted">{t("lastUpdated")}: {formatDate(item.updated_at, locale)}</p></button>;
}

function OfferEditor({ initial, t, onSaved }: { initial: Offer | null; t: Translate; onSaved: (result: Offer, action: Action) => void }) {
  const [draft, setDraft] = useState<OfferDraft>(() => initial ? toDraft(initial) : { ...emptyDraft });
  const [contentLanguage, setContentLanguage] = useState<"nl" | "en">("nl");
  const [errors, setErrors] = useState<OfferErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<Action | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initial?.image_path ? String(initial.image_path) : "");
  const readOnly = draft.status === "archived";
  const persistedId = draft.id !== "new" ? draft.id : null;
  const set = <K extends keyof OfferDraft>(key: K, value: OfferDraft[K]) => setDraft((current) => ({ ...current, [key]: value, ...(key === "placement" && value === "top_banner" && current.layout === "split" ? { layout: "banner" as const } : {}) }));
  const layouts: OfferDraft["layout"][] = draft.placement === "top_banner" ? ["compact", "banner"] : ["compact", "banner", "split"];
  const language = contentLanguage === "nl" ? "nl" : "en";
  const languageValue = <K extends "badge" | "title" | "subtitle" | "description" | "ctaLabel" | "imageAlt">(key: K): string => String(draft[`${key}${language === "nl" ? "Nl" : "En"}` as keyof OfferDraft] ?? "");
  const setLanguageValue = <K extends "badge" | "title" | "subtitle" | "description" | "ctaLabel" | "imageAlt">(key: K, value: string) => set(`${key}${language === "nl" ? "Nl" : "En"}` as keyof OfferDraft, value as never);
  const messages = { required: t("requiredField"), publishRequired: (field: string) => `${field} ${t("requiredForPublishingSuffix")}`, invalidUrl: t("invalidCtaUrl"), invalidDates: t("invalidSchedule") };

  const save = async (action: Action) => {
    if (action === "archive" && !window.confirm(t("archiveConfirm"))) return;
    if (action === "unpublish" && !window.confirm(t("unpublishConfirm"))) return;
    if (action === "save" || action === "publish") {
      const nextErrors = validateOffer(draft, action, messages);
      if (action === "publish" && Object.keys(nextErrors).length) nextErrors.form = t("fixHighlighted");
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) { setNotice(null); return; }
    }
    setBusyAction(action); setNotice(null); setErrors({});
    try {
      const payload = action === "archive" || action === "unpublish" ? { action } : { ...draftToPayload(draft), action };
      const result = persistedId ? await saveOffer(persistedId, payload) : await createOffer(payload);
      const nextId = result.id || persistedId || "new";
      const nextDraft = { ...toDraft({ ...result, id: nextId } as Offer), imageName: draft.imageName };
      setDraft(nextDraft); setImagePreview(nextDraft.imagePath);
      setNotice(action === "publish" ? t("publishedNotice") : action === "archive" ? t("archivedNotice") : action === "unpublish" ? t("unpublishedNotice") : t("savedNotice"));
      onSaved(result, action);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t("saveFailed");
      setErrors(mapBackendError(message, t));
    } finally { setBusyAction(null); }
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setErrors({ form: t("imageTypeError") }); return; }
    if (file.size > 2_097_152) { setErrors({ form: t("imageSizeError") }); return; }
    setUploading(true); setErrors({}); set("imageName", file.name); setImagePreview(URL.createObjectURL(file));
    try { set("imagePath", await uploadOfferImage(file)); setNotice(t("imageUploaded")); }
    catch (caught) { setErrors({ form: caught instanceof Error ? caught.message : t("uploadFailed") }); setImagePreview(draft.imagePath); }
    finally { setUploading(false); }
  };

  const preview: OfferData = { id: draft.id, placement: draft.placement, badge: languageValue("badge"), title: languageValue("title"), subtitle: languageValue("subtitle"), description: languageValue("description"), oldPriceLabel: draft.oldPriceLabel, newPriceLabel: draft.newPriceLabel, discountLabel: draft.discountLabel, ctaLabel: languageValue("ctaLabel"), ctaUrl: draft.ctaUrl, imagePath: imagePreview || draft.imagePath, imageAlt: languageValue("imageAlt"), theme: draft.theme, layout: draft.layout, dismissible: draft.dismissible };
  return <article className="rounded-2xl border border-border bg-surface shadow-sm"><div className="border-b border-border px-5 py-5 sm:px-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-primary">{t("editor")}</p><h2 className="mt-2 text-2xl font-semibold text-navy">{draft.internalName || t("newOffer")}</h2><p className="mt-2 text-sm text-muted">{persistedId ? `${t("offerId")}: ${persistedId}` : t("draftNotSaved")}</p></div><span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold uppercase text-muted">{stateLabel(draft.status, t)}</span></div></div><div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(290px,0.9fr)]"><div className="space-y-5"><Section title={t("offerBasics")} description={t("basicsDescription")}><div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]"><Field label={t("internalName")} helper={t("internalNameHelp")} value={draft.internalName} onChange={(value) => set("internalName", value)} error={errors.internalName} disabled={readOnly} required /><SelectField label={t("placement")} value={draft.placement} onChange={(value) => set("placement", value as OfferDraft["placement"])} disabled={readOnly} options={[["top_banner", t("topBanner")], ["homepage_offer", t("homepageCard")], ["popup", t("popup")]]} /></div><Field label={t("priority")} type="number" value={String(draft.priority)} onChange={(value) => set("priority", Number(value) || 0)} disabled={readOnly} /></Section><Section title={t("offerContent")} description={t("contentDescription")}><div className="flex gap-2 rounded-xl bg-surface-muted p-1"><Tab active={contentLanguage === "nl"} onClick={() => setContentLanguage("nl")} label={t("dutch")} /><Tab active={contentLanguage === "en"} onClick={() => setContentLanguage("en")} label={t("english")} /></div><div className="mt-5 space-y-5"><Field label={t("badgeLabel")} value={languageValue("badge")} onChange={(value) => setLanguageValue("badge", value)} disabled={readOnly} /><Field label={t("titleLabel")} value={languageValue("title")} onChange={(value) => setLanguageValue("title", value)} error={language === "nl" ? errors.titleNl : errors.titleEn} helper={t("requiredForPublishing")} disabled={readOnly} /><Field label={t("subtitleLabel")} value={languageValue("subtitle")} onChange={(value) => setLanguageValue("subtitle", value)} disabled={readOnly} /><TextArea label={t("descriptionLabel")} value={languageValue("description")} onChange={(value) => setLanguageValue("description", value)} error={language === "nl" ? errors.descriptionNl : errors.descriptionEn} helper={t("requiredForPublishing")} disabled={readOnly} /><Field label={t("ctaLabelField")} value={languageValue("ctaLabel")} onChange={(value) => setLanguageValue("ctaLabel", value)} error={language === "nl" ? errors.ctaLabelNl : errors.ctaLabelEn} helper={t("requiredForPublishing")} disabled={readOnly} /><Field label={t("altTextField")} value={languageValue("imageAlt")} onChange={(value) => setLanguageValue("imageAlt", value)} disabled={readOnly} /></div></Section><Section title={t("pricingSection")} description={t("pricingDescription")}><div className="grid gap-5 sm:grid-cols-3"><Field label={t("oldPrice")} value={draft.oldPriceLabel} onChange={(value) => set("oldPriceLabel", value)} disabled={readOnly} /><Field label={t("newPrice")} value={draft.newPriceLabel} onChange={(value) => set("newPriceLabel", value)} disabled={readOnly} /><Field label={t("discountLabel")} value={draft.discountLabel} onChange={(value) => set("discountLabel", value)} disabled={readOnly} /></div></Section><Section title={t("ctaSection")} description={t("ctaDescription")}><div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]"><SelectField label={t("quickDestination")} value={quickValue(draft.ctaUrl, language)} onChange={(value) => set("ctaUrl", value)} disabled={readOnly} options={[["", t("customDestination")], [language === "nl" ? "/offerte" : "/en/quote", t("quoteDestination")], [language === "nl" ? "/contact" : "/en/contact", t("contactDestination")], [language === "nl" ? "/werkgebied" : "/en/service-area", t("areaDestination")]]} /><Field label={t("linkDestination")} helper={t("ctaHelper")} value={draft.ctaUrl} onChange={(value) => set("ctaUrl", value)} error={errors.ctaUrl} disabled={readOnly} dir="ltr" /></div></Section><Section title={t("mediaSection")} description={t("mediaDescription")}><label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b9c9dd] bg-surface px-5 py-8 text-center hover:border-primary"><span className="text-sm font-bold text-navy">{uploading ? t("uploading") : draft.imagePath ? t("replaceImage") : t("chooseImage")}</span><span className="mt-2 text-xs text-muted">{t("imageHelp")}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={readOnly || uploading} className="sr-only" /></label>{imagePreview || draft.imagePath ? <div className="mt-4 flex items-start gap-4 rounded-xl border border-border bg-surface p-3"><img src={imagePreview || draft.imagePath} alt="" className="h-24 w-32 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-navy">{draft.imageName || t("currentImage")}</p><button type="button" disabled={readOnly || uploading} onClick={() => { set("imagePath", ""); set("imageName", ""); setImagePreview(""); }} className="mt-3 text-sm font-bold text-red-700 underline">{t("removeImage")}</button></div></div> : null}</Section><Section title={t("appearanceSection")} description={t("appearanceDescription")}><p className="text-sm font-semibold text-navy">{t("theme")}</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{(["brand", "light", "dark", "accent"] as OfferDraft["theme"][]).map((theme) => <Choice key={theme} active={draft.theme === theme} onClick={() => set("theme", theme)} label={themeLabel(theme, t)} />)}</div><p className="mt-5 text-sm font-semibold text-navy">{t("layout")}</p><div className="mt-2 grid gap-2 sm:grid-cols-3">{layouts.map((layout) => <Choice key={layout} active={draft.layout === layout} onClick={() => set("layout", layout)} label={layoutLabel(layout, t)} />)}</div>{draft.placement !== "homepage_offer" ? <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-navy"><input type="checkbox" checked={draft.dismissible} onChange={(event) => set("dismissible", event.target.checked)} disabled={readOnly} className="size-5 accent-[var(--primary)]" />{t("dismissible")}</label> : null}</Section><Section title={t("scheduleSection")} description={t("scheduleDescription")}><div className="grid gap-5 sm:grid-cols-2"><Field label={t("starts")} type="datetime-local" value={draft.startsAt} onChange={(value) => set("startsAt", value)} error={errors.startsAt} disabled={readOnly} dir="ltr" /><Field label={t("ends")} type="datetime-local" value={draft.endsAt} onChange={(value) => set("endsAt", value)} error={errors.endsAt} disabled={readOnly} dir="ltr" /></div></Section></div><aside className="min-w-0 lg:sticky lg:top-5 lg:self-start"><OfferPreviewFrame><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">{t("preview")}</p><p className="mt-1 text-sm font-semibold text-navy">{t("previewDescription")}</p></div><div className="flex rounded-lg bg-surface-muted p-1"><Tab active={contentLanguage === "nl"} onClick={() => setContentLanguage("nl")} label="NL" /><Tab active={contentLanguage === "en"} onClick={() => setContentLanguage("en")} label="EN" /></div></div><div className="mt-5"><OfferPreview offer={preview} label={placementLabel(draft.placement, t)} /></div></OfferPreviewFrame><div className="mt-5 rounded-2xl border border-border bg-surface p-5"><p className="text-sm font-bold text-navy">{t("publishRequirements")}</p><p className="mt-2 text-sm leading-6 text-muted">{t("publishRequirementsDescription")}</p></div></aside></div>{errors.form ? <p role="alert" className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900 sm:mx-7">{errors.form}</p> : null}{notice ? <p role="status" className="mx-5 mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:mx-7">{notice}</p> : null}{!readOnly ? <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-surface/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:px-7"><div className="flex flex-wrap gap-3"><button type="button" disabled={Boolean(busyAction) || uploading} onClick={() => void save("save")} className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-navy disabled:opacity-50">{busyAction === "save" ? t("saving") : draft.status === "published" ? t("saveChanges") : t("saveDraft")}</button><button type="button" disabled={Boolean(busyAction) || uploading} onClick={() => void save("publish")} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busyAction === "publish" ? t("publishing") : t("publish")}</button>{persistedId && draft.status === "published" ? <button type="button" disabled={Boolean(busyAction) || uploading} onClick={() => void save("unpublish")} className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-navy disabled:opacity-50">{busyAction === "unpublish" ? t("unpublishing") : t("unpublish")}</button> : null}{persistedId ? <button type="button" disabled={Boolean(busyAction) || uploading} onClick={() => void save("archive")} className="rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-800 disabled:opacity-50">{busyAction === "archive" ? t("archiving") : t("archive")}</button> : null}</div><span className="text-xs text-muted">{t("draftsCanBeIncomplete")}</span></div> : <div className="border-t border-border bg-surface-muted px-5 py-4 text-sm text-muted sm:px-7">{t("archivedReadOnly")}</div>}</article>;
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section className="rounded-2xl border border-border bg-background p-5 sm:p-6"><h3 className="text-lg font-semibold text-navy">{title}</h3><p className="mt-1 text-sm leading-6 text-muted">{description}</p><div className="mt-5">{children}</div></section>; }
function Field({ label, value, onChange, helper, error, type = "text", disabled = false, required = false, dir }: { label: string; value: string; onChange: (value: string) => void; helper?: string; error?: string; type?: string; disabled?: boolean; required?: boolean; dir?: "ltr" }) { return <label className="block text-sm font-semibold text-navy">{label}{required ? <span className="ms-1 text-primary">*</span> : null}<input type={type} required={required} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} dir={dir} className={`mt-2 min-h-11 w-full rounded-xl border bg-surface px-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 ${error ? "border-red-400" : "border-border"}`} />{helper ? <span className="mt-2 block text-xs font-normal leading-5 text-muted">{helper}</span> : null}{error ? <span className="mt-2 block text-xs font-semibold text-red-800">{error}</span> : null}</label>; }
function TextArea({ label, value, onChange, helper, error, disabled = false }: { label: string; value: string; onChange: (value: string) => void; helper?: string; error?: string; disabled?: boolean }) { return <label className="block text-sm font-semibold text-navy">{label}<textarea disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} rows={5} className={`mt-2 w-full rounded-xl border bg-surface p-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 ${error ? "border-red-400" : "border-border"}`} />{helper ? <span className="mt-2 block text-xs font-normal leading-5 text-muted">{helper}</span> : null}{error ? <span className="mt-2 block text-xs font-semibold text-red-800">{error}</span> : null}</label>; }
function SelectField({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]>; disabled?: boolean }) { return <label className="block text-sm font-semibold text-navy">{label}<select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm disabled:opacity-60">{options.map(([option, label]) => <option value={option} key={option}>{label}</option>)}</select></label>; }
function Choice({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-3 text-start text-sm font-semibold ${active ? "border-primary bg-[#eef4ff] text-navy ring-1 ring-primary" : "border-border bg-surface text-muted hover:border-primary"}`}><span className="block h-2 w-10 rounded-full bg-primary/70" aria-hidden="true" /><span className="mt-2 block">{label}</span></button>; }
function Tab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${active ? "bg-white text-navy shadow-sm" : "text-muted"}`}>{label}</button>; }
function EmptyEditor({ t, onNew }: { t: Translate; onNew: () => void }) { return <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-primary">{t("offers")}</p><p className="mt-3 max-w-sm text-sm leading-6 text-muted">{t("chooseOffer")}</p><button type="button" onClick={onNew} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">{t("newOffer")}</button></div></div>; }
function placementLabel(value: string, t: Translate) { return value === "top_banner" ? t("topBanner") : value === "popup" ? t("popup") : t("homepageCard"); }
function stateLabel(value: OfferDraft["status"], t: Translate) { return value === "published" ? t("publishedState") : value === "archived" ? t("archived") : t("draftState"); }
function themeLabel(value: OfferDraft["theme"], t: Translate) { return value === "brand" ? t("themeBrand") : value === "light" ? t("themeLight") : value === "dark" ? t("themeDark") : t("themeAccent"); }
function layoutLabel(value: OfferDraft["layout"], t: Translate) { return value === "compact" ? t("layoutCompact") : value === "banner" ? t("layoutBanner") : t("layoutSplit"); }
function quickValue(url: string, language: "nl" | "en") { return [language === "nl" ? "/offerte" : "/en/quote", language === "nl" ? "/contact" : "/en/contact", language === "nl" ? "/werkgebied" : "/en/service-area"].includes(url) ? url : ""; }
function toDraft(offer: Offer): OfferDraft { return { ...emptyDraft, id: offer.id, status: offer.status, internalName: String(offer.internal_name ?? ""), placement: (offer.placement as OfferDraft["placement"]) ?? "homepage_offer", priority: Number(offer.priority ?? 0), startsAt: toDateTimeLocal(offer.starts_at), endsAt: toDateTimeLocal(offer.ends_at), badgeNl: String(offer.badge_nl ?? ""), badgeEn: String(offer.badge_en ?? ""), titleNl: String(offer.title_nl ?? ""), titleEn: String(offer.title_en ?? ""), subtitleNl: String(offer.subtitle_nl ?? ""), subtitleEn: String(offer.subtitle_en ?? ""), descriptionNl: String(offer.description_nl ?? ""), descriptionEn: String(offer.description_en ?? ""), oldPriceLabel: String(offer.old_price_label ?? ""), newPriceLabel: String(offer.new_price_label ?? ""), discountLabel: String(offer.discount_label ?? ""), ctaLabelNl: String(offer.cta_label_nl ?? ""), ctaLabelEn: String(offer.cta_label_en ?? ""), ctaUrl: String(offer.cta_url ?? ""), imagePath: String(offer.image_path ?? ""), imageAltNl: String(offer.image_alt_nl ?? ""), imageAltEn: String(offer.image_alt_en ?? ""), theme: (offer.theme as OfferDraft["theme"]) ?? "brand", layout: (offer.layout as OfferDraft["layout"]) ?? "banner", dismissible: offer.dismissible !== false }; }
function draftToPayload(draft: OfferDraft) { const payload: Record<string, unknown> = { ...draft }; delete payload.id; delete payload.imageName; payload.startsAt = toIso(draft.startsAt); payload.endsAt = toIso(draft.endsAt); payload.enabled = draft.status === "published"; return payload; }
function mapBackendError(message: string, t: Translate): OfferErrors { const errors: OfferErrors = { form: message }; const lower = message.toLowerCase(); if (lower.includes("titlenl")) errors.titleNl = message; if (lower.includes("titleen")) errors.titleEn = message; if (lower.includes("descriptionnl")) errors.descriptionNl = message; if (lower.includes("descriptionen")) errors.descriptionEn = message; if (lower.includes("ctalabelnl")) errors.ctaLabelNl = message; if (lower.includes("ctalabelen")) errors.ctaLabelEn = message; if (lower.includes("cta url")) errors.ctaUrl = t("invalidCtaUrl"); return errors; }
function formatDate(value: unknown, locale: string) { if (!value) return "—"; try { return new Intl.DateTimeFormat(locale === "ar" ? "ar" : locale, { dateStyle: "medium" }).format(new Date(String(value))); } catch { return "—"; } }
