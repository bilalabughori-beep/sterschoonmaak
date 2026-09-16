export const routeShells = {
  services: { internalPath: "/diensten" },
  business: { internalPath: "/zakelijk" },
  serviceArea: { internalPath: "/werkgebied" },
  about: { internalPath: "/over-ons" },
  contact: { internalPath: "/contact" },
  quote: { internalPath: "/offerte" },
  privacy: { internalPath: "/privacybeleid" },
  cookies: { internalPath: "/cookiebeleid" },
} as const;

export type RouteShellKey = keyof typeof routeShells;
