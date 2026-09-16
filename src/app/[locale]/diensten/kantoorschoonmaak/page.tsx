import type { Metadata } from "next";
import { ServicePage } from "@/components/services/service-page";
import { getServiceMetadata } from "@/lib/service-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getServiceMetadata((await params).locale, "office");
}

export default async function OfficeCleaningPage({ params }: Props) {
  return <ServicePage serviceId="office" rawLocale={(await params).locale} />;
}
