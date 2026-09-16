import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function AboutSection() {
  const t = await getTranslations("homepage.about");

  return (
    <Section className="bg-background">
      <Container className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("title")}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{t("description")}</p>
        </div>
        <div className="border-t-2 border-primary pt-6">
          <p className="text-xl font-semibold text-navy">{t("tagline")}</p>
          <ButtonLink href="/over-ons" variant="outline" className="mt-6">{t("cta")}</ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
