import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getCompletedServices, serviceRegistry } from "@/config/services";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";
import { ServiceBreadcrumbs } from "@/components/services/breadcrumbs";

function ServiceOverviewCard({ service, t }: { service: (typeof serviceRegistry)[number]; t: (key: string) => string }) {
  const title = t(`overview.items.${service.id}.title`);
  const description = t(`overview.items.${service.id}.description`);
  const category = t(`categories.${service.category}`);
  const card = (
    <article className={`group border border-border bg-surface p-6 ${service.complete ? "transition-colors hover:border-primary" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{category}</span>
        {service.complete ? <span className="text-lg text-primary transition-transform group-hover:translate-x-1" aria-hidden="true">→</span> : null}
      </div>
      <h3 className="mt-12 text-xl font-semibold tracking-tight text-navy">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </article>
  );

  return service.complete ? <Link href={service.internalPath as never} className="block">{card}</Link> : card;
}

export async function ServicesOverviewPage() {
  const t = await getTranslations("services");
  const completedServices = getCompletedServices();

  return (
    <>
      <section className="border-b border-border bg-background">
        <Container className="py-10 sm:py-14 lg:py-16">
          <ServiceBreadcrumbs />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:gap-16">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("overview.eyebrow")}</p>
              <h1 className="mt-4 max-w-xl text-[2.7rem] font-semibold leading-[1.05] tracking-[-0.035em] text-navy sm:text-5xl">{t("overview.title")}</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{t("overview.description")}</p>
              <ButtonLink href="/offerte" size="lg" className="mt-8">{t("overview.primaryCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink>
            </div>
            <figure className="relative min-h-[19rem] overflow-hidden rounded-2xl bg-navy sm:min-h-[25rem]">
              <Image src="/images/hero-cleaner-glass.jpg" alt={t("overview.imageAlt")} fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" aria-hidden="true" />
              <figcaption className="absolute inset-x-0 bottom-0 border-l-2 border-[#9fc0ff] px-6 py-5 text-base font-semibold text-white sm:px-8">{t("overview.imageCaption")}</figcaption>
            </figure>
          </div>
        </Container>
      </section>

      <Section className="bg-surface">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("overview.priorityEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("overview.priorityTitle")}</h2>
            <p className="mt-4 text-lg leading-8 text-muted">{t("overview.priorityDescription")}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {completedServices.map((service) => <ServiceOverviewCard key={service.id} service={service} t={t} />)}
          </div>
        </Container>
      </Section>

      <Section className="bg-background">
        <Container>
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("overview.allEyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("overview.allTitle")}</h2>
              <p className="mt-4 text-lg leading-8 text-muted">{t("overview.allDescription")}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-navy/70">{t("overview.launchLabel")}</p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceRegistry.map((service) => <ServiceOverviewCard key={service.id} service={service} t={t} />)}
          </div>
        </Container>
      </Section>

      <Section className="bg-navy text-white">
        <Container>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("overview.guidanceEyebrow")}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{t("overview.guidanceTitle")}</h2>
          <div className="mt-10 grid gap-px bg-white/15 lg:grid-cols-2">
            <div className="bg-navy p-7 sm:p-9">
              <h3 className="text-2xl font-semibold">{t("overview.businessTitle")}</h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/70">{t("overview.businessDescription")}</p>
            </div>
            <div className="bg-navy p-7 sm:p-9">
              <h3 className="text-2xl font-semibold">{t("overview.residentialTitle")}</h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/70">{t("overview.residentialDescription")}</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("overview.planningEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("overview.planningTitle")}</h2>
            <p className="mt-5 text-lg leading-8 text-muted">{t("overview.planningDescription")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-t-2 border-primary pt-5"><h3 className="text-xl font-semibold text-navy">{t("overview.recurringTitle")}</h3><p className="mt-3 text-base leading-7 text-muted">{t("overview.recurringDescription")}</p></div>
            <div className="border-t-2 border-primary pt-5"><h3 className="text-xl font-semibold text-navy">{t("overview.oneTimeTitle")}</h3><p className="mt-3 text-base leading-7 text-muted">{t("overview.oneTimeDescription")}</p></div>
          </div>
        </Container>
      </Section>

      <Section className="bg-[#eaf2ff]">
        <Container className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{t("overview.equipmentTitle")}</h2>
          <div className="grid gap-5 text-base leading-7 text-muted sm:grid-cols-2"><p>{t("overview.equipmentDescription")}</p><p>{t("overview.productsDescription")}</p></div>
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container>
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("overview.processEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("overview.processTitle")}</h2><p className="mt-4 text-lg leading-8 text-muted">{t("overview.processDescription")}</p></div>
          <ol className="mt-10 grid gap-8 border-t border-border pt-8 md:grid-cols-5 md:gap-5">
            {(["tell", "discuss", "visit", "quote", "schedule"] as const).map((id, index) => <li key={id} className="border-t-2 border-primary pt-4"><span className="text-sm font-bold text-primary">0{index + 1}</span><p className="mt-4 text-base font-semibold text-navy">{t(`overview.steps.${id}`)}</p></li>)}
          </ol>
        </Container>
      </Section>

      <Section className="bg-background">
        <Container className="flex flex-col justify-between gap-8 border-l-4 border-primary bg-[#eaf2ff] p-7 sm:flex-row sm:items-center sm:p-10">
          <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("overview.localEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy">{t("overview.localTitle")}</h2><p className="mt-3 max-w-2xl text-base leading-7 text-muted">{t("overview.localDescription")}</p></div>
          <ButtonLink href="/werkgebied" variant="outline" className="shrink-0">{t("overview.localCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink>
        </Container>
      </Section>

      <Section className="bg-navy text-white">
        <Container className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end lg:gap-16"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("overview.finalEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{t("overview.finalTitle")}</h2><p className="mt-5 text-lg leading-8 text-white/70">{t("overview.finalDescription")}</p></div><ButtonLink href="/offerte" size="lg" className="w-full sm:w-auto">{t("overview.finalCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink></Container>
      </Section>
    </>
  );
}
