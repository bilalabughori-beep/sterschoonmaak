export const chatSteps = [
  "service",
  "location",
  "frequency",
  "preferred_time",
  "details",
  "name",
  "confirm",
  "edit",
  "complete",
] as const;

export type ChatStep = (typeof chatSteps)[number];

export const serviceIds = [
  "office",
  "commercial",
  "restaurant",
  "hotel",
  "school",
  "home",
  "deep",
  "windows",
  "postConstruction",
  "move",
  "airbnb",
  "staircase",
] as const;

export type ServiceId = (typeof serviceIds)[number];

export const frequencies = [
  "one_time",
  "daily",
  "several_per_week",
  "weekly",
  "recurring_custom",
  "not_sure",
] as const;

export type Frequency = (typeof frequencies)[number];

export type LeadDraft = {
  serviceId: ServiceId | null;
  city: string | null;
  postalCode: string | null;
  frequency: Frequency | null;
  preferredTime: string | null;
  details: string | null;
  name: string | null;
  email?: string | null;
  phone?: string | null;
};

export type ChatState = {
  step: ChatStep;
  leadDraft: LeadDraft;
};

export type ChatAction =
  | { type: "select_service"; value: ServiceId }
  | { type: "select_frequency"; value: Frequency }
  | { type: "set_field"; field: "location" | "preferred_time" | "details" | "name"; value: string }
  | { type: "skip" }
  | { type: "confirm" }
  | { type: "change" }
  | { type: "edit_field"; field: "service" | "location" | "frequency" | "preferred_time" | "details" | "name" };

export type QuickReply = {
  label: string;
  action: ChatAction;
};

export type ChatResponse = {
  reply: string;
  state: ChatState;
  step: ChatStep;
  leadDraft: LeadDraft;
  quickReplies: QuickReply[];
  readyToConfirm: boolean;
  complete: boolean;
  aiUsed?: boolean;
};

export type LeadResponse = {
  ok: true;
  reference: string;
  createdAt: string;
  duplicate: boolean;
  whatsappUrl: string;
};
