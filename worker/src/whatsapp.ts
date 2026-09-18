import { labelForService } from "./knowledge";
import type { Locale, StoredLead } from "./types";

const FREQUENCY_LABELS: Record<StoredLead["frequency"], Record<Locale, string>> = {
  one_time: { "en-BE": "One-time", "nl-BE": "Eenmalig" },
  daily: { "en-BE": "Daily", "nl-BE": "Dagelijks" },
  several_per_week: { "en-BE": "Several times per week", "nl-BE": "Meerdere keren per week" },
  weekly: { "en-BE": "Weekly", "nl-BE": "Wekelijks" },
  recurring_custom: { "en-BE": "Recurring / custom", "nl-BE": "Terugkerend / anders" },
  not_sure: { "en-BE": "Not sure", "nl-BE": "Niet zeker" },
};

export function whatsappTarget(value: string | undefined): string {
  const target = value?.trim() ?? "";
  if (!/^\d{8,15}$/.test(target)) throw new Error("WhatsApp target is not configured.");
  return target;
}

export function displayReference(id: string): string { return id.slice(0, 8).toUpperCase(); }

function locationLine(lead: StoredLead): string {
  return [lead.city, lead.postalCode].filter(Boolean).join(" ");
}

export function buildWhatsAppHandoff(lead: StoredLead, targetValue: string | undefined): { reference: string; url: string } {
  const locale = lead.locale;
  const nl = locale === "nl-BE";
  const reference = displayReference(lead.id);
  const lines = nl ? [
    "Hallo Ster Schoonmaak,",
    "",
    "Ik heb via de website een schoonmaakaanvraag ingevuld.",
    "",
    `Referentie: ${reference}`,
    `Naam: ${lead.name}`,
    `Dienst: ${labelForService(lead.serviceId, locale)}`,
    `Locatie: ${locationLine(lead)}`,
    `Frequentie: ${FREQUENCY_LABELS[lead.frequency][locale]}`,
    ...(lead.preferredTime ? [`Voorkeurstijd: ${lead.preferredTime}`] : []),
    ...(lead.details ? [`Details: ${lead.details}`] : []),
    "",
    "Ik wil deze aanvraag graag verder bespreken via WhatsApp.",
  ] : [
    "Hello Ster Schoonmaak,",
    "",
    "I completed a cleaning request on your website.",
    "",
    `Reference: ${reference}`,
    `Name: ${lead.name}`,
    `Service: ${labelForService(lead.serviceId, locale)}`,
    `Location: ${locationLine(lead)}`,
    `Frequency: ${FREQUENCY_LABELS[lead.frequency][locale]}`,
    ...(lead.preferredTime ? [`Preferred time: ${lead.preferredTime}`] : []),
    ...(lead.details ? [`Details: ${lead.details}`] : []),
    "",
    "I would like to continue about this request on WhatsApp.",
  ];
  const target = whatsappTarget(targetValue);
  return { reference, url: `https://wa.me/${target}?text=${encodeURIComponent(lines.join("\n"))}` };
}
