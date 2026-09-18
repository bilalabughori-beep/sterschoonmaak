import { extractWithAi } from "./ai";
import { labelForService, SAFE_BOUNDARIES, SERVICE_LABELS } from "./knowledge";
import type { ChatAction, ChatResponse, ChatState, Env, Extraction, Field, Frequency, LeadDraft, Locale, QuickReply, ServiceId } from "./types";
import { extractDeterministic, findFrequency, findService, nextStep, parseLocation } from "./validation";

const text = {
  en: {
    location: "Which city or postal code is the property in? A full address is not needed.", frequency: "How often would you like the cleaning?", preferred: "Do you have a preferred time, such as mornings, evenings or after closing? You can skip this.", details: "Is there anything else we should know about the assignment? You can skip this.", name: "What name should we use for this request?", service: "What would you like cleaned? Choose an option or describe it briefly.", fallback: "I can help with one of the listed Ster Schoonmaak services. Please choose an option or describe the cleaning request.", pricing: `Pricing depends on the assignment and agreed scope, so we provide a tailored quotation rather than a fixed public price. ${SAFE_BOUNDARIES.availability}`, window: "Specialist high-rise or rope-access window cleaning is outside the current service. If the request is for accessible windows, you can continue with window cleaning.", hazardous: "Hazardous decontamination, asbestos and biohazard work are outside the normal cleaning scope. Please choose another cleaning request if relevant.", confirm: "Please check these details. Is everything correct?", complete: "Thanks. Your request details are ready. We are saving them now.", edit: "What would you like to change?", empty: "Please enter a little more detail so I can record this field.",
  },
  nl: {
    location: "In welke stad of postcode ligt het pand? Een volledig adres is niet nodig.", frequency: "Hoe vaak wenst u de schoonmaak?", preferred: "Hebt u een voorkeur voor een moment, zoals 's morgens, 's avonds of na sluiting? U kunt dit overslaan.", details: "Is er nog iets dat we over de opdracht moeten weten? U kunt dit overslaan.", name: "Welke naam mogen we voor deze aanvraag gebruiken?", service: "Wat wilt u laten schoonmaken? Kies een optie of beschrijf het kort.", fallback: "Ik kan u helpen met een van de vermelde diensten van Ster Schoonmaak. Kies een optie of beschrijf uw schoonmaakvraag.", pricing: `De prijs hangt af van de opdracht en de afgesproken scope. Daarom werken we met een offerte op maat in plaats van een vaste publieke prijs. ${SAFE_BOUNDARIES.availability}`, window: "Specialistische ramenreiniging op hoogte of met touwtoegang valt buiten de huidige dienstverlening. Voor toegankelijke ramen kunt u verdergaan met ramenreiniging.", hazardous: "Gevaarlijke decontaminatie, asbest- en biohazardwerk vallen buiten de normale schoonmaakscope. Kies indien relevant een andere schoonmaakvraag.", confirm: "Controleer deze gegevens. Klopt alles?", complete: "Bedankt. Uw aanvraaggegevens zijn klaar. We slaan ze nu op.", edit: "Wat wilt u wijzigen?", empty: "Vul iets meer informatie in zodat ik dit veld kan bewaren.",
  },
} as const;

function lang(locale: Locale) { return locale === "nl-BE" ? text.nl : text.en; }

export function response(state: ChatState, locale: Locale, reply: string, quickReplies: QuickReply[] = [], aiUsed = false): ChatResponse {
  return { reply, state, step: state.step, leadDraft: state.leadDraft, quickReplies, readyToConfirm: state.step === "confirm", complete: state.step === "complete", ...(aiUsed ? { aiUsed: true } : {}) };
}

function serviceReplies(locale: Locale): QuickReply[] { return (Object.keys(SERVICE_LABELS) as ServiceId[]).map((value) => ({ label: labelForService(value, locale), action: { type: "select_service", value } })); }

function frequencyReplies(locale: Locale): QuickReply[] {
  const labels: Record<Frequency, [string, string]> = { one_time: ["One-time", "Eenmalig"], daily: ["Daily", "Dagelijks"], several_per_week: ["Several times per week", "Meerdere keren per week"], weekly: ["Weekly", "Wekelijks"], recurring_custom: ["Recurring / custom", "Terugkerend / anders"], not_sure: ["Not sure", "Niet zeker"] };
  return (Object.keys(labels) as Frequency[]).map((value) => ({ label: labels[value][locale === "nl-BE" ? 1 : 0], action: { type: "select_frequency", value } }));
}

