import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ServicesOverviewPage } from "@/components/services/services-overview-page";
import { getServicesOverviewMetadata } from "@/lib/service-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getServicesOverviewMetadata((await params).locale);
}

export default async function ServicesPage({ params }: Props) {
  setRequestLocale((await params).locale);
  return <ServicesOverviewPage />;
}
