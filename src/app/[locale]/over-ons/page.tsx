import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AboutPage } from "@/components/pages/about-page";
import { getLocalizedPageMetadata } from "@/lib/route-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getLocalizedPageMetadata((await params).locale, "aboutPage", { nl: "/over-ons", en: "/en/about" });
}

export default async function AboutRoute({ params }: Props) {
  setRequestLocale((await params).locale);
  return <AboutPage />;
}
