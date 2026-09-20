import { intValue, isoDate, nullableText, publicUrl, requireRole, requiredText } from "./admin";
import { supabaseQuery, updateRow } from "./backoffice-data";
import type { Env, OfferLayout, OfferPlacement, OfferStatus, OfferTheme } from "./types";
import { InputError, isRecord } from "./validation";

const placements: OfferPlacement[] = ["top_banner", "homepage_offer", "popup"];
const themes: OfferTheme[] = ["brand", "light", "dark", "accent"];
const layouts: OfferLayout[] = ["compact", "banner", "split"];
const statuses: OfferStatus[] = ["draft", "published", "archived"];

const fields = [
  "id", "created_at", "updated_at", "status", "enabled", "internal_name", "placement", "priority", "starts_at", "ends_at",
  "badge_nl", "badge_en", "title_nl", "title_en", "subtitle_nl", "subtitle_en", "description_nl", "description_en", "old_price_label", "new_price_label", "discount_label", "cta_label_nl", "cta_label_en", "cta_url", "image_path", "image_alt_nl", "image_alt_en", "theme", "layout", "dismissible", "published_at",
].join(",");

const publicFields = ["id", "placement", "priority", "starts_at", "ends_at", "badge_nl", "badge_en", "title_nl", "title_en", "subtitle_nl", "subtitle_en", "description_nl", "description_en", "old_price_label", "new_price_label", "discount_label", "cta_label_nl", "cta_label_en", "cta_url", "image_path", "image_alt_nl", "image_alt_en", "theme", "layout", "dismissible"].join(",");

function boolean(value: unknown, fallback: boolean) { return value === undefined ? fallback : Boolean(value); }

function payload(value: unknown, userId: string, publish: boolean): Record<string, unknown> {
  if (!isRecord(value)) throw new InputError("Request body must be an object.");
  const status = value.status === undefined ? (publish ? "published" : "draft") : value.status;
  if (typeof status !== "string" || !statuses.includes(status as OfferStatus)) throw new InputError("Offer status is invalid.");
  const placement = value.placement ?? "homepage_offer"; if (typeof placement !== "string" || !placements.includes(placement as OfferPlacement)) throw new InputError("Placement is invalid.");
  const theme = value.theme ?? "brand"; if (typeof theme !== "string" || !themes.includes(theme as OfferTheme)) throw new InputError("Theme is invalid.");
  const layout = value.layout ?? "banner"; if (typeof layout !== "string" || !layouts.includes(layout as OfferLayout)) throw new InputError("Layout is invalid.");
  const ctaUrl = nullableText(value.ctaUrl, 500, "CTA URL"); if (ctaUrl) publicUrl(ctaUrl);
  const startsAt = isoDate(value.startsAt, "Start date"); const endsAt = isoDate(value.endsAt, "End date");
  if (startsAt && endsAt && Date.parse(startsAt) >= Date.parse(endsAt)) throw new InputError("End date must be after start date.");
  const result: Record<string, unknown> = {
    updated_by: userId, status, enabled: boolean(value.enabled, false), internal_name: requiredText(value.internalName, 160, "Internal name"),
    placement, priority: intValue(value.priority, 0, -1000, 1000, "Priority"), starts_at: startsAt, ends_at: endsAt,
    badge_nl: nullableText(value.badgeNl, 80, "Badge NL"), badge_en: nullableText(value.badgeEn, 80, "Badge EN"),
    title_nl: nullableText(value.titleNl, 180, "Title NL"), title_en: nullableText(value.titleEn, 180, "Title EN"),
    subtitle_nl: nullableText(value.subtitleNl, 240, "Subtitle NL"), subtitle_en: nullableText(value.subtitleEn, 240, "Subtitle EN"),
    description_nl: nullableText(value.descriptionNl, 1000, "Description NL"), description_en: nullableText(value.descriptionEn, 1000, "Description EN"),
    old_price_label: nullableText(value.oldPriceLabel, 60, "Old price"), new_price_label: nullableText(value.newPriceLabel, 60, "New price"), discount_label: nullableText(value.discountLabel, 60, "Discount"),
    cta_label_nl: nullableText(value.ctaLabelNl, 80, "CTA label NL"), cta_label_en: nullableText(value.ctaLabelEn, 80, "CTA label EN"), cta_url: ctaUrl,
    image_path: nullableText(value.imagePath, 500, "Image path"), image_alt_nl: nullableText(value.imageAltNl, 180, "Image alt NL"), image_alt_en: nullableText(value.imageAltEn, 180, "Image alt EN"),
    theme, layout, dismissible: boolean(value.dismissible, true),
  };
  if (publish) {
    for (const field of ["titleNl", "titleEn", "descriptionNl", "descriptionEn", "ctaLabelNl", "ctaLabelEn"]) if (!nullableText(value[field], field.startsWith("title") ? 180 : field.startsWith("description") ? 1000 : 80, field)) throw new InputError(`${field} is required for publishing.`);
    result.published_at = new Date().toISOString(); result.status = "published"; result.enabled = true;
  } else if (status !== "published") result.published_at = null;
  return result;
}