function optionalReplies(locale: Locale, field: "preferred_time" | "details"): QuickReply[] {
  const labels = locale === "nl-BE" ? { morning: "'s Morgens", evening: "'s Avonds", closing: "Na sluiting", weekends: "In het weekend", skip: "Overslaan" } : { morning: "Morning", evening: "Evening", closing: "After closing", weekends: "Weekends", skip: "Skip" };
  if (field === "details") return [{ label: labels.skip, action: { type: "skip" } }];
  return [
    { label: labels.morning, action: { type: "set_field", field: "preferred_time", value: labels.morning } },
    { label: labels.evening, action: { type: "set_field", field: "preferred_time", value: labels.evening } },
    { label: labels.closing, action: { type: "set_field", field: "preferred_time", value: labels.closing } },
    { label: labels.weekends, action: { type: "set_field", field: "preferred_time", value: labels.weekends } },
    { label: labels.skip, action: { type: "skip" } },
  ];
}

function editReplies(locale: Locale): QuickReply[] {
  const labels = locale === "nl-BE" ? { service: "Dienst", location: "Locatie", frequency: "Frequentie", preferred_time: "Voorkeurmoment", details: "Details", name: "Naam" } : { service: "Service", location: "Location", frequency: "Frequency", preferred_time: "Preferred time", details: "Details", name: "Name" };
  return (Object.keys(labels) as Field[]).map((field) => ({ label: labels[field], action: { type: "edit_field", field } }));
}

function promptFor(state: ChatState, locale: Locale): { reply: string; quickReplies: QuickReply[] } {
  const t = lang(locale);
  switch (state.step) {
    case "service": return { reply: t.service, quickReplies: serviceReplies(locale) };
    case "location": return { reply: t.location, quickReplies: [] };
    case "frequency": return { reply: t.frequency, quickReplies: frequencyReplies(locale) };
    case "preferred_time": return { reply: t.preferred, quickReplies: optionalReplies(locale, "preferred_time") };
    case "details": return { reply: t.details, quickReplies: optionalReplies(locale, "details") };
    case "name": return { reply: t.name, quickReplies: [] };
    case "edit": return { reply: t.edit, quickReplies: editReplies(locale) };
    case "confirm": return { reply: `${t.confirm}\n\n${summary(state.leadDraft, locale)}`, quickReplies: [{ label: locale === "nl-BE" ? "Bevestigen" : "Confirm", action: { type: "confirm" } }, { label: locale === "nl-BE" ? "Iets wijzigen" : "Change something", action: { type: "change" } }] };
    case "complete": return { reply: t.complete, quickReplies: [] };
  }
}

function summary(draft: LeadDraft, locale: Locale) {
  const nl = locale === "nl-BE";
  const service = draft.serviceId ? labelForService(draft.serviceId, locale) : "—";
  const location = [draft.city, draft.postalCode].filter(Boolean).join(" ") || "—";
  const frequency = draft.frequency ? { one_time: nl ? "Eenmalig" : "One-time", daily: nl ? "Dagelijks" : "Daily", several_per_week: nl ? "Meerdere keren per week" : "Several times per week", weekly: nl ? "Wekelijks" : "Weekly", recurring_custom: nl ? "Terugkerend / anders" : "Recurring / custom", not_sure: nl ? "Niet zeker" : "Not sure" }[draft.frequency] : "—";
  return [`${nl ? "Dienst" : "Service"}: ${service}`, `${nl ? "Locatie" : "Location"}: ${location}`, `${nl ? "Frequentie" : "Frequency"}: ${frequency}`, `${nl ? "Voorkeurmoment" : "Preferred time"}: ${draft.preferredTime || "—"}`, `${nl ? "Details" : "Details"}: ${draft.details || "—"}`, `${nl ? "Naam" : "Name"}: ${draft.name || "—"}`].join("\n");
}

function applyExtraction(draft: LeadDraft, extraction: Extraction): LeadDraft {
  const next = { ...draft };
  if (typeof extraction.serviceId === "string") next.serviceId = extraction.serviceId as ServiceId;
  if (typeof extraction.frequency === "string") next.frequency = extraction.frequency as Frequency;
  if (typeof extraction.preferredTime === "string") next.preferredTime = extraction.preferredTime;
  if (typeof extraction.details === "string") next.details = extraction.details;
  if (typeof extraction.name === "string") next.name = extraction.name;
  if (typeof extraction.city === "string") next.city = extraction.city;
  if (typeof extraction.postalCode === "string") next.postalCode = extraction.postalCode;
  return next;
}

