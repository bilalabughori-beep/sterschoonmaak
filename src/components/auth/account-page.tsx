"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { refreshSession, roleOf, routeForSession, signOut, subscribeAuthState, type Session } from "@/lib/auth-client";
import type { SupportedLocale } from "@/config/site";

const copy = {
  "nl-BE": {
    checking: "Account controleren…", account: "Mijn account", title: "Mijn account", description: "Beheer uw Ster Schoonmaak-account.", name: "Naam", email: "E-mailadres", provider: "Aanmeldmethode", language: "Taal", languageValue: "Nederlands", logout: "Uitloggen", fallback: "Klant", back: "Terug naar website", reset: "Wachtwoord wijzigen", signIn: "Log in om uw account te bekijken.", login: "Inloggen", emailProvider: "E-mail en wachtwoord", googleProvider: "Google", unknown: "Externe provider", selectLanguage: "Taal kiezen", error: "Uw account kon niet worden geladen. Probeer opnieuw.",
  },
  "en-BE": {
    checking: "Checking account…", account: "My account", title: "My account", description: "Manage your Ster Schoonmaak account.", name: "Name", email: "Email address", provider: "Sign-in method", language: "Language", languageValue: "English", logout: "Log out", fallback: "Customer", back: "Back to website", reset: "Change password", signIn: "Sign in to view your account.", login: "Login", emailProvider: "Email & password", googleProvider: "Google", unknown: "External provider", selectLanguage: "Choose language", error: "Your account could not be loaded. Please try again.",
  },
} as const;

type AccountCopy = { [Key in keyof typeof copy["nl-BE"]]: string };

function displayName(session: Session, fallback: string) {
  const metadata = session.user.user_metadata;
  return metadata?.display_name?.trim() || metadata?.full_name?.trim() || metadata?.name?.trim() || fallback;
}

function providerNames(session: Session, labels: AccountCopy) {
  const providers = [...new Set(session.user.identities?.map((identity) => identity.provider?.toLowerCase()).filter((provider): provider is string => Boolean(provider)) ?? [])];
  if (!providers.length) return labels.unknown;
  return providers.map((provider) => provider === "google" ? labels.googleProvider : provider === "email" ? labels.emailProvider : provider.charAt(0).toUpperCase() + provider.slice(1)).join(" · ");
}

export function AccountPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    if (typeof window === "undefined") return "nl-BE";
    try {
      const saved = window.localStorage.getItem("ster-schoonmaak-locale");
      if (saved === "en-BE" || saved === "nl-BE") return saved;
      return window.navigator.language.toLowerCase().startsWith("en") ? "en-BE" : "nl-BE";
    } catch { return "nl-BE"; }
  });

  const t: AccountCopy = copy[locale];

  useEffect(() => {
    let active = true;
    void refreshSession().then((next) => {
      if (!active) return;
      if (roleOf(next)) window.location.replace(routeForSession(next));
      else setSession(next);
      setReady(true);
    });
    let unsubscribe: (() => void) | undefined;
    try { unsubscribe = subscribeAuthState((next) => { if (active) setSession(next); }); } catch { /* Auth may be unavailable in a static preview. */ }
    return () => { active = false; unsubscribe?.(); };
  }, []);

  const provider = useMemo(() => session ? providerNames(session, t) : null, [session, t]);

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-muted">{t.checking}</main>;

  if (!session) {
    return <main className="min-h-screen bg-background px-5 py-10 sm:px-8 sm:py-16"><div className="mx-auto w-full max-w-2xl"><div className="flex items-center justify-between gap-4"><Link href="/" aria-label="Ster Schoonmaak"><AccountBrand /></Link><LanguageSelect locale={locale} setLocale={setLocale} label={t.selectLanguage} /></div><section className="mt-8 rounded-2xl border border-border bg-surface p-7 text-center shadow-sm sm:p-10"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t.account}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy">{t.title}</h1><p className="mt-3 text-base leading-7 text-muted">{t.signIn}</p><Link href="/" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">{t.back}</Link></section></div></main>;
  }

  return <main className="min-h-screen bg-background px-5 py-10 sm:px-8 sm:py-16"><div className="mx-auto w-full max-w-3xl"><div className="flex items-center justify-between gap-4"><Link href="/" aria-label="Ster Schoonmaak"><AccountBrand /></Link><div className="flex flex-wrap items-center justify-end gap-3"><LanguageSelect locale={locale} setLocale={setLocale} label={t.selectLanguage} /><button type="button" onClick={() => void signOut().then(() => setSession(null))} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-navy hover:bg-surface-muted">{t.logout}</button></div></div><section className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"><div className="bg-navy px-7 py-8 text-white sm:px-10"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fc0ff]">{t.account}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h1><p className="mt-3 max-w-xl text-base leading-7 text-white/70">{t.description}</p></div><div className="p-7 sm:p-10"><dl className="divide-y divide-border border-y border-border"><div className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-5"><dt className="text-sm font-semibold text-muted">{t.name}</dt><dd className="text-base font-semibold text-navy">{displayName(session, t.fallback)}</dd></div><div className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-5"><dt className="text-sm font-semibold text-muted">{t.email}</dt><dd className="break-all text-base text-navy" dir="ltr">{session.user.email ?? "—"}</dd></div><div className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-5"><dt className="text-sm font-semibold text-muted">{t.provider}</dt><dd className="text-base text-navy">{provider}</dd></div><div className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-5"><dt className="text-sm font-semibold text-muted">{t.language}</dt><dd className="text-base text-navy">{t.languageValue}</dd></div></dl><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">{t.back}</Link><Link href="/account/reset" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#b9c9dd] px-5 py-3 text-sm font-semibold text-navy hover:bg-surface-muted">{t.reset}</Link></div></div></section></div></main>;
}

function AccountBrand() {
  return <span className="inline-flex items-center gap-3"><Image src="/brand/ster-schoonmaak-logo.png" alt="Ster Schoonmaak" width={96} height={96} priority className="h-16 w-16 object-contain" /><span className="text-sm font-extrabold tracking-[0.12em] text-navy">STER<br /><span className="text-[0.58rem] tracking-[0.2em] text-primary">SCHOONMAAK</span></span></span>;
}

function LanguageSelect({ locale, setLocale, label }: { locale: SupportedLocale; setLocale: (value: SupportedLocale) => void; label: string }) {
  return <label className="relative inline-flex items-center"><span className="sr-only">{label}</span><select aria-label={label} value={locale} onChange={(event) => { const next = event.target.value as SupportedLocale; setLocale(next); try { window.localStorage.setItem("ster-schoonmaak-locale", next); } catch { /* optional */ } }} className="min-h-10 appearance-none rounded-full border border-border bg-surface px-3 pr-8 text-xs font-bold tracking-[0.12em] text-navy outline-none focus:border-primary"><option value="nl-BE">NL</option><option value="en-BE">EN</option></select><span className="pointer-events-none absolute right-3 text-xs text-muted" aria-hidden="true">▾</span></label>;
}
