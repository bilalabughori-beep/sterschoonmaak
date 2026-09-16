import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RouteShell } from "@/components/shared/route-shell";
import { getUnfinishedRouteMetadata } from "@/lib/route-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getUnfinishedRouteMetadata((await params).locale, "about");
}

export default async function AboutPage({ params }: Props) {
  setRequestLocale((await params).locale);
  return <RouteShell pageKey="about" />;
}
