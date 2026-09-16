import type { SupportedLocale } from "@/config/site";

export type ServiceId =
  | "office"
  | "commercial"
  | "restaurant"
  | "hotel"
  | "school"
  | "home"
  | "deep"
  | "windows"
  | "postConstruction"
  | "move"
  | "airbnb"
  | "staircase";

export type ServiceDefinition = {
  id: ServiceId;
  category: "commercial" | "residential" | "hospitality" | "shared";
  priority: number;
  complete: boolean;
  internalPath: string;
  pathnames: Record<SupportedLocale, string>;
  imageSrc: string | null;
  imagePosition?: string;
  audienceIds: readonly string[];
  areaIds: readonly string[];
  relatedIds: readonly ServiceId[];
};

export const serviceRegistry = [
  {
    id: "office",
    category: "commercial",
    priority: 1,
    complete: true,
    internalPath: "/diensten/kantoorschoonmaak",
    pathnames: {
      "nl-BE": "/diensten/kantoorschoonmaak",
      "en-BE": "/services/office-cleaning",
    },
    imageSrc: "/images/hero-cleaner-glass.jpg",
    imagePosition: "center",
    audienceIds: ["small", "larger", "companies", "shared", "professional"],
    areaIds: ["desks", "floors", "reception", "meeting", "kitchen", "sanitary", "common"],
    relatedIds: ["commercial", "restaurant", "hotel"],
  },
  {
    id: "commercial",
    category: "commercial",
    priority: 2,
    complete: true,
    internalPath: "/diensten/bedrijfsschoonmaak",
    pathnames: {
      "nl-BE": "/diensten/bedrijfsschoonmaak",
      "en-BE": "/services/commercial-cleaning",
    },
    imageSrc: "/images/hero-cleaner-glass.jpg",
    imagePosition: "center",
    audienceIds: ["businesses", "premises", "property", "common", "shops", "multiUse"],
    areaIds: ["entrances", "corridors", "common", "sanitary", "customer", "floors", "shared"],
    relatedIds: ["office", "restaurant", "hotel"],
  },
  {
    id: "restaurant",
    category: "hospitality",
    priority: 3,
    complete: true,
    internalPath: "/diensten/restaurantschoonmaak",
    pathnames: {
      "nl-BE": "/diensten/restaurantschoonmaak",
      "en-BE": "/services/restaurant-cleaning",
    },
    imageSrc: "/images/service-restaurant-floor.jpg",
    imagePosition: "center",
    audienceIds: ["restaurants", "cafes", "hospitality"],
    areaIds: ["dining", "floors", "entrances", "sanitary", "service", "kitchen"],
    relatedIds: ["commercial", "office", "hotel"],
  },
  {
    id: "hotel",
    category: "hospitality",
    priority: 4,
    complete: true,
    internalPath: "/diensten/hotelschoonmaak",
    pathnames: {
      "nl-BE": "/diensten/hotelschoonmaak",
      "en-BE": "/services/hotel-cleaning",
    },
    imageSrc: "/images/service-hotel.jpg",
    imagePosition: "center",
    audienceIds: ["hotels", "smallHotels", "accommodation"],
    areaIds: ["guestRooms", "corridors", "entrances", "reception", "sanitary", "shared"],
    relatedIds: ["commercial", "office", "restaurant"],
  },
  {
    id: "school",
    category: "shared",
    priority: 5,
    complete: true,
    internalPath: "/diensten/schoolschoonmaak",
    pathnames: { "nl-BE": "/diensten/schoolschoonmaak", "en-BE": "/services/school-cleaning" },
    imageSrc: "/images/service-school-classroom.jpg",
    imagePosition: "center",
    audienceIds: ["schools", "educational", "learning", "administrative"],
    areaIds: ["classrooms", "corridors", "entrances", "staffRooms", "sanitary", "common", "offices", "floors"],
    relatedIds: ["commercial", "office", "deep"],
  },
  {
    id: "home",
    category: "residential",
    priority: 6,
    complete: true,
    internalPath: "/diensten/woningschoonmaak",
    pathnames: { "nl-BE": "/diensten/woningschoonmaak", "en-BE": "/services/home-cleaning" },
    imageSrc: "/images/service-home-cleaning.jpg",
    imagePosition: "center",
    audienceIds: ["houses", "apartments", "residential"],
    areaIds: ["living", "kitchens", "bathrooms", "bedrooms", "floors", "surfaces"],
    relatedIds: ["deep", "move", "windows"],
  },
  {
    id: "deep",
    category: "shared",
    priority: 7,
    complete: true,
    internalPath: "/diensten/grondige-schoonmaak",
    pathnames: { "nl-BE": "/diensten/grondige-schoonmaak", "en-BE": "/services/deep-cleaning" },
    imageSrc: "/images/service-deep-cleaning.jpg",
    imagePosition: "center",
    audienceIds: ["homes", "offices", "commercial", "reset"],
    areaIds: ["surfaces", "edges", "kitchens", "bathrooms", "floors", "glass"],
    relatedIds: ["home", "commercial", "move"],
  },
  {
    id: "windows",
    category: "shared",
    priority: 8,
    complete: true,
    internalPath: "/diensten/ramenreiniging",
    pathnames: { "nl-BE": "/diensten/ramenreiniging", "en-BE": "/services/window-cleaning" },
    imageSrc: "/images/service-window-cleaning.jpg",
    imagePosition: "center",
    audienceIds: ["homes", "offices", "commercial", "accessible"],
    areaIds: ["interior", "exterior", "frames", "sills", "glass"],
    relatedIds: ["home", "office", "commercial"],
  },
  {
    id: "postConstruction",
    category: "shared",
    priority: 9,
    complete: true,
    internalPath: "/diensten/opleveringsschoonmaak",
    pathnames: { "nl-BE": "/diensten/opleveringsschoonmaak", "en-BE": "/services/post-construction-cleaning" },
    imageSrc: "/images/service-post-construction.jpg",
    imagePosition: "center",
    audienceIds: ["newProperties", "renovations", "contractors", "residentialOwners", "commercial"],
    areaIds: ["dust", "floors", "surfaces", "sanitary", "windows", "residue"],
    relatedIds: ["deep", "commercial", "windows"],
  },
  {
    id: "move",
    category: "shared",
    priority: 10,
    complete: true,
    internalPath: "/diensten/verhuisschoonmaak",
    pathnames: { "nl-BE": "/diensten/verhuisschoonmaak", "en-BE": "/services/move-in-move-out-cleaning" },
    imageSrc: "/images/service-move-cleaning.jpg",
    imagePosition: "center",
    audienceIds: ["tenants", "owners", "landlords", "apartments", "houses"],
    areaIds: ["floors", "kitchens", "bathrooms", "cupboards", "windows", "surfaces"],
    relatedIds: ["home", "deep", "windows"],
  },
  {
    id: "airbnb",
    category: "hospitality",
    priority: 11,
    complete: true,
    internalPath: "/diensten/airbnb-schoonmaak",
    pathnames: { "nl-BE": "/diensten/airbnb-schoonmaak", "en-BE": "/services/airbnb-cleaning" },
    imageSrc: "/images/service-airbnb-cleaning.jpg",
    imagePosition: "center",
    audienceIds: ["hosts", "shortStay", "apartments"],
    areaIds: ["living", "kitchens", "bathrooms", "bedrooms", "floors", "surfaces"],
    relatedIds: ["home", "deep", "hotel"],
  },
  {
    id: "staircase",
    category: "shared",
    priority: 12,
    complete: true,
    internalPath: "/diensten/trappenhal-schoonmaak",
    pathnames: { "nl-BE": "/diensten/trappenhal-schoonmaak", "en-BE": "/services/staircase-cleaning" },
    imageSrc: "/images/service-staircase-cleaning.jpg",
    imagePosition: "center",
    audienceIds: ["apartmentBuildings", "propertyCompanies", "residentialBuildings", "commercialShared"],
    areaIds: ["staircases", "landings", "corridors", "entrances", "lifts", "sanitary", "floors", "handrails"],
    relatedIds: ["commercial", "deep", "windows"],
  },
] as const satisfies readonly ServiceDefinition[];

export function getServiceById(id: ServiceId): ServiceDefinition | undefined {
  return serviceRegistry.find((service) => service.id === id);
}

export function getServiceByInternalPath(internalPath: string) {
  return serviceRegistry.find((service) => service.internalPath === internalPath);
}

export function resolveService(locale: SupportedLocale, slug: string) {
  return serviceRegistry.find((service) => service.pathnames[locale].split("/").at(-1) === slug);
}

export function getCompletedServices() {
  return serviceRegistry.filter((service) => service.complete);
}
