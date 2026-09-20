import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LocalizedPrivacyPage } from "@/components/legal/localized-privacy-page";
import { getLocalizedPageMetadata } from "@/lib/route-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getLocalizedPageMetadata((await params).locale, "legacyPrivacy", { nl: "/privacy", en: "/privacy" }, false);
}

export default async function PrivacyPage({ params }: Props) {
  setRequestLocale((await params).locale);
  return <LocalizedPrivacyPage />;
}
