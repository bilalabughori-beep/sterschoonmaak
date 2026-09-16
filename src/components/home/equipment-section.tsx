import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function EquipmentSection() {
  const t = await getTranslations("homepage.equipment");

  return (
    <Section className="bg-[#eaf2ff]">
      <Container>
        <div className="grid gap-6 border-y border-border py-8 sm:grid-cols-[0.7fr_1.3fr] sm:gap-12 sm:py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{t("title")}</h2>
          <div className="grid gap-4 text-base leading-7 text-muted sm:grid-cols-2">
            <p>{t("equipment")}</p>
            <p>{t("products")}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
