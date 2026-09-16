import { getTranslations } from "next-intl/server";
import { featuredServiceIds, supportingServiceIds } from "@/config/homepage";
import { serviceRegistry } from "@/config/services";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";

export async function ServicesSection() {
  const t = await getTranslations("homepage.services");

  return (
    <Section className="bg-surface">
      <Container>
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("title")}</h2>
            <p className="mt-4 text-lg leading-8 text-muted">{t("description")}</p>
          </div>
          <ButtonLink href="/diensten" variant="outline" className="shrink-0 self-start sm:self-auto">
            {t("cta")}
            <span className="ml-2" aria-hidden="true">→</span>
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <div className="divide-y divide-border border-y border-border">
            {featuredServiceIds.map((id, index) => (
              <article key={id} className="group flex gap-5 py-5">
                <span className="mt-1 text-sm font-bold text-primary" aria-hidden="true">0{index + 1}</span>
                <div>
                  {(() => {
                    const service = serviceRegistry.find((item) => item.id === id);
                    return service?.complete ? <Link href={service.internalPath} className="text-lg font-semibold text-navy transition-colors hover:text-primary">{t(`items.${id}.title`)}</Link> : <h3 className="text-lg font-semibold text-navy">{t(`items.${id}.title`)}</h3>;
                  })()}
                  <p className="mt-2 text-sm leading-6 text-muted">{t(`items.${id}.description`)}</p>
                </div>
              </article>
            ))}
          </div>
          <aside className="bg-navy p-7 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("supportingEyebrow")}</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{t("supportingTitle")}</h3>
            <ul className="mt-6 divide-y divide-white/15 border-y border-white/15">
              {supportingServiceIds.map((id) => (
                <li key={id} className="py-4 text-sm leading-6 text-white/80">
                  {(() => {
                    const service = serviceRegistry.find((item) => item.id === id);
                    return service?.complete ? <Link href={service.internalPath as never} className="transition-colors hover:text-white hover:underline">{t(`items.${id}.title`)}</Link> : t(`items.${id}.title`);
                  })()}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
