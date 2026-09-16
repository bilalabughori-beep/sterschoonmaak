import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { toWhatsAppHref } from "@/lib/contact-links";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export async function HeroSection() {
  const t = await getTranslations("homepage.hero");
  const contactT = await getTranslations("contactPage");
  const whatsappHref = toWhatsAppHref(siteConfig.contact.whatsapp, contactT("whatsappMessage"));
  const trustItems = ["equipment", "schedule", "area", "customers"] as const;

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="absolute inset-y-0 left-0 hidden w-2 bg-primary lg:block" aria-hidden="true" />
      <Container className="grid gap-8 py-10 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-16 lg:gap-y-8 lg:py-20">
        <div className="max-w-2xl lg:col-start-1 lg:row-start-1">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("eyebrow")}</p>
          <p className="mt-4 text-sm font-semibold tracking-wide text-navy/65">{t("brandLine")}</p>
          <h1 className="mt-5 max-w-xl text-[2.65rem] font-semibold leading-[1.05] tracking-[-0.035em] text-navy sm:text-5xl lg:text-[3.9rem]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-navy/75">{t("description")}</p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink href="/offerte" size="lg" className="w-full sm:w-auto">
              {t("primaryCta")}
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </ButtonLink>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-transparent px-6 py-3 text-base font-semibold text-navy transition-colors hover:bg-surface-muted"
              >
                {t("whatsappCta")}
              </a>
            ) : null}
          </div>
          <p className="mt-5 text-sm font-medium leading-6 text-navy/65">{t("note")}</p>
        </div>

        <figure className="relative min-h-[23rem] overflow-hidden rounded-2xl bg-navy sm:min-h-[34rem] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Image
            src="/images/hero-cleaner-glass.jpg"
            alt={t("imageAlt")}
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover object-[58%_center] grayscale-[15%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" aria-hidden="true" />
          <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <span className="block max-w-sm border-l-2 border-[#8bb4ff] pl-4 text-base font-semibold leading-6 sm:text-lg">{t("imageCaption")}</span>
          </figcaption>
        </figure>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-6 border-t border-border pt-6 sm:grid-cols-4 sm:gap-x-6 lg:col-start-1 lg:row-start-2">
          {trustItems.map((id) => (
            <div key={id}>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{t(`trustItems.${id}.label`)}</dt>
              <dd className="mt-2 text-sm font-semibold leading-5 text-navy">{t(`trustItems.${id}.value`)}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
