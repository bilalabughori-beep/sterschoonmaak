export type OfferDraft = {
  id: string;
  status: "draft" | "published" | "archived";
  internalName: string;
  placement: "top_banner" | "homepage_offer" | "popup";
  priority: number;
  startsAt: string;
  endsAt: string;
  badgeNl: string;
  badgeEn: string;
  titleNl: string;
  titleEn: string;
  subtitleNl: string;
  subtitleEn: string;
  descriptionNl: string;
  descriptionEn: string;
  oldPriceLabel: string;
  newPriceLabel: string;
  discountLabel: string;
  ctaLabelNl: string;
  ctaLabelEn: string;
  ctaUrl: string;
  imagePath: string;
  imageName: string;
  imageAltNl: string;
  imageAltEn: string;
  theme: "brand" | "light" | "dark" | "accent";
  layout: "compact" | "banner" | "split";
  dismissible: boolean;
};

export type OfferErrors = Partial<Record<keyof OfferDraft | "form", string>>;

const relativeOrHttps = /^(?:\/(?!\/)[^\s]*|https:\/\/[^\s]+)$/i;

export function validateOffer(draft: OfferDraft, action: "save" | "publish", messages: { required: string; publishRequired: (field: string) => string; invalidUrl: string; invalidDates: string }) {
  const errors: OfferErrors = {};
  if (!draft.internalName.trim()) errors.internalName = messages.required;
  if (draft.ctaUrl.trim() && !relativeOrHttps.test(draft.ctaUrl.trim())) errors.ctaUrl = messages.invalidUrl;
  if (draft.startsAt && !Number.isFinite(new Date(draft.startsAt).getTime())) errors.startsAt = messages.invalidDates;
  if (draft.endsAt && !Number.isFinite(new Date(draft.endsAt).getTime())) errors.endsAt = messages.invalidDates;
  if (draft.startsAt && draft.endsAt && new Date(draft.endsAt).getTime() <= new Date(draft.startsAt).getTime()) errors.endsAt = messages.invalidDates;
  if (action === "publish") {
    if (!draft.titleNl.trim()) errors.titleNl = messages.publishRequired("NL title");
    if (!draft.titleEn.trim()) errors.titleEn = messages.publishRequired("EN title");
    if (!draft.descriptionNl.trim()) errors.descriptionNl = messages.publishRequired("NL description");
    if (!draft.descriptionEn.trim()) errors.descriptionEn = messages.publishRequired("EN description");
    if (!draft.ctaLabelNl.trim()) errors.ctaLabelNl = messages.publishRequired("NL CTA label");
    if (!draft.ctaLabelEn.trim()) errors.ctaLabelEn = messages.publishRequired("EN CTA label");
  }
  if (Object.keys(errors).length && action === "publish") errors.form = messages.invalidDates;
  return errors;
}

export function toDateTimeLocal(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toIso(value: string) { return value ? new Date(value).toISOString() : null; }
