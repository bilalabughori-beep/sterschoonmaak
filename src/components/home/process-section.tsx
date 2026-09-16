import { getTranslations } from "next-intl/server";
import { processStepIds } from "@/config/homepage";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function ProcessSection() {
  const t = await getTranslations("homepage.process");

  return (
    <Section className="bg-[#eaf2ff]">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-lg leading-8 text-muted">{t("description")}</p>
        </div>
        <ol className="mt-12 grid gap-8 border-t border-[#b9c9dd] pt-8 md:grid-cols-4 md:gap-5">
          {processStepIds.map((id, index) => (
            <li key={id} className="relative border-t-2 border-primary pt-5">
              <span className="text-sm font-bold text-primary">0{index + 1}</span>
              <h3 className="mt-5 text-lg font-semibold text-navy">{t(`steps.${id}.title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{t(`steps.${id}.description`)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
