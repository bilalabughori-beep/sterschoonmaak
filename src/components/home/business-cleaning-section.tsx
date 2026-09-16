import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function BusinessCleaningSection() {
  const t = await getTranslations("homepage.business");
  const clients = ["offices", "restaurants", "hotels", "schools", "commercial", "property"] as const;

  return (
    <Section className="bg-navy text-white">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div className="order-2 lg:order-1">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8bb4ff]">{t("eyebrow")}</p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">{t("description")}</p>
          <ButtonLink href="/zakelijk" variant="primary" size="lg" className="mt-8">
            {t("cta")}
            <span className="ml-2" aria-hidden="true">→</span>
          </ButtonLink>
        </div>
        <div className="order-1 lg:order-2">
          <figure className="relative min-h-[19rem] overflow-hidden rounded-2xl border border-white/15 sm:min-h-[27rem]">
            <Image
              src="/images/hero-window-cleaners.jpg"
              alt={t("imageAlt")}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-navy/25" aria-hidden="true" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-navy/85 px-5 py-4 text-sm font-semibold text-white sm:px-6">
              {t("imageCaption")}
            </figcaption>
          </figure>
          <div className="mt-7 border-l border-white/25 pl-5 sm:pl-6">
            <p className="text-base font-semibold text-white">{t("clientIntro")}</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/75">
              {clients.map((id) => <li key={id} className="border-t border-white/15 pt-3">{t(`clients.${id}`)}</li>)}
            </ul>
            <p className="mt-6 text-sm leading-6 text-white/60">{t("scheduleNote")}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
