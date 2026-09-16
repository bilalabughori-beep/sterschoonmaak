import { defineRouting } from "next-intl/routing";
import { siteConfig } from "@/config/site";
import { serviceRegistry } from "@/config/services";

const servicePathnames = Object.fromEntries(
  serviceRegistry.map((service) => [
    service.internalPath,
    service.pathnames,
  ]),
) as unknown as {
  [K in (typeof serviceRegistry)[number]["internalPath"]]: Record<string, string>;
};

export const pathnames = {
  "/": "/",
  "/diensten": {
    "nl-BE": "/diensten",
    "en-BE": "/services",
  },
  "/zakelijk": {
    "nl-BE": "/zakelijk",
    "en-BE": "/business-cleaning",
  },
  "/werkgebied": {
    "nl-BE": "/werkgebied",
    "en-BE": "/service-area",
  },
  "/over-ons": {
    "nl-BE": "/over-ons",
    "en-BE": "/about",
  },
  "/contact": "/contact",
  "/offerte": {
    "nl-BE": "/offerte",
    "en-BE": "/quote",
  },
  "/privacybeleid": {
    "nl-BE": "/privacybeleid",
    "en-BE": "/privacy-policy",
  },
  "/cookiebeleid": {
    "nl-BE": "/cookiebeleid",
    "en-BE": "/cookie-policy",
  },
  ...servicePathnames,
} as const;

export const routing = defineRouting({
  locales: siteConfig.supportedLocales,
  defaultLocale: siteConfig.defaultLocale,
  localeDetection: false,
  localePrefix: {
    mode: "as-needed",
    prefixes: {
      "en-BE": "/en",
    },
  },
  pathnames,
});
