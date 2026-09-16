import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getServiceById, type ServiceId } from "@/config/services";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Link } from "@/i18n/navigation";

const clientIds = ["offices", "restaurants", "hotels", "schools", "commercial", "property", "shared", "shortStay"] as const;
const clientServiceIds: Partial<Record<(typeof clientIds)[number], ServiceId>> = {
  offices: "office",
  restaurants: "restaurant",
  hotels: "hotel",
  schools: "school",
  commercial: "commercial",
  shared: "staircase",
  shortStay: "airbnb",
};
const coreServiceIds = ["office", "commercial", "restaurant", "hotel", "school", "staircase"] as const satisfies readonly ServiceId[];
const relatedServiceIds = ["windows", "deep", "postConstruction", "airbnb"] as const satisfies readonly ServiceId[];
const frequencyIds = ["daily", "several", "weekly", "custom"] as const;
const benefitIds = ["equipment", "planning", "communication", "scope", "flexible", "local"] as const;
const faqIds = ["recurring", "hours", "types", "products", "pricing", "oneTime", "shortNotice", "area"] as const;

export async function BusinessCleaningPage() {
  const t = await getTranslations("businessPage");
  const servicesT = await getTranslations("services");

  return (
    <>
      <section className="border-b border-border bg-background">
        <Container className="py-10 sm:py-14 lg:py-16">
          <Breadcrumbs current={t("breadcrumb")} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("heroEyebrow")}</p>
              <h1 className="mt-4 max-w-xl text-[2.7rem] font-semibold leading-[1.05] tracking-[-0.035em] text-navy sm:text-5xl lg:text-[3.8rem]">{t("heroTitle")}</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{t("heroDescription")}</p>
              <ButtonLink href="/offerte" size="lg" className="mt-8">
                {t("primaryCta")}<span className="ml-2" aria-hidden="true">→</span>
              </ButtonLink>
            </div>
            <figure className="relative min-h-[22rem] overflow-hidden rounded-2xl bg-navy sm:min-h-[31rem]">
              <Image src="/images/hero-window-cleaners.jpg" alt={t("heroImageAlt")} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" aria-hidden="true" />
              <figcaption className="absolute inset-x-0 bottom-0 border-l-2 border-[#9fc0ff] px-6 py-5 text-base font-semibold text-white sm:px-8">{t("heroImageCaption")}</figcaption>
            </figure>
          </div>
        </Container>
      </section>

      <Section className="bg-surface">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("clientsEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("clientsTitle")}</h2>
            <p className="mt-4 text-lg leading-8 text-muted">{t("clientsDescription")}</p>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {clientIds.map((id) => {
              const service = clientServiceIds[id] ? getServiceById(clientServiceIds[id] as ServiceId) : undefined;
              const content = <><span className="block text-lg font-semibold text-navy">{t(`clients.${id}`)}</span><span className="mt-2 block text-sm leading-6 text-muted">{t(`clientDescriptions.${id}`)}</span></>;
              return <li key={id}>{service ? <Link href={service.internalPath as never} className="block h-full border border-border bg-background p-5 transition-colors hover:border-primary">{content}</Link> : <div className="h-full border border-border bg-background p-5">{content}</div>}</li>;
            })}
          </ul>
        </Container>
      </Section>

      <Section className="bg-background">
        <Container>
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
            <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("servicesEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("servicesTitle")}</h2></div>
            <Link href="/diensten" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">{t("allServices")}<span className="ml-2" aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {coreServiceIds.map((id) => { const service = getServiceById(id); if (!service) return null; return <Link key={id} href={service.internalPath as never} className="border border-border bg-surface p-6 transition-colors hover:border-primary"><span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{servicesT(`categories.${service.category}`)}</span><span className="mt-5 block text-xl font-semibold text-navy">{servicesT(`overview.items.${id}.title`)}</span><span className="mt-3 block text-sm leading-6 text-muted">{servicesT(`overview.items.${id}.description`)}</span></Link>; })}
          </div>
        </Container>
      </Section>

      <Section className="bg-[#eaf2ff]">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("recurringEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("recurringTitle")}</h2><p className="mt-5 text-lg leading-8 text-muted">{t("recurringDescription")}</p><ButtonLink href="/offerte" variant="secondary" size="lg" className="mt-8">{t("primaryCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink></div>
          <div><p className="text-sm font-semibold text-navy/70">{t("frequencyIntro")}</p><ul className="mt-6 grid gap-3 border-t border-[#b9c9dd] pt-6 sm:grid-cols-2">{frequencyIds.map((id) => <li key={id} className="border-t-2 border-primary pt-4 text-base font-semibold text-navy">{t(`frequencies.${id}`)}</li>)}</ul></div>
        </Container>
      </Section>

      <Section className="bg-navy text-white">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("operationsEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("operationsTitle")}</h2><p className="mt-5 text-lg leading-8 text-white/70">{t("operationsDescription")}</p></div>
          <div className="border-l-2 border-[#8bb4ff] pl-6 sm:pl-8"><h3 className="text-xl font-semibold">{t("productsTitle")}</h3><p className="mt-3 text-base leading-7 text-white/70">{t("productsDescription")}</p><p className="mt-8 border-t border-white/15 pt-6 text-sm leading-6 text-white/60">{t("shortNoticeNote")}</p></div>
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container>
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("processEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("processTitle")}</h2><p className="mt-4 text-lg leading-8 text-muted">{t("processDescription")}</p></div>
          <ol className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">{(["tell", "discuss", "visit", "quote"] as const).map((id, index) => <li key={id} className="border-t-2 border-primary pt-4"><span className="text-sm font-bold text-primary">0{index + 1}</span><h3 className="mt-4 text-lg font-semibold text-navy">{t(`process.${id}.title`)}</h3><p className="mt-3 text-sm leading-6 text-muted">{t(`process.${id}.description`)}</p></li>)}</ol>
        </Container>
      </Section>

      <Section className="bg-background">
        <Container><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("whyEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("whyTitle")}</h2></div><ul className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">{benefitIds.map((id) => <li key={id} className="bg-surface p-6"><h3 className="text-lg font-semibold text-navy">{t(`benefits.${id}.title`)}</h3><p className="mt-3 text-sm leading-6 text-muted">{t(`benefits.${id}.description`)}</p></li>)}</ul></Container>
      </Section>

      <Section className="bg-surface">
        <Container><div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("relatedEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("relatedTitle")}</h2></div><Link href="/diensten" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">{t("allServices")}<span className="ml-2" aria-hidden="true">→</span></Link></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{relatedServiceIds.map((id) => { const service=getServiceById(id); if(!service)return null; return <Link key={id} href={service.internalPath as never} className="border border-border bg-background p-5 transition-colors hover:border-primary"><span className="text-lg font-semibold text-navy">{servicesT(`overview.items.${id}.title`)}</span><span className="mt-2 block text-sm leading-6 text-muted">{servicesT(`overview.items.${id}.description`)}</span></Link>; })}</div></Container>
      </Section>

      <Section className="bg-background">
        <Container className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("faqEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("faqTitle")}</h2></div><div className="divide-y divide-border border-y border-border">{faqIds.map((id)=><details key={id} className="group py-4 first:pt-5 last:pb-5"><summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-base font-semibold text-navy marker:hidden [&::-webkit-details-marker]:hidden">{t(`faq.${id}.question`)}<span className="text-2xl font-normal leading-none text-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p className="max-w-2xl pr-8 pt-3 text-sm leading-6 text-muted">{t(`faq.${id}.answer`)}</p></details>)}</div></Container>
      </Section>

      <Section className="bg-navy text-white"><Container className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end lg:gap-16"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("finalEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{t("finalTitle")}</h2><p className="mt-5 text-lg leading-8 text-white/70">{t("finalDescription")}</p></div><div className="flex flex-col gap-3 sm:flex-row"><ButtonLink href="/offerte" size="lg" className="w-full sm:w-auto">{t("primaryCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink><ButtonLink href="/contact" variant="outline" size="lg" className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto">{t("contactCta")}</ButtonLink></div></Container></Section>
    </>
  );
}
