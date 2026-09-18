"use client";

import { useBackofficeLocale, type BackofficeLocale } from "@/lib/backoffice-i18n";

export function BackofficeLanguageSwitcher() {
  const { locale, setLocale, t } = useBackofficeLocale();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={locale}
        onChange={(event) => setLocale(event.target.value as BackofficeLocale)}
        className="min-h-10 rounded-lg border border-current/20 bg-transparent px-2 text-inherit"
      >
        <option value="nl-BE" className="text-navy">{t("dutch")}</option>
        <option value="en-BE" className="text-navy">{t("english")}</option>
        <option value="ar" className="text-navy">{t("arabic")}</option>
      </select>
    </label>
  );
}
