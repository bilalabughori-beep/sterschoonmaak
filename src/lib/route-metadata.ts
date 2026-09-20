import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

function getPublicLocale(rawLocale: string) {
  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  return rawLocale;
}

export async function getBusinessMetadata(rawLocale: string): Promise<Metadata> {
  const locale = getPublicLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations("businessPage");

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: locale === "nl-BE" ? "/zakelijk" : "/business-cleaning",
      languages: {
        "nl-BE": "/zakelijk",
        "en-BE": "/business-cleaning",
        "x-default": "/zakelijk",
      },
    },
  };
}

export async function getContactMetadata(rawLocale: string): Promise<Metadata> {
  const locale = getPublicLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: "/contact",
      languages: {
        "nl-BE": "/contact",
        "en-BE": "/contact",
        "x-default": "/contact",
      },
    },
  };
}

export async function getLocalizedPageMetadata(
  rawLocale: string,
  namespace: string,
  paths: { nl: string; en: string },
  indexable = true,
): Promise<Metadata> {
  const locale = getPublicLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations(namespace);
  const nlPath = paths.nl;
  const enPath = paths.en;

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    robots: { index: indexable, follow: true },
    alternates: {
      canonical: locale === "nl-BE" ? nlPath : enPath,
      languages: {
        "nl-BE": nlPath,
        "en-BE": enPath,
        "x-default": nlPath,
      },
    },
  };
}

export function assertPublicLocale(rawLocale: string) {
  if (!hasLocale(routing.locales, rawLocale)) notFound();
  return rawLocale;
}
