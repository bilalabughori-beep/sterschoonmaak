export const supportedLocales = ["nl-BE", "en-BE"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

type NullableString = string | null;

type BusinessHours = Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  NullableString
>;

export interface SiteConfig {
  brandName: string;
  siteUrl: string;
  tagline: string;
  location: string;
  serviceRadiusKm: {
    amount: number;
    approximate: boolean;
  };
  contact: {
    phoneDisplay: string | null;
    phone: NullableString;
    whatsapp: NullableString;
    email: NullableString;
  };
  social: {
    facebook: NullableString;
    instagram: NullableString;
    tiktok: NullableString;
  };
  businessHours: BusinessHours;
  legal: {
    vatNumber: NullableString;
    enterpriseNumber: NullableString;
    publicAddress: NullableString;
  };
  defaultLocale: SupportedLocale;
  supportedLocales: readonly SupportedLocale[];
}

export const siteConfig: SiteConfig = {
  brandName: "Ster Schoonmaak",
  siteUrl: "https://sterschoonmaak.be",
  tagline: "Schoon • Stipt • Betrouwbaar",
  location: "Ghent, Belgium",
  serviceRadiusKm: {
    amount: 30,
    approximate: true,
  },
  contact: {
    phoneDisplay: "+32 10 409 95 981",
    phone: "+321040995981",
    whatsapp: "+32471795061",
    email: "info@sterschoonmaak.be",
  },
  social: {
    facebook: null,
    instagram: null,
    tiktok: null,
  },
  businessHours: {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  },
  legal: {
    vatNumber: null,
    enterpriseNumber: null,
    publicAddress: null,
  },
  defaultLocale: "nl-BE",
  supportedLocales,
};
