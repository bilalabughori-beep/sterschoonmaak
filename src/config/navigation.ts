export const navigationItems = [
  { key: "home", href: "/" },
  { key: "services", href: "/diensten" },
  { key: "business", href: "/zakelijk" },
  { key: "serviceArea", href: "/werkgebied" },
  { key: "about", href: "/over-ons" },
  { key: "contact", href: "/contact" },
] as const;

export const quotePath = "/offerte" as const;

export type NavigationItem = (typeof navigationItems)[number];
export type NavigationKey = NavigationItem["key"];
