import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getServiceById, type ServiceDefinition, type ServiceId } from "@/config/services";
import type { SupportedLocale } from "@/config/site";
import { getServiceFallbackValue } from "@/config/service-content";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";
import { ServiceBreadcrumbs } from "@/components/services/breadcrumbs";
import { routing } from "@/i18n/routing";

type Translate = (key: string, values?: Record<string, string | number>) => string;

const scheduleIds = {
  office: ["daily", "several", "weekly", "custom"],
  commercial: ["recurring", "oneTime", "custom"],
  restaurant: ["beforeAfter", "recurring", "flexible"],
  hotel: ["regular", "custom", "asNeeded"],
  school: ["outsideHours", "recurring", "several", "custom"],
  home: ["oneTime", "recurring", "deep", "custom"],
  deep: ["oneTime", "periodic", "beforeEvent", "custom"],
  windows: ["oneTime", "recurring", "seasonal", "custom"],
  postConstruction: ["afterWorks", "oneTime", "staged", "custom"],
  move: ["beforeMove", "afterMove", "emptyProperty", "custom"],
  airbnb: ["betweenStays", "recurring", "flexible"],
  staircase: ["weekly", "several", "custom"],
} as const;

const faqIds = {
  office: ["hours", "recurring", "products", "pricing", "areas"],
  commercial: ["types", "contracts", "scope", "equipment", "pricing"],
  restaurant: ["hours", "recurring", "areas", "scope", "pricing"],
  hotel: ["schedules", "areas", "products", "pricing", "scope"],
  school: ["hours", "recurring", "areas", "products", "pricing"],
  home: ["scope", "recurring", "oneTime", "care", "pricing"],
  deep: ["difference", "contexts", "areas", "hazards", "pricing"],
  windows: ["areas", "insideOutside", "highRise", "frames", "pricing"],
  postConstruction: ["residue", "hazards", "areas", "windows", "pricing"],
  move: ["timing", "areas", "deposit", "windows", "pricing"],
  airbnb: ["linen", "recurring", "scope", "turnover", "pricing"],
  staircase: ["frequency", "areas", "handrails", "custom", "pricing"],
} as const;

