import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { toMailtoHref, toTelHref, toWhatsAppHref } from "@/lib/contact-links";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function FinalCtaSection() {
  const t = await getTranslations("homepage.finalCta");
  const contactT = await getTranslations("contactPage");
  const contactLinks = [
    { label: t("phone"), href: toTelHref(siteConfig.contact.phone), external: false },
    { label: t("whatsapp"), href: toWhatsAppHref(siteConfig.contact.whatsapp, contactT("whatsappMessage")), external: true },
    { label: t("email"), href: toMailtoHref(siteConfig.contact.email), external: false },
  ].filter((item): item is { label: string; href: string; external: boolean } => Boolean(item.href));

  return (
    <Section className="bg-navy text-white">
      <Container className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8bb4ff]">{t("eyebrow")}</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h2>
          <p className="mt-5 text-lg leading-8 text-white/75">{t("description")}</p>
        </div>
        <div className="shrink-0">
          <ButtonLink href="/offerte" size="lg" className="w-full sm:w-auto">{t("primaryCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink>
          {contactLinks.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
              {contactLinks.map((item) => <a key={item.href} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} className="underline-offset-4 hover:text-white hover:underline">{item.label}</a>)}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
