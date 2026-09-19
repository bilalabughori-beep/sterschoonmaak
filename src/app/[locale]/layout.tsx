import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { SiteShell } from "@/components/layout/site-shell";
import { PublicDocumentScope } from "@/components/layout/public-document-scope";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const publicPath = locale === "en-BE" ? "/en" : "/";
  return {
    title: {
      default: siteConfig.brandName,
      template: `%s | ${siteConfig.brandName}`,
    },
    description: "Professional cleaning services in Ghent and surrounding areas.",
    alternates: { canonical: publicPath },
    openGraph: {
      type: "website",
      url: new URL(publicPath, siteConfig.siteUrl).toString(),
      siteName: siteConfig.brandName,
      title: siteConfig.brandName,
      description: "Professional cleaning services in Ghent and surrounding areas.",
      locale: locale === "en-BE" ? "en_GB" : "nl_BE",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return <NextIntlClientProvider locale={locale} messages={messages}><PublicDocumentScope locale={locale}><SiteShell>{children}</SiteShell></PublicDocumentScope></NextIntlClientProvider>;
}
