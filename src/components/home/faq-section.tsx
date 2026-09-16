import { getTranslations } from "next-intl/server";
import { faqIds } from "@/config/homepage";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function FaqSection() {
  const t = await getTranslations("homepage.faq");

  return (
    <Section className="bg-surface">
      <Container className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-base leading-7 text-muted">{t("description")}</p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {faqIds.map((id) => (
            <details key={id} className="group py-4 first:pt-5 last:pb-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-base font-semibold text-navy marker:hidden [&::-webkit-details-marker]:hidden">
                {t(`items.${id}.question`)}
                <span className="mt-0.5 text-2xl font-normal leading-none text-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pr-10 pt-3 text-sm leading-6 text-muted">{t(`items.${id}.answer`)}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
