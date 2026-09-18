import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ComplaintForm } from "@/components/contact/complaint-form";
import { routing } from "@/i18n/routing";

export function generateStaticParams() { return routing.locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!hasLocale(routing.locales, locale)) notFound(); setRequestLocale(locale); const t = await getTranslations("complaintPage"); return { title: t("title"), description: t("description") }; }
export default async function ComplaintPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!hasLocale(routing.locales, locale)) notFound(); setRequestLocale(locale); const t = await getTranslations("complaintPage"); return <><section className="border-b border-border bg-background"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("eyebrow")}</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-navy sm:text-5xl">{t("heading")}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{t("description")}</p></div></section><ComplaintForm /></>; }
