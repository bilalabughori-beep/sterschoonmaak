import { getTranslations } from "next-intl/server";
import { propertyTypeIds } from "@/config/homepage";
import { Container } from "@/components/ui/container";
import { Section, SectionHeader } from "@/components/ui/section";

export async function PropertyTypesSection() {
  const t = await getTranslations("homepage.propertyTypes");

  return (
    <Section className="bg-background">
      <Container>
        <div className="grid gap-8 border-b border-border pb-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <SectionHeader>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("title")}</h2>
          </SectionHeader>
          <p className="max-w-2xl text-lg leading-8 text-muted">{t("description")}</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {propertyTypeIds.map((id, index) => (
            <article key={id} className="group border border-border bg-surface p-5 transition-colors hover:border-primary">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold tracking-[0.14em] text-primary">0{index + 1}</span>
                <span className="h-2.5 w-2.5 border border-primary transition-colors group-hover:bg-primary" aria-hidden="true" />
              </div>
              <h3 className="mt-8 text-lg font-semibold text-navy">{t(`items.${id}.title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{t(`items.${id}.description`)}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