function ServiceImage({ service, t, className = "" }: { service: ServiceDefinition; t: Translate; className?: string }) {
  if (!service.imageSrc) return null;

  return (
    <figure className={`relative min-w-0 min-h-[20rem] overflow-hidden rounded-2xl bg-navy sm:min-h-[28rem] ${className}`}>
      <Image
        src={service.imageSrc}
        alt={t(`items.${service.id}.imageAlt`)}
        fill
        priority
        sizes="(min-width: 1024px) 48vw, 100vw"
        className="object-cover"
        style={{ objectPosition: service.imagePosition ?? "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-transparent to-transparent" aria-hidden="true" />
      <figcaption className="absolute inset-x-0 bottom-0 border-l-2 border-[#9fc0ff] px-6 py-5 text-base font-semibold text-white sm:px-8">{t(`items.${service.id}.imageCaption`)}</figcaption>
    </figure>
  );
}

function ServiceAudience({ service, t }: { service: ServiceDefinition; t: Translate }) {
  return (
    <Section className="bg-surface">
      <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("shared.fitEyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t(`items.${service.id}.audienceTitle`)}</h2>
          <ul className="mt-7 space-y-3 border-t border-border pt-6 text-base text-navy">
            {service.audienceIds.map((id) => <li key={id} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 bg-primary" aria-hidden="true" />{t(`items.${service.id}.audience.${id}`)}</li>)}
          </ul>
        </div>
        <div className="border-l-2 border-primary pl-6 sm:pl-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("shared.scopeEyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t(`items.${service.id}.areasTitle`)}</h2>
          <ul className="mt-7 grid gap-x-8 gap-y-3 border-t border-border pt-6 text-base text-muted sm:grid-cols-2">
            {service.areaIds.map((id) => <li key={id}>{t(`items.${service.id}.areas.${id}`)}</li>)}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

function ServiceApproach({ service, t, dark = false }: { service: ServiceDefinition; t: Translate; dark?: boolean }) {
  const surface = dark ? "bg-navy text-white" : "bg-background text-navy";
  return (
    <Section className={surface}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div><p className={`text-sm font-bold uppercase tracking-[0.16em] ${dark ? "text-[#9fc0ff]" : "text-primary"}`}>{t("shared.approachEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t(`items.${service.id}.approachTitle`)}</h2><p className={`mt-5 text-lg leading-8 ${dark ? "text-white/70" : "text-muted"}`}>{t(`items.${service.id}.approachDescription`)}</p></div>
          <div className={`grid gap-px ${dark ? "bg-white/15" : "bg-border"} sm:grid-cols-3`}>
            {(["scope", "communication", "equipment"] as const).map((id) => <div key={id} className={`p-6 sm:p-7 ${dark ? "bg-navy" : "bg-surface"}`}><h3 className="text-lg font-semibold">{t(`items.${service.id}.approachPoints.${id}.title`)}</h3><p className={`mt-3 text-sm leading-6 ${dark ? "text-white/65" : "text-muted"}`}>{t(`items.${service.id}.approachPoints.${id}.description`)}</p></div>)}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ServiceSchedule({ service, t, dark = false }: { service: ServiceDefinition; t: Translate; dark?: boolean }) {
  const ids = scheduleIds[service.id as keyof typeof scheduleIds] ?? [];
  return (
    <Section className={dark ? "bg-navy text-white" : "bg-[#eaf2ff]"}>
      <Container>
        <div className="max-w-2xl"><p className={`text-sm font-bold uppercase tracking-[0.16em] ${dark ? "text-[#9fc0ff]" : "text-primary"}`}>{t("shared.scheduleEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t(`items.${service.id}.scheduleTitle`)}</h2><p className={`mt-4 text-lg leading-8 ${dark ? "text-white/70" : "text-muted"}`}>{t(`items.${service.id}.scheduleDescription`)}</p></div>
        <ul className={`mt-10 grid gap-3 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4 ${dark ? "border-white/20" : "border-[#b9c9dd]"}`}>
          {ids.map((id) => <li key={id} className={`border-t-2 pt-4 text-base font-semibold ${dark ? "border-[#8bb4ff]" : "border-primary"}`}>{t(`items.${service.id}.schedules.${id}`)}</li>)}
        </ul>
      </Container>
    </Section>
  );
}

function ServiceFeature({ service, t }: { service: ServiceDefinition; t: Translate }) {
  return (
    <Section className="bg-surface">
      <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
        <div className="border-l-4 border-primary bg-[#eaf2ff] p-7 sm:p-10"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t(`items.${service.id}.featureEyebrow`)}</p><h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t(`items.${service.id}.featureTitle`)}</h2><p className="mt-5 max-w-xl text-lg leading-8 text-muted">{t(`items.${service.id}.featureDescription`)}</p></div>
        <div className="border-t-2 border-primary pt-6"><h3 className="text-xl font-semibold text-navy">{t(`items.${service.id}.equipmentTitle`)}</h3><p className="mt-3 text-base leading-7 text-muted">{t(`items.${service.id}.equipmentDescription`)}</p><p className="mt-5 border-t border-border pt-5 text-sm leading-6 text-muted">{t(`items.${service.id}.productsNote`)}</p></div>
      </Container>
    </Section>
  );
}

function ServiceProcess({ service, t }: { service: ServiceDefinition; t: Translate }) {
  return (
    <Section className="bg-background">
      <Container>
        <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("shared.processEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t(`items.${service.id}.processTitle`)}</h2><p className="mt-4 text-lg leading-8 text-muted">{t(`items.${service.id}.processDescription`)}</p></div>
        <ol className="mt-10 grid gap-8 border-t border-border pt-8 md:grid-cols-4 md:gap-5">{(["tell", "discuss", "visit", "quote"] as const).map((id, index) => <li key={id} className="border-t-2 border-primary pt-4"><span className="text-sm font-bold text-primary">0{index + 1}</span><p className="mt-4 text-base font-semibold text-navy">{t(`shared.processSteps.${id}`)}</p></li>)}</ol>
      </Container>
    </Section>
  );
}

function ServiceFaq({ service, t }: { service: ServiceDefinition; t: Translate }) {
  const ids = faqIds[service.id as keyof typeof faqIds] ?? [];
  return (
    <Section className="bg-surface">
      <Container className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("shared.faqEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t(`items.${service.id}.faqTitle`)}</h2></div>
        <div className="divide-y divide-border border-y border-border">{ids.map((id) => <details key={id} className="group py-4 first:pt-5 last:pb-5"><summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-base font-semibold text-navy marker:hidden [&::-webkit-details-marker]:hidden">{t(`items.${service.id}.faqs.${id}.question`)}<span className="text-2xl font-normal leading-none text-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p className="max-w-2xl pr-8 pt-3 text-sm leading-6 text-muted">{t(`items.${service.id}.faqs.${id}.answer`)}</p></details>)}</div>
      </Container>
    </Section>
  );
}

function RelatedServices({ service, t }: { service: ServiceDefinition; t: Translate }) {
  const related = service.relatedIds.map((id) => getServiceById(id)).filter((item): item is ServiceDefinition => Boolean(item?.complete));
  const businessServiceIds: readonly ServiceId[] = ["office", "commercial", "restaurant", "hotel", "school", "staircase"];
  const businessRelevant = businessServiceIds.includes(service.id);
  return (
    <Section className="bg-background">
      <Container><div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("shared.relatedEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("shared.relatedTitle")}</h2></div><Link href="/diensten" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">{t("shared.allServices")}<span className="ml-2" aria-hidden="true">→</span></Link></div><div className="mt-8 grid gap-3 sm:grid-cols-3">{related.map((item) => <Link key={item.id} href={item.internalPath as never} className="border border-border bg-surface p-5 transition-colors hover:border-primary"><span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{t(`categories.${item.category}`)}</span><span className="mt-7 block text-lg font-semibold text-navy">{t(`items.${item.id}.title`)}</span><span className="mt-2 block text-sm text-muted">{t(`items.${item.id}.shortDescription`)}</span></Link>)}</div>{businessRelevant ? <p className="mt-8 text-base text-muted"><Link href="/zakelijk" className="font-semibold text-primary underline-offset-4 hover:underline">{t("shared.businessLink")}<span className="ml-2" aria-hidden="true">→</span></Link></p> : null}</Container>
    </Section>
  );
}

export async function ServicePage({ serviceId, rawLocale }: { serviceId: ServiceId; rawLocale: string }) {
  const service = getServiceById(serviceId);
  if (!service || !service.complete) return null;

  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  const locale = rawLocale as SupportedLocale;
  setRequestLocale(locale);
  const tRaw = await getTranslations("services");
  const t = ((key: string, values?: Record<string, string | number>) => {
    if (!tRaw.has(key)) {
      return getServiceFallbackValue(serviceId, locale, key) ?? key;
    }

    try {
      const translated = tRaw(key, values);
      const missing = translated === key || translated.endsWith(`.${key}`);
      return missing ? getServiceFallbackValue(serviceId, locale, key) ?? translated : translated;
    } catch {
      return getServiceFallbackValue(serviceId, locale, key) ?? key;
    }
  }) as Translate;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t(`items.${service.id}.title`),
    serviceType: t(`items.${service.id}.title`),
    description: t(`items.${service.id}.metaDescription`),
    areaServed: { "@type": "Place", name: t("shared.areaServed") },
    provider: { "@type": "LocalBusiness", name: "Ster Schoonmaak" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="border-b border-border bg-background">
        <Container className="py-10 sm:py-14 lg:py-16">
          <ServiceBreadcrumbs current={t(`overview.items.${service.id}.title`)} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
            <div className="max-w-2xl min-w-0"><p className="break-words text-sm font-bold uppercase tracking-[0.16em] text-primary">{t(`items.${service.id}.eyebrow`)}</p><h1 className={`mt-4 max-w-xl break-normal font-semibold leading-[1.05] tracking-[-0.035em] text-navy sm:text-5xl ${serviceId === "staircase" ? "text-[2.15rem] leading-[1.08]" : "text-[2.7rem]"}`}>{t(`items.${service.id}.title`)}</h1><p className="mt-6 max-w-xl break-words text-lg leading-8 text-muted">{t(`items.${service.id}.intro`)}</p><ButtonLink href="/offerte" size="lg" className="mt-8">{t("shared.primaryCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink></div>
            <ServiceImage service={service} t={t} />
          </div>
        </Container>
      </section>

      {serviceId === "commercial" || serviceId === "deep" ? <ServiceApproach service={service} t={t} dark /> : null}
      {serviceId !== "deep" && serviceId !== "airbnb" ? <ServiceAudience service={service} t={t} /> : null}
      {serviceId === "school" || serviceId === "home" || serviceId === "windows" || serviceId === "move" || serviceId === "staircase" ? <ServiceSchedule service={service} t={t} /> : null}
      {serviceId === "airbnb" ? <ServiceSchedule service={service} t={t} dark /> : null}
      {serviceId === "postConstruction" ? <ServiceFeature service={service} t={t} /> : null}
      {serviceId === "school" || serviceId === "home" || serviceId === "deep" || serviceId === "windows" || serviceId === "postConstruction" || serviceId === "move" || serviceId === "airbnb" || serviceId === "staircase" ? <ServiceFeature service={service} t={t} /> : null}
      {serviceId === "deep" || serviceId === "airbnb" ? <ServiceAudience service={service} t={t} /> : null}
      {serviceId === "deep" ? <ServiceSchedule service={service} t={t} /> : null}
      {serviceId === "postConstruction" || serviceId === "airbnb" ? <ServiceApproach service={service} t={t} /> : null}
      {serviceId === "staircase" ? <ServiceApproach service={service} t={t} /> : null}
      {serviceId === "windows" ? <ServiceApproach service={service} t={t} /> : null}
      {serviceId === "home" || serviceId === "move" || serviceId === "school" ? <ServiceApproach service={service} t={t} /> : null}
      {serviceId === "postConstruction" ? <ServiceSchedule service={service} t={t} dark /> : null}
      {serviceId === "office" ? <ServiceSchedule service={service} t={t} /> : null}
      {serviceId === "restaurant" ? <ServiceSchedule service={service} t={t} dark /> : null}
      {serviceId === "hotel" ? <ServiceFeature service={service} t={t} /> : null}
      {serviceId === "commercial" || serviceId === "office" || serviceId === "restaurant" ? <ServiceFeature service={service} t={t} /> : null}
      {serviceId === "hotel" ? <ServiceApproach service={service} t={t} dark /> : null}
      {serviceId === "office" || serviceId === "restaurant" ? <ServiceApproach service={service} t={t} /> : null}
      {serviceId === "commercial" || serviceId === "hotel" ? <ServiceSchedule service={service} t={t} /> : null}
      <ServiceProcess service={service} t={t} />
      <ServiceFaq service={service} t={t} />
      <RelatedServices service={service} t={t} />
      <Section className="bg-navy text-white"><Container className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end lg:gap-16"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("shared.finalEyebrow")}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{t(`items.${service.id}.finalTitle`)}</h2><p className="mt-5 text-lg leading-8 text-white/70">{t("shared.finalDescription")}</p></div><ButtonLink href="/offerte" size="lg" className="w-full sm:w-auto">{t("shared.primaryCta")}<span className="ml-2" aria-hidden="true">→</span></ButtonLink></Container></Section>
    </>
  );
}
