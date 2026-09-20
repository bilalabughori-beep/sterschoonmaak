"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { workerApiUrl } from "@/lib/auth-client";
import { OfferBanner, OfferCard, type OfferData } from "./offer-presentational";

type PublicOffer = OfferData & { id: string };

export function DynamicOffers() {
  const locale = useLocale(); const [offers, setOffers] = useState<PublicOffer[]>([]); const [dismissed, setDismissed] = useState<string[]>([]);
  useEffect(() => { const base = workerApiUrl(); if (!base) return; const controller = new AbortController(); fetch(`${base}/site/offers?locale=${encodeURIComponent(locale)}&path=${encodeURIComponent(window.location.pathname)}`, { signal: controller.signal }).then((response) => response.ok ? response.json() : null).then((body) => { const parsed = body as { items?: PublicOffer[] } | null; setOffers(parsed?.items ?? []); }).catch(() => undefined); return () => controller.abort(); }, [locale]);
  const visible = offers.filter((offer) => !dismissed.includes(offer.id)); const banner = visible.find((offer) => offer.placement === "top_banner"); const card = visible.find((offer) => offer.placement === "homepage_offer"); const popup = visible.find((offer) => offer.placement === "popup");
  return <>{banner ? <OfferBanner offer={banner} onDismiss={() => setDismissed((current) => [...current, banner.id])} /> : null}{card ? <OfferCard offer={card} /> : null}{popup ? <div className="fixed inset-x-5 bottom-24 z-40 mx-auto max-w-md sm:inset-x-auto sm:bottom-8 sm:right-8"><OfferCard offer={popup} onDismiss={() => setDismissed((current) => [...current, popup.id])} /></div> : null}</>;
}
