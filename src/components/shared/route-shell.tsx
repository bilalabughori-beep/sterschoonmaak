import { getTranslations } from "next-intl/server";
import type { RouteShellKey } from "@/config/route-shells";
import { NarrowContainer } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function RouteShell({ pageKey }: { pageKey: RouteShellKey }) {
  const t = await getTranslations("routeShell");

  return (
    <Section>
      <NarrowContainer>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("eyebrow")}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
          {t(`${pageKey}.title`)}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{t(`${pageKey}.description`)}</p>
      </NarrowContainer>
    </Section>
  );
}
