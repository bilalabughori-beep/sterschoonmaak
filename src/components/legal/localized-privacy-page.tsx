import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { NarrowContainer } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export async function LocalizedPrivacyPage() {
  const t = await getTranslations("legacyPrivacy");
  return <Section className="bg-background"><NarrowContainer><Breadcrumbs current={t("breadcrumb")} /><p className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-primary">Ster Schoonmaak</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">{t("title")}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{t("intro")}</p><div className="mt-12 space-y-10 text-base leading-8 text-muted"><section><h2 className="text-2xl font-semibold tracking-tight text-navy">{t("receivedTitle")}</h2><p className="mt-3">{t("receivedText")}</p></section><section><h2 className="text-2xl font-semibold tracking-tight text-navy">{t("useTitle")}</h2><p className="mt-3">{t("useText")}</p></section><section><h2 className="text-2xl font-semibold tracking-tight text-navy">{t("providersTitle")}</h2><p className="mt-3">{t("providersText")}</p></section><section><h2 className="text-2xl font-semibold tracking-tight text-navy">{t("rightsTitle")}</h2><p className="mt-3">{t("rightsText")}</p></section><section><h2 className="text-2xl font-semibold tracking-tight text-navy">{t("contactTitle")}</h2><p className="mt-3">{t("contactText")} <a className="font-semibold text-primary underline" href="mailto:info@sterschoonmaak.be">info@sterschoonmaak.be</a>.</p></section></div></NarrowContainer></Section>;
}
