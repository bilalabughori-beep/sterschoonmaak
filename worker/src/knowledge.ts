import type { Locale, ServiceId } from "./types";

export const SERVICE_LABELS: Record<ServiceId, Record<Locale, string>> = {
  office: { "en-BE": "Office cleaning", "nl-BE": "Kantoorschoonmaak" },
  commercial: { "en-BE": "Commercial cleaning", "nl-BE": "Bedrijfsschoonmaak" },
  restaurant: { "en-BE": "Restaurant cleaning", "nl-BE": "Restaurantschoonmaak" },
  hotel: { "en-BE": "Hotel cleaning", "nl-BE": "Hotelschoonmaak" },
  school: { "en-BE": "School cleaning", "nl-BE": "Schoolschoonmaak" },
  home: { "en-BE": "Home cleaning", "nl-BE": "Woningschoonmaak" },
  deep: { "en-BE": "Deep cleaning", "nl-BE": "Grondige schoonmaak" },
  windows: { "en-BE": "Window cleaning", "nl-BE": "Ramenreiniging" },
  postConstruction: { "en-BE": "After-renovation cleaning", "nl-BE": "Schoonmaak na renovatie" },
  move: { "en-BE": "Move cleaning", "nl-BE": "Verhuisschoonmaak" },
  airbnb: { "en-BE": "Airbnb cleaning", "nl-BE": "Airbnb-schoonmaak" },
  staircase: { "en-BE": "Staircase cleaning", "nl-BE": "Trappenhal schoonmaken" },
};

export const SAFE_BOUNDARIES = {
  availability: "Availability and short-notice availability are not guaranteed.",
} as const;

export function labelForService(id: ServiceId, locale: Locale) { return SERVICE_LABELS[id][locale]; }
