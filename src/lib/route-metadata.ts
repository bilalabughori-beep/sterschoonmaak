import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { RouteShellKey } from "@/config/route-shells";
import { routing } from "@/i18n/routing";

export async function getUnfinishedRouteMetadata(
  rawLocale: string,
  pageKey: RouteShellKey,
): Promise<Metadata> {
  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  setRequestLocale(rawLocale);
  const t = await getTranslations("routeShell");

  return {
    title: t(`${pageKey}.title`),
    description: t(`${pageKey}.description`),
    robots: { index: false, follow: false },
  };
}

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
