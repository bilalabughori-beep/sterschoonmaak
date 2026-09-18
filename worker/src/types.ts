export const SERVICE_IDS = [
  "office", "commercial", "restaurant", "hotel", "school", "home",
  "deep", "windows", "postConstruction", "move", "airbnb", "staircase",
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];
export type Locale = "nl-BE" | "en-BE";
export type Frequency = "one_time" | "daily" | "several_per_week" | "weekly" | "recurring_custom" | "not_sure";
export type Step = "service" | "location" | "frequency" | "preferred_time" | "details" | "name" | "confirm" | "edit" | "complete";
export type Field = "service" | "location" | "frequency" | "preferred_time" | "details" | "name";

export type LeadDraft = {
  serviceId: ServiceId | null;
  city: string | null;
  postalCode: string | null;
  frequency: Frequency | null;
  preferredTime: string | null;
  details: string | null;
  name: string | null;
};

export type ChatState = { step: Step; leadDraft: LeadDraft };

export type ChatAction =
  | { type: "select_service"; value: ServiceId }
  | { type: "select_frequency"; value: Frequency }
  | { type: "set_field"; field: "location" | "preferred_time" | "details" | "name"; value: string }
  | { type: "skip" }
  | { type: "confirm" }
  | { type: "change" }
  | { type: "edit_field"; field: Field };

export type ChatRequest = { locale: Locale; state?: unknown; message?: string; action?: unknown };
export type QuickReply = { label: string; action: ChatAction };
export type ChatResponse = { reply: string; state: ChatState; step: Step; leadDraft: LeadDraft; quickReplies: QuickReply[]; readyToConfirm: boolean; complete: boolean; aiUsed?: boolean };

export type NormalizedLead = {
  clientRequestId: string;
  locale: Locale;
  serviceId: ServiceId;
  city: string | null;
  postalCode: string | null;
  frequency: Frequency;
  preferredTime: string | null;
  details: string | null;
  name: string;
  sourcePath: string | null;
};

export type StoredLead = NormalizedLead & {
  id: string;
  createdAt: string;
  status: "new";
};

export type LeadResponse = {
  ok: true;
  reference: string;
  createdAt: string;
  duplicate: boolean;
  whatsappUrl: string;
};

export interface Env {
  AI: Ai;
  ALLOWED_ORIGINS?: string;
  DEV_OBSERVABILITY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  WHATSAPP_TARGET_NUMBER?: string;
  RESEND_API_KEY?: string;
  COMPLAINT_EMAIL_FROM?: string;
  COMPLAINT_EMAIL_REPLY_TO?: string;
  PUBLIC_SITE_URL?: string;
}

export type BackofficeRole = "client_admin" | "site_owner";
export type ComplaintStatus = "new" | "in_progress" | "resolved" | "closed";
export type OfferStatus = "draft" | "published" | "archived";
export type OfferPlacement = "top_banner" | "homepage_offer" | "popup";
export type OfferTheme = "brand" | "light" | "dark" | "accent";
export type OfferLayout = "compact" | "banner" | "split";

export type Extraction = { serviceId?: unknown; frequency?: unknown; preferredTime?: unknown; city?: unknown; postalCode?: unknown; details?: unknown; name?: unknown };
