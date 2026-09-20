import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { toWhatsAppHref } from "@/lib/contact-links";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function ServiceAreaPage() {
  const t = await getTranslations("serviceAreaPage");
  const whatsappHref = toWhatsAppHref(siteConfig.contact.whatsapp, t("whatsappMessage"));

  return (
    <>
      <section className="border-b border-border bg-background">
        <Container className="py-10 sm:py-14 lg:py-16">
          <Breadcrumbs current={t("breadcrumb")} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("heroEyebrow")}</p>
              <h1 className="mt-4 text-[2.7rem] font-semibold leading-[1.05] tracking-[-0.035em] text-navy sm:text-5xl lg:text-[3.8rem]">{t("heroTitle")}</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{t("heroDescription")}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/offerte" size="lg">{t("quoteCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink>
                <ButtonLink href="/contact" variant="outline" size="lg">{t("contactCta")}</ButtonLink>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-navy p-7 text-white shadow-xl shadow-navy/10 sm:p-10">
              <div className="absolute -right-12 -top-12 size-48 rounded-full border-[22px] border-[#9fc0ff]/20" aria-hidden="true" />
              <div className="absolute -bottom-20 -left-16 size-64 rounded-full border-[28px] border-primary/30" aria-hidden="true" />
              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("visualEyebrow")}</p>
                <p className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{t("visualTitle")}</p>
                <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-white/80">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg text-white">●</span>
                  <span>{siteConfig.location}</span>
                </div>
                <div className="my-5 h-px bg-white/20" />
                <p className="text-base leading-7 text-white/70">{t("visualDescription", { radius: siteConfig.serviceRadiusKm.amount })}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Section className="bg-surface">
        <Container>
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("whereEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("whereTitle")}</h2><p className="mt-4 text-lg leading-8 text-muted">{t("whereDescription")}</p></div>
          <div className="mt-10 grid gap-px bg-border md:grid-cols-3">
            {(["base", "radius", "planning"] as const).map((key, index) => <article key={key} className="bg-background p-7 sm:p-8"><span className="text-sm font-bold text-primary">0{index + 1}</span><h3 className="mt-5 text-xl font-semibold text-navy">{t(`where.${key}.title`)}</h3><p className="mt-3 text-sm leading-7 text-muted">{t(`where.${key}.description`, { radius: siteConfig.serviceRadiusKm.amount })}</p></article>)}
          </div>
        </Container>
      </Section>

      <Section className="bg-background">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("customersEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("customersTitle")}</h2></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="border border-border bg-surface p-6"><h3 className="text-xl font-semibold text-navy">{t("customers.homes.title")}</h3><p className="mt-3 text-sm leading-7 text-muted">{t("customers.homes.description")}</p></div><div className="border border-border bg-surface p-6"><h3 className="text-xl font-semibold text-navy">{t("customers.businesses.title")}</h3><p className="mt-3 text-sm leading-7 text-muted">{t("customers.businesses.description")}</p></div></div>
        </Container>
      </Section>

      <Section className="bg-[#eaf2ff]"><Container className="grid gap-12 lg:grid-cols-2 lg:gap-20"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("availabilityEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("availabilityTitle")}</h2><p className="mt-5 text-lg leading-8 text-muted">{t("availabilityDescription")}</p></div><ol className="space-y-5 border-l-2 border-primary pl-6 sm:pl-8">{(["request", "review", "visit"] as const).map((key, index) => <li key={key}><p className="text-sm font-bold text-primary">0{index + 1}</p><h3 className="mt-1 text-lg font-semibold text-navy">{t(`availability.${key}.title`)}</h3><p className="mt-2 text-sm leading-7 text-muted">{t(`availability.${key}.description`)}</p></li>)}</ol></Container></Section>

      <Section className="bg-navy text-white"><Container className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end lg:gap-16"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("finalEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("finalTitle")}</h2><p className="mt-5 text-lg leading-8 text-white/70">{t("finalDescription")}</p></div><div className="flex flex-col gap-3 sm:flex-row"><ButtonLink href="/offerte" size="lg" className="w-full sm:w-auto">{t("quoteCta")}</ButtonLink>{whatsappHref ? <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10">WhatsApp</a> : null}</div></Container></Section>
    </>
  );
}
