import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RouteShell } from "@/components/shared/route-shell";
import { getUnfinishedRouteMetadata } from "@/lib/route-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getUnfinishedRouteMetadata((await params).locale, "quote");
}

export default async function QuotePage({ params }: Props) {
  setRequestLocale((await params).locale);
  return <RouteShell pageKey="quote" />;
}
