import { SERVICE_IDS, type ChatAction, type ChatState, type Field, type Frequency, type LeadDraft, type Step, type Locale } from "./types";

export const FREQUENCIES: Frequency[] = ["one_time", "daily", "several_per_week", "weekly", "recurring_custom", "not_sure"];
export const STEPS: Step[] = ["service", "location", "frequency", "preferred_time", "details", "name", "confirm", "edit", "complete"];
const FIELDS: Field[] = ["service", "location", "frequency", "preferred_time", "details", "name"];

export class InputError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.name = "InputError"; this.status = status; }
}

export function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
export function isServiceId(value: unknown): value is (typeof SERVICE_IDS)[number] { return typeof value === "string" && SERVICE_IDS.includes(value as (typeof SERVICE_IDS)[number]); }
export function isFrequency(value: unknown): value is Frequency { return typeof value === "string" && FREQUENCIES.includes(value as Frequency); }
export function isStep(value: unknown): value is Step { return typeof value === "string" && STEPS.includes(value as Step); }

function boundedString(value: unknown, max: number): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function optionalStateString(value: unknown, max: number): string | null {
  if (typeof value === "string" && !value.trim()) return "";
  return boundedString(value, max);
}

export function blankLead(): LeadDraft { return { serviceId: null, city: null, postalCode: null, frequency: null, preferredTime: null, details: null, name: null }; }
export function initialState(): ChatState { return { step: "service", leadDraft: blankLead() }; }

export function normalizeState(value: unknown): ChatState {
  if (value === undefined || value === null) return initialState();
  if (!isRecord(value) || !isStep(value.step) || !isRecord(value.leadDraft)) throw new InputError("Invalid conversation state.");
  const draft = value.leadDraft;
  return {
    step: value.step,
    leadDraft: {
      serviceId: isServiceId(draft.serviceId) ? draft.serviceId : null,
      city: boundedString(draft.city, 150), postalCode: boundedString(draft.postalCode, 20),
      frequency: isFrequency(draft.frequency) ? draft.frequency : null,
      preferredTime: optionalStateString(draft.preferredTime, 150), details: optionalStateString(draft.details, 1000), name: boundedString(draft.name, 100),
    },
  };
}

export function parseRequest(value: unknown): { locale: Locale; state: ChatState; message?: string; action?: ChatAction } {
  if (!isRecord(value)) throw new InputError("Request body must be an object.");
  if (value.locale !== "en-BE" && value.locale !== "nl-BE") throw new InputError("Unsupported locale.");
  const hasMessage = value.message !== undefined; const hasAction = value.action !== undefined;
  if (hasMessage === hasAction) throw new InputError("Provide exactly one message or action.");
  const state = normalizeState(value.state);
  if (hasMessage) {
    if (typeof value.message !== "string" || !value.message.trim() || value.message.length > 1000) throw new InputError("Message is invalid or too long.");
    return { locale: value.locale, state, message: value.message.trim() };
  }
  return { locale: value.locale, state, action: parseAction(value.action) };
}

export function parseAction(value: unknown): ChatAction {
  if (!isRecord(value) || typeof value.type !== "string") throw new InputError("Unknown action.");
  switch (value.type) {
    case "select_service":
      if (!isServiceId(value.value)) throw new InputError("Unknown service.");
      return { type: "select_service", value: value.value };
    case "select_frequency":
      if (!isFrequency(value.value)) throw new InputError("Unknown frequency.");
      return { type: "select_frequency", value: value.value };
    case "set_field":
      if (!FIELDS.includes(value.field as Field) || value.field === "service" || value.field === "frequency" || typeof value.value !== "string") throw new InputError("Invalid field action.");
      if (value.value.length > (value.field === "name" ? 100 : value.field === "details" ? 1000 : 150)) throw new InputError("Field value is too long.");
      return { type: "set_field", field: value.field as "location" | "preferred_time" | "details" | "name", value: value.value.trim() };
    case "skip": return { type: "skip" };
    case "confirm": return { type: "confirm" };
    case "change": return { type: "change" };
    case "edit_field":
      if (!FIELDS.includes(value.field as Field)) throw new InputError("Invalid edit field.");
      return { type: "edit_field", field: value.field as Field };
    default: throw new InputError("Unknown action.");
  }
}

export function hasLocation(draft: LeadDraft) { return Boolean(draft.city || draft.postalCode); }
export function nextStep(draft: LeadDraft): Step {
  if (!draft.serviceId) return "service";
  if (!hasLocation(draft)) return "location";
  if (!draft.frequency) return "frequency";
  if (draft.preferredTime === null) return "preferred_time";
  if (draft.details === null) return "details";
  if (!draft.name) return "name";
  return "confirm";
}

export function parseLocation(value: string): Pick<LeadDraft, "city" | "postalCode"> {
  const normalized = value.trim().slice(0, 150);
  const postalMatch = normalized.match(/\b(\d{4})\b/);
  const postalCode = postalMatch?.[1] ?? null;
  const city = normalized.replace(/\b\d{4}\b/, "").replace(/[|/,]+/g, " ").trim() || null;
  return { city, postalCode };
}

export function findFrequency(value: string): Frequency | null {
  const text = value.toLocaleLowerCase();
  if (/one[- ]?time|once|eenmalig|een keer|één keer/.test(text)) return "one_time";
  if (/daily|every day|dagelijks|elke dag/.test(text)) return "daily";
  if (/twice|two times|2 times|three times|3 times|several times|couple of times|twee keer|drie keer|meerdere keren|meerdere maal|per week/.test(text) && !/every week|wekelijks/.test(text)) return "several_per_week";
  if (/weekly|every week|every (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|wekelijks|elke week|elke (maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)/.test(text)) return "weekly";
  if (/recurring|regular|custom|terugkerend|regelmatig/.test(text)) return "recurring_custom";
  if (/not sure|unsure|don't know|weet het niet|niet zeker/.test(text)) return "not_sure";
  return null;
}

export function findService(value: string): (typeof SERVICE_IDS)[number] | null {
  const text = value.toLocaleLowerCase();
  const aliases: Array<[typeof SERVICE_IDS[number], RegExp]> = [
    ["postConstruction", /post[- ]?construction|after renovation|renovation|oplever|renovatie/],
    ["staircase", /staircase|stairs|common hall|trappenhal|gemeenschappelijke hal/],
    ["airbnb", /airbnb|short[- ]?stay/], ["restaurant", /restaurant|café|cafe|dining/], ["hotel", /hotel/], ["school", /school|classroom|klas/],
    ["windows", /window|windows|glass cleaning|raam|ramen|glas/], ["move", /move[- ]?(in|out)|moving out|verhuis|leeg appartement/],
    ["deep", /deep clean|deep cleaning|grondig|grote schoonmaak/], ["office", /office|kantoor/], ["commercial", /commercial|business|shop|bedrijf|winkel/], ["home", /home|house|apartment|woning|huis|appartement/],
  ];
  return aliases.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

export function extractDeterministic(message: string) {
  const postalCode = message.match(/\b(\d{4})\b/)?.[1];
  const cityMatch = message.match(/\b(ghent|gent)\b/i);
  const location = postalCode || cityMatch ? { city: cityMatch?.[1] ?? undefined, postalCode } : {};
  return {
    serviceId: findService(message), frequency: findFrequency(message),
    preferredTime: /after closing|na sluiting|na het sluiten/i.test(message) ? (message.match(/after closing|na sluiting|na het sluiten/i)?.[0] ?? null) : null,
    ...location,
  };
}