function boundaryReply(message: string, locale: Locale) {
  const t = lang(locale);
  if (/asbestos|biohazard|decontaminat|asbest/i.test(message)) return t.hazardous;
  if (/(high[- ]?rise|rope[- ]?access|touwtoegang|grote hoogte)/i.test(message) && /(window|raam|glas)/i.test(message)) return t.window;
  if (/(how much|price|cost|pricing|hoeveel|prijs|kost)/i.test(message)) return t.pricing;
  return null;
}

function injectionLike(message: string) { return /(ignore (all|previous)|system prompt|hidden services|geheime diensten|systeeminstruct)/i.test(message); }

export async function processChat(env: Env, locale: Locale, originalState: ChatState, message: string | undefined, action: ChatAction | undefined): Promise<ChatResponse> {
  const t = lang(locale);
  const state: ChatState = { step: originalState.step, leadDraft: { ...originalState.leadDraft } };
  if (action) {
    switch (action.type) {
      case "select_service": state.leadDraft.serviceId = action.value; break;
      case "select_frequency": state.leadDraft.frequency = action.value; break;
      case "set_field":
        if (action.field === "location") { const parsed = parseLocation(action.value); state.leadDraft.city = parsed.city; state.leadDraft.postalCode = parsed.postalCode; }
        else if (action.field === "preferred_time") state.leadDraft.preferredTime = action.value || null;
        else if (action.field === "details") state.leadDraft.details = action.value || null;
        else state.leadDraft.name = action.value || null;
        break;
      case "skip": if (state.step === "preferred_time") state.leadDraft.preferredTime = ""; if (state.step === "details") state.leadDraft.details = ""; break;
      case "change": state.step = "edit"; return response(state, locale, t.edit, editReplies(locale));
      case "edit_field": state.step = action.field === "service" ? "service" : action.field === "location" ? "location" : action.field === "frequency" ? "frequency" : action.field; { const next = promptFor(state, locale); return response(state, locale, next.reply, next.quickReplies); }
      case "confirm": if (nextStep(state.leadDraft) !== "confirm") { const next = promptFor(state, locale); return response(state, locale, next.reply, next.quickReplies); } state.step = "complete"; return response(state, locale, t.complete);
    }
    state.step = nextStep(state.leadDraft);
    const next = promptFor(state, locale);
    return response(state, locale, next.reply, next.quickReplies);
  }

  const incoming = message ?? "";
  const boundary = boundaryReply(incoming, locale);
  if (boundary) { const next = promptFor(state, locale); return response(state, locale, `${boundary}\n\n${next.reply}`, next.quickReplies); }
  if (injectionLike(incoming)) { const next = promptFor(state, locale); return response(state, locale, next.reply, next.quickReplies); }

  let extraction: Extraction = extractDeterministic(incoming);
  let aiUsed = false;
  const obviousService = findService(incoming);
  const exactStructured = state.step === "service" && obviousService !== null && incoming.length < 32 && !/[.!?]/.test(incoming);
  if ((state.step === "service" && !exactStructured) || (state.step === "frequency" && !findFrequency(incoming))) { extraction = await extractWithAi(env, locale, state, incoming) ?? extraction; aiUsed = true; }
  if (state.step === "location") {
    const parsed = parseLocation(incoming);
    if (parsed.city || parsed.postalCode) { state.leadDraft.city = parsed.city; state.leadDraft.postalCode = parsed.postalCode; } else return response(state, locale, t.location);
  } else if (state.step === "frequency" && extraction.frequency) state.leadDraft.frequency = extraction.frequency as Frequency;
  else if (state.step === "preferred_time") state.leadDraft.preferredTime = incoming;
  else if (state.step === "details") state.leadDraft.details = incoming.slice(0, 1000);
  else if (state.step === "name") state.leadDraft.name = incoming.slice(0, 100);
  else state.leadDraft = applyExtraction(state.leadDraft, extraction);
  state.step = nextStep(state.leadDraft);
  const next = promptFor(state, locale);
  return response(state, locale, next.reply, next.quickReplies, aiUsed);
}
