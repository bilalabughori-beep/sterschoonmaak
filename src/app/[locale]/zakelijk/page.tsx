import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { BusinessCleaningPage } from "@/components/business/business-cleaning-page";
import { getBusinessMetadata } from "@/lib/route-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getBusinessMetadata((await params).locale);
}

export default async function BusinessPage({ params }: Props) {
  setRequestLocale((await params).locale);
  return <BusinessCleaningPage />;
}
