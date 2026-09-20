/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

export type OfferData = {
  id?: string;
  placement: "top_banner" | "homepage_offer" | "popup";
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  oldPriceLabel?: string;
  newPriceLabel?: string;
  discountLabel?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imagePath?: string;
  imageAlt?: string;
  theme?: "brand" | "light" | "dark" | "accent";
  layout?: "compact" | "banner" | "split";
  dismissible?: boolean;
};

export function OfferPreview({ offer, label, onDismiss }: { offer: OfferData; label?: string; onDismiss?: () => void }) {
  const content = offer.placement === "top_banner" ? <OfferBanner offer={offer} onDismiss={onDismiss} interactive={false} /> : <OfferCard offer={offer} onDismiss={offer.placement === "popup" ? onDismiss : undefined} interactive={false} />;
  return <div className={offer.placement === "popup" ? "rounded-2xl border border-border bg-background p-3" : ""}>{label ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-muted">{label}</p> : null}{offer.placement === "popup" ? <div className="max-w-md">{content}</div> : content}</div>;
}

export function OfferBanner({ offer, onDismiss, interactive = true }: { offer: OfferData; onDismiss?: () => void; interactive?: boolean }) {
  return <div className={`relative rounded-xl px-5 py-3 ${themeClass(offer.theme)}`}><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 pr-8 text-center text-sm"><span className="font-bold">{offer.badge}</span><span>{offer.title}</span>{offer.ctaUrl ? <a href={offer.ctaUrl} onClick={interactive ? undefined : (event) => event.preventDefault()} className="font-bold underline">{offer.ctaLabel || "Meer info"}</a> : null}</div>{offer.dismissible && onDismiss ? <button type="button" onClick={onDismiss} aria-label="Offer close" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-current/70 hover:text-current">×</button> : null}</div>;
}

export function OfferCard({ offer, onDismiss, interactive = true }: { offer: OfferData; onDismiss?: () => void; interactive?: boolean }) {
  const split = offer.layout === "split" && offer.imagePath;
  return <article className={`relative overflow-hidden rounded-2xl border border-border shadow-sm ${themeClass(offer.theme)} ${split ? "grid sm:grid-cols-[0.9fr_1.1fr]" : ""}`}>{offer.imagePath ? <img src={offer.imagePath} alt={offer.imageAlt || ""} className={`h-44 w-full object-cover ${split ? "sm:order-2 sm:h-full" : ""}`} /> : null}<div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">{offer.badge}</p><h2 className="mt-2 text-2xl font-semibold">{offer.title || "—"}</h2></div>{offer.dismissible && onDismiss ? <button type="button" onClick={onDismiss} aria-label="Offer close" className="p-1 text-xl opacity-70 hover:opacity-100">×</button> : null}</div>{offer.subtitle ? <p className="mt-3 text-base font-semibold opacity-80">{offer.subtitle}</p> : null}{offer.description ? <p className="mt-3 text-sm leading-6 opacity-80">{offer.description}</p> : null}<div className="mt-5 flex flex-wrap items-center gap-3">{offer.newPriceLabel ? <span className="text-xl font-bold">{offer.newPriceLabel}</span> : null}{offer.oldPriceLabel ? <span className="text-sm line-through opacity-60">{offer.oldPriceLabel}</span> : null}{offer.discountLabel ? <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{offer.discountLabel}</span> : null}</div>{offer.ctaUrl ? <a href={offer.ctaUrl} onClick={interactive ? undefined : (event) => event.preventDefault()} className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-navy">{offer.ctaLabel || "Meer info"}<span className="ml-2" aria-hidden="true">→</span></a> : null}</div></article>;
}

function themeClass(theme: OfferData["theme"]) { return theme === "dark" ? "bg-navy text-white" : theme === "accent" ? "bg-primary text-white" : theme === "light" ? "bg-white text-navy" : "bg-[#eaf2ff] text-navy"; }

export function OfferPreviewFrame({ children }: { children: ReactNode }) { return <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">{children}</div>; }
