import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ContactPageContent } from "@/components/contact/contact-page";
import { getContactMetadata } from "@/lib/route-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getContactMetadata((await params).locale);
}

export default async function ContactPage({ params }: Props) {
  setRequestLocale((await params).locale);
  return <ContactPageContent />;
}
