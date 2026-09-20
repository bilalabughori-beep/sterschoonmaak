import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CookiePolicyPage } from "@/components/legal/cookie-policy-page";
import { getLocalizedPageMetadata } from "@/lib/route-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getLocalizedPageMetadata((await params).locale, "cookiePolicy", { nl: "/cookiebeleid", en: "/en/cookie-policy" });
}

export default async function CookiesPage({ params }: Props) {
  setRequestLocale((await params).locale);
  return <CookiePolicyPage />;
}
