import { getTranslations } from "next-intl/server";
import { serviceAreaIds } from "@/config/homepage";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function ServiceAreaSection() {
  const t = await getTranslations("homepage.serviceArea");
  const radius = siteConfig.serviceRadiusKm.amount;

  return (
    <Section className="bg-surface">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("title")}</h2>
          <p className="mt-5 text-lg leading-8 text-muted">{t("description", { radius })}</p>
          <ButtonLink href="/werkgebied" variant="outline" className="mt-7">
            {t("cta")}
            <span className="ml-2" aria-hidden="true">→</span>
          </ButtonLink>
        </div>
        <div className="relative overflow-hidden bg-navy p-7 text-white sm:p-10">
          <div className="absolute right-0 top-0 h-full w-1/3 border-l border-white/10 bg-[#173158]" aria-hidden="true" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("listIntro")}</p>
            <p className="mt-5 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">{radius} km</p>
            <p className="mt-2 max-w-xs text-base leading-7 text-white/70">{t("description", { radius })}</p>
            <ul className="mt-8 flex max-w-xl flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-sm text-white/75">
              {serviceAreaIds.slice(0, 6).map((id) => <li key={id}>{t(`areas.${id}`)}</li>)}
            </ul>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/60">{t("boundaryNote", { radius })}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
