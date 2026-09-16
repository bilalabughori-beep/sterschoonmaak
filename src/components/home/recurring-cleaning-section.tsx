import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function RecurringCleaningSection() {
  const t = await getTranslations("homepage.recurring");

  return (
    <Section className="bg-surface">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <div className="relative border-l-4 border-primary bg-[#eaf2ff] p-7 sm:p-10">
          <span className="text-sm font-bold uppercase tracking-[0.16em] text-navy/70">{t("visualKicker")}</span>
          <p className="mt-20 max-w-xs text-3xl font-semibold leading-tight tracking-tight text-navy sm:mt-28 sm:text-4xl">{t("visualTitle")}</p>
          <div className="mt-8 h-px w-20 bg-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-5xl">{t("title")}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{t("description")}</p>
          <ul className="mt-7 grid gap-3 text-sm font-semibold text-navy sm:grid-cols-2">
            {(["daily", "several", "weekly", "custom"] as const).map((id) => (
              <li key={id} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                {t(`frequencies.${id}`)}
              </li>
            ))}
          </ul>
          <ButtonLink href="/offerte" variant="secondary" className="mt-8">
            {t("cta")}
            <span className="ml-2" aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