export async function listOffers(request: Request, env: Env) { await requireRole(request, env, ["site_owner"]); const rows = await supabaseQuery(env, "offers", `?select=${fields}&order=updated_at.desc`); return { items: Array.isArray(rows) ? rows : [] }; }

export async function createOffer(request: Request, env: Env, value: unknown) { const user = await requireRole(request, env, ["site_owner"]); const publish = isRecord(value) && value.action === "publish"; const data = payload(value, user.id, publish); const result = await supabaseQuery(env, "offers", "", { method: "POST", body: JSON.stringify({ ...data, created_by: user.id }) }); return Array.isArray(result) ? result[0] : result; }

export async function updateOffer(request: Request, env: Env, id: string, value: unknown) {
  const user = await requireRole(request, env, ["site_owner"]); if (!isRecord(value)) throw new InputError("Request body must be an object.");
  const action = typeof value.action === "string" ? value.action : "save";
  if (action === "archive" || action === "unpublish") return updateRow(env, "offers", id, { status: action === "archive" ? "archived" : "draft", enabled: false, updated_by: user.id, ...(action === "unpublish" ? { published_at: null } : {}) });
  return updateRow(env, "offers", id, payload(value, user.id, action === "publish"));
}

export async function publicOffers(request: Request, env: Env) {
  const url = new URL(request.url); const locale = url.searchParams.get("locale") === "en-BE" ? "en-BE" : "nl-BE"; const path = url.searchParams.get("path") ?? "/";
  if (!path.startsWith("/") || path.startsWith("//")) throw new InputError("Path is invalid.");
  const rows = await supabaseQuery(env, "offers", `?select=${publicFields}&status=eq.published&enabled=eq.true&order=priority.desc,published_at.desc`);
  const now = Date.now();
  const active = (Array.isArray(rows) ? rows : []).filter((item) => {
    if (!item || typeof item !== "object") return false; const row = item as Record<string, unknown>;
    const starts = row.starts_at ? Date.parse(String(row.starts_at)) : -Infinity; const ends = row.ends_at ? Date.parse(String(row.ends_at)) : Infinity;
    if (!(starts <= now && now < ends)) return false; if (row.placement !== "top_banner" && row.placement !== "popup" && row.placement !== "homepage_offer") return false;
    return row.placement === "top_banner" || row.placement === "homepage_offer" ? path === "/" || path === "/en" : true;
  }).map((item) => localizeOffer(item as Record<string, unknown>, locale));
  return { items: active };
}

function localizeOffer(row: Record<string, unknown>, locale: string) {
  const english = locale === "en-BE"; const suffix = english ? "_en" : "_nl"; const localized: Record<string, unknown> = { id: row.id, placement: row.placement, priority: row.priority, startsAt: row.starts_at, endsAt: row.ends_at, theme: row.theme, layout: row.layout, dismissible: row.dismissible, oldPriceLabel: row.old_price_label, newPriceLabel: row.new_price_label, discountLabel: row.discount_label, ctaUrl: row.cta_url, imagePath: row.image_path, imageAlt: row[`image_alt${suffix}`] };
  for (const name of ["badge", "title", "subtitle", "description"]) localized[name] = row[`${name}${suffix}`];
  localized.ctaLabel = row[`cta_label${suffix}`];
  return localized;
}

export async function uploadOfferImage(request: Request, env: Env) {
  const user = await requireRole(request, env, ["site_owner"]); const contentType = request.headers.get("content-type")?.split(";", 1)[0].toLowerCase() ?? ""; const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(contentType)) throw new InputError("Only JPEG, PNG, and WebP images are allowed.");
  const length = Number(request.headers.get("content-length") ?? 0); if (length > 2_097_152) throw new InputError("Image is too large.", 413);
  const bytes = await request.arrayBuffer(); if (bytes.byteLength > 2_097_152) throw new InputError("Image is too large.", 413);
  if (!matchesImageSignature(bytes, contentType)) throw new InputError("The uploaded file does not match its image type.");
  const { baseUrl, key } = (() => { const baseUrl = env.SUPABASE_URL?.replace(/\/+$/, ""); const key = env.SUPABASE_SECRET_KEY?.trim(); if (!baseUrl || !key) throw new InputError("Storage is not configured.", 503); return { baseUrl, key }; })();
  const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1]; const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const response = await fetch(`${baseUrl}/storage/v1/object/offer-images/${objectPath}`, { method: "POST", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": contentType, "x-upsert": "false" }, body: bytes });
  if (!response.ok) throw new InputError("Image upload failed.", 503);
  return { path: `${baseUrl}/storage/v1/object/public/offer-images/${objectPath}` };
}

function matchesImageSignature(buffer: ArrayBuffer, contentType: string) {
  const bytes = new Uint8Array(buffer);
  if (contentType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") return bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (contentType === "image/webp") return bytes.length >= 12 && ascii(bytes.slice(0, 4)) === "RIFF" && ascii(bytes.slice(8, 12)) === "WEBP";
  return false;
}

function ascii(bytes: Uint8Array) { return String.fromCharCode(...bytes); }
