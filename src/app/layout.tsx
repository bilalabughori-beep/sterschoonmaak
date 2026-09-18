import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.brandName,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: "Professional cleaning services in Ghent and surrounding areas.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteConfig.siteUrl,
    siteName: siteConfig.brandName,
    title: siteConfig.brandName,
    description: "Professional cleaning services in Ghent and surrounding areas.",
    locale: "nl_BE",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.brandName,
    description: "Professional cleaning services in Ghent and surrounding areas.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
