export function toTelHref(phone: string | null) {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+${digits}` : null;
}

export function toMailtoHref(email: string | null) {
  return email ? `mailto:${email}` : null;
}

export function toWhatsAppHref(phone: string | null, message?: string) {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  return message ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : `https://wa.me/${digits}`;
}
