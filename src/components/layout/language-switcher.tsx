"use client";

import { useLocale, useTranslations } from "next-intl";
import type { SupportedLocale } from "@/config/site";
import { usePathname, useRouter } from "@/i18n/navigation";

const locales: Array<{ code: SupportedLocale; label: string }> = [
  { code: "nl-BE", label: "NL" },
  { code: "en-BE", label: "EN" },
];

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale() as SupportedLocale;
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(nextLocale: string) {
    if (nextLocale === locale) return;
    try { window.localStorage.setItem("ster-schoonmaak-locale", nextLocale); } catch { /* preference storage is optional */ }
    router.replace(pathname, { locale: nextLocale as SupportedLocale });
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
        className="min-h-10 appearance-none rounded-full border border-border bg-surface px-3 pr-8 text-xs font-bold tracking-[0.12em] text-navy outline-none transition-colors hover:border-primary focus-visible:border-primary"
      >
        {locales.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-xs text-muted" aria-hidden="true">
        ▾
      </span>
    </label>
  );
}
