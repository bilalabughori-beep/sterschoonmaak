import type { MetadataRoute } from "next";
import { serviceRegistry } from "@/config/services";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

const publicPaths = [
  "/",
  "/en",
  "/diensten",
  "/services",
  "/contact",
  "/klacht",
  "/en/complaint",
  "/zakelijk",
  "/business-cleaning",
  ...serviceRegistry.flatMap((service) => [service.pathnames["nl-BE"], service.pathnames["en-BE"]]),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...new Set(publicPaths)].map((path) => ({
    url: new URL(path, siteConfig.siteUrl).toString(),
    changeFrequency: "monthly",
    priority: path === "/" || path === "/en" ? 1 : 0.7,
  }));
}
