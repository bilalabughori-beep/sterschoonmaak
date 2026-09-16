import type { Metadata } from "next";
import { ServicePage } from "@/components/services/service-page";
import { getServiceMetadata } from "@/lib/service-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getServiceMetadata((await params).locale, "airbnb");
}

export default async function Page({ params }: Props) {
  return <ServicePage serviceId="airbnb" rawLocale={(await params).locale} />;
}
