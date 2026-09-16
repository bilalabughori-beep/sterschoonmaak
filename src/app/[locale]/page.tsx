import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { AboutSection } from "@/components/home/about-section";
import { BusinessCleaningSection } from "@/components/home/business-cleaning-section";
import { EquipmentSection } from "@/components/home/equipment-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { HeroSection } from "@/components/home/hero-section";
import { ProcessSection } from "@/components/home/process-section";
import { PropertyTypesSection } from "@/components/home/property-types-section";
import { RecurringCleaningSection } from "@/components/home/recurring-cleaning-section";
import { ServiceAreaSection } from "@/components/home/service-area-section";
import { ServicesSection } from "@/components/home/services-section";
import { WhyUsSection } from "@/components/home/why-us-section";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/site";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

function getValidLocale(value: string): SupportedLocale {
  if (!hasLocale(routing.locales, value)) {
    notFound();
  }

  return value;
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getValidLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations("homepage.meta");

  return {
    title: { absolute: t("title") },
    description: t("description"),
  };
}

export default async function HomePage({ params }: LocalePageProps) {
  const { locale: rawLocale } = await params;
  const locale = getValidLocale(rawLocale);
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <PropertyTypesSection />
      <ServicesSection />
      <BusinessCleaningSection />
      <RecurringCleaningSection />
      <WhyUsSection />
      <EquipmentSection />
      <ProcessSection />
      <ServiceAreaSection />
      <AboutSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
