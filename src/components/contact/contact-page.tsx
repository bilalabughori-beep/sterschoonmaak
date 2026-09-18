import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { toTelHref, toWhatsAppHref } from "@/lib/contact-links";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function ContactPageContent() {
  const t = await getTranslations("contactPage");
  const phoneHref = toTelHref(siteConfig.contact.phone);
  const whatsappHref = toWhatsAppHref(siteConfig.contact.whatsapp, t("whatsappMessage"));
  const phoneDisplay = siteConfig.contact.phoneDisplay;

  return (
    <>
      <section className="border-b border-border bg-background">
        <Container className="py-10 sm:py-14 lg:py-16"><Breadcrumbs current={t("breadcrumb")} /><div className="mt-10 max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("heroEyebrow")}</p><h1 className="mt-4 text-[2.7rem] font-semibold leading-[1.05] tracking-[-0.035em] text-navy sm:text-5xl">{t("heroTitle")}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{t("heroDescription")}</p></div></Container>
      </section>

      <Section className="bg-surface"><Container><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("actionsEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("actionsTitle")}</h2><p className="mt-4 text-lg leading-8 text-muted">{t("actionsDescription")}</p></div><div className="mt-10 grid gap-4 md:grid-cols-2"><div className="border border-border bg-background p-7 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">{t("phoneLabel")}</p><h3 className="mt-4 text-2xl font-semibold text-navy">{phoneDisplay}</h3><p className="mt-3 text-base leading-7 text-muted">{t("phoneDescription")}</p>{phoneHref ? <a href={phoneHref} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#1249b6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{t("phoneAction")}</a> : null}</div><div className="border border-[#b9c9dd] bg-[#eaf2ff] p-7 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">{t("whatsappLabel")}</p><h3 className="mt-4 text-2xl font-semibold text-navy">{t("whatsappTitle")}</h3><p className="mt-3 text-base leading-7 text-muted">{t("whatsappDescription")}</p>{whatsappHref ? <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl border border-[#91b4ed] bg-white px-6 py-3 text-base font-semibold text-navy transition-colors hover:bg-[#f5f8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{t("whatsappAction")}</a> : null}</div></div></Container></Section>

      <Section className="bg-background"><Container className="grid gap-12 lg:grid-cols-2 lg:gap-20"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("availabilityEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("availabilityTitle")}</h2><p className="mt-5 text-lg leading-8 text-muted">{t("availabilityDescription")}</p></div><div className="border-l-4 border-primary bg-[#eaf2ff] p-7 sm:p-10"><h3 className="text-xl font-semibold text-navy">{t("areaTitle")}</h3><p className="mt-3 text-base leading-7 text-muted">{t("areaDescription")}</p><p className="mt-6 border-t border-[#b9c9dd] pt-5 text-sm leading-6 text-muted">{t("noticeDescription")}</p></div></Container></Section>

      <Section className="bg-surface"><Container className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end lg:gap-16"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("nextEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("nextTitle")}</h2><p className="mt-4 text-lg leading-8 text-muted">{t("nextDescription")}</p></div><div className="flex flex-col gap-3 sm:flex-row"><ButtonLink href="/offerte" size="lg" className="w-full sm:w-auto">{t("quoteCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink><ButtonLink href="/klacht" variant="outline" size="lg" className="w-full sm:w-auto">{t("complaintCta")}</ButtonLink><ButtonLink href="/diensten" variant="outline" size="lg" className="w-full sm:w-auto">{t("servicesCta")}</ButtonLink></div></Container></Section>

      <Section className="bg-navy text-white"><Container className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("finalEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("finalTitle")}</h2><p className="mt-5 text-lg leading-8 text-white/70">{t("finalDescription")}</p></Container></Section>
    </>
  );
}
