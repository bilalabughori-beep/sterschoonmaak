import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ServiceAreaPage } from "@/components/pages/service-area-page";
import { getLocalizedPageMetadata } from "@/lib/route-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getLocalizedPageMetadata((await params).locale, "serviceAreaPage", { nl: "/werkgebied", en: "/en/service-area" });
}

export default async function ServiceAreaRoute({ params }: Props) {
  setRequestLocale((await params).locale);
  return <ServiceAreaPage />;
}
