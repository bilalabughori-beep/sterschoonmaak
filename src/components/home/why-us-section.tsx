import { getTranslations } from "next-intl/server";
import { benefitIds } from "@/config/homepage";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function WhyUsSection() {
  const t = await getTranslations("homepage.why");

  return (
    <Section className="bg-background">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("title")}</h2>
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-10 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefitIds.map((id) => (
            <article key={id} className="border-l-2 border-[#8bb4ff] pl-5">
              <h3 className="text-lg font-semibold text-navy">{t(`items.${id}.title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{t(`items.${id}.description`)}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
