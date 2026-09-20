import type { MetadataRoute } from "next";
import { serviceRegistry } from "@/config/services";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

const publicPaths = [
  "/",
  "/en",
  "/diensten",
  "/en/services",
  "/zakelijk",
  "/en/business-cleaning",
  "/werkgebied",
  "/en/service-area",
  "/over-ons",
  "/en/about",
  "/contact",
  "/en/contact",
  "/offerte",
  "/en/quote",
  "/klacht",
  "/en/complaint",
  "/cookiebeleid",
  "/en/cookie-policy",
  "/privacy",
  "/terms",
  ...serviceRegistry.flatMap((service) => [service.pathnames["nl-BE"], service.pathnames["en-BE"]]),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...new Set(publicPaths)].map((path) => ({
    url: new URL(path, siteConfig.siteUrl).toString(),
    changeFrequency: "monthly",
    priority: path === "/" || path === "/en" ? 1 : 0.7,
  }));
}
