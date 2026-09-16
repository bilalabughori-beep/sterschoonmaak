import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getServiceById } from "@/config/services";
import type { ServiceId } from "@/config/services";
import type { SupportedLocale } from "@/config/site";
import { getServiceFallbackValue } from "@/config/service-content";
import { routing } from "@/i18n/routing";

function getLocale(rawLocale: string) {
  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  return rawLocale;
}

export async function getServicesOverviewMetadata(rawLocale: string): Promise<Metadata> {
  const locale = getLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations("services.overview");

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: {
      canonical: locale === "nl-BE" ? "/diensten" : "/services",
      languages: {
        "nl-BE": "/diensten",
        "en-BE": "/services",
        "x-default": "/diensten",
      },
    },
  };
}

export async function getServiceMetadata(rawLocale: string, serviceId: ServiceId): Promise<Metadata> {
  const locale = getLocale(rawLocale);
  const service = getServiceById(serviceId);

  if (!service || !service.complete) {
    notFound();
  }

  setRequestLocale(locale);
  const tRaw = await getTranslations("services");
  const t = (key: string) => {
    if (!tRaw.has(key)) {
      return getServiceFallbackValue(serviceId, locale as SupportedLocale, key) ?? key;
    }

    try {
      const translated = tRaw(key);
      const missing = translated === key || translated.endsWith(`.${key}`);
      return missing ? getServiceFallbackValue(serviceId, locale as SupportedLocale, key) ?? translated : translated;
    } catch {
      return getServiceFallbackValue(serviceId, locale as SupportedLocale, key) ?? key;
    }
  };

  return {
    title: { absolute: t(`items.${serviceId}.metaTitle`) },
    description: t(`items.${serviceId}.metaDescription`),
    alternates: {
      canonical: service.pathnames[locale],
      languages: {
        "nl-BE": service.pathnames["nl-BE"],
        "en-BE": service.pathnames["en-BE"],
        "x-default": service.pathnames["nl-BE"],
      },
    },
  };
}
