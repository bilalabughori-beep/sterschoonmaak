import type { NormalizedLead } from "./types";
import { FREQUENCIES, InputError, isFrequency, isRecord, isServiceId } from "./validation";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizedString(value: unknown, max: number, field: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new InputError(`${field} is invalid.`);
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  if (normalized.length > max) throw new InputError(`${field} is too long.`);
  return normalized;
}

function requiredString(value: unknown, max: number, field: string): string {
  const normalized = normalizedString(value, max, field);
  if (!normalized) throw new InputError(`${field} is required.`);
  return normalized;
}

export function parseLeadRequest(value: unknown): NormalizedLead {
  if (!isRecord(value)) throw new InputError("Request body must be an object.");

  const clientRequestId = requiredString(value.clientRequestId, 36, "clientRequestId");
  if (!UUID_PATTERN.test(clientRequestId)) throw new InputError("clientRequestId is invalid.");
  if (value.locale !== "en-BE" && value.locale !== "nl-BE") throw new InputError("Unsupported locale.");
  if (!isRecord(value.lead)) throw new InputError("Lead details are required.");

  const lead = value.lead;
  if (!isServiceId(lead.serviceId)) throw new InputError("Service is invalid.");
  if (!isFrequency(lead.frequency)) throw new InputError("Frequency is invalid.");

  const city = normalizedString(lead.city, 120, "City");
  const postalCode = normalizedString(lead.postalCode, 30, "Postal code");
  if (!city && !postalCode) throw new InputError("A city or postal code is required.");

  const preferredTime = normalizedString(lead.preferredTime, 200, "Preferred time");
  const details = normalizedString(lead.details, 1000, "Details");
  const name = requiredString(lead.name, 100, "Name");
  const sourcePath = normalizedString(value.sourcePath, 300, "Source path");
  if (sourcePath && (!sourcePath.startsWith("/") || /[?#\\\u0000-\u001f]/.test(sourcePath))) {
    throw new InputError("Source path is invalid.");
  }

  return {
    clientRequestId,
    locale: value.locale,
    serviceId: lead.serviceId,
    city,
    postalCode,
    frequency: lead.frequency,
    preferredTime,
    details,
    name,
    sourcePath,
  };
}

export const SUPPORTED_FREQUENCIES = FREQUENCIES;
