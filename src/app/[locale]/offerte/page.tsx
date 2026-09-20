import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { QuoteForm } from "@/components/pages/quote-form";
import { getLocalizedPageMetadata } from "@/lib/route-metadata";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getLocalizedPageMetadata((await params).locale, "quotePage", { nl: "/offerte", en: "/en/quote" });
}

export default async function QuotePage({ params }: Props) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("quotePage");
  return <><section className="border-b border-border bg-background"><Container className="py-10 sm:py-14 lg:py-16"><Breadcrumbs current={t("breadcrumb")} /><div className="mt-10 max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("heroEyebrow")}</p><h1 className="mt-4 text-[2.7rem] font-semibold leading-[1.05] tracking-[-0.035em] text-navy sm:text-5xl">{t("heroTitle")}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{t("heroDescription")}</p></div></Container></section><Section className="bg-surface"><Container className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20"><div className="rounded-2xl border border-border bg-background p-6 sm:p-8"><QuoteForm /></div><aside className="self-start rounded-2xl bg-navy p-7 text-white sm:p-8 lg:sticky lg:top-32"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t("asideEyebrow")}</p><h2 className="mt-3 text-2xl font-semibold">{t("asideTitle")}</h2><p className="mt-4 text-base leading-7 text-white/70">{t("asideDescription")}</p><ul className="mt-6 space-y-3 text-sm leading-6 text-white/80"><li>✓ {t("asidePoints.scope")}</li><li>✓ {t("asidePoints.location")}</li><li>✓ {t("asidePoints.followUp")}</li></ul></aside></Container></Section></>;
}
