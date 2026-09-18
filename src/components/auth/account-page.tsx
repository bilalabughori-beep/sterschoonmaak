"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { PublicAuthButton } from "@/components/auth/public-auth-modal";
import { refreshSession, roleOf, routeForSession, signOut, subscribeAuthState, type Session } from "@/lib/auth-client";

function displayName(session: Session, fallback: string) {
  const metadata = session.user.user_metadata;
  return metadata?.display_name?.trim() || metadata?.full_name?.trim() || metadata?.name?.trim() || fallback;
}

function providerName(session: Session, emailLabel: string, googleLabel: string, unknownLabel: string) {
  const providers = session.user.identities?.map((identity) => identity.provider).filter(Boolean) ?? [];
  const provider = providers[0]?.toLowerCase();
  if (provider === "google") return googleLabel;
  if (provider === "email") return emailLabel;
  return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : unknownLabel;
}

export function AccountPage() {
  const t = useTranslations("auth");
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

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

  const provider = useMemo(() => session ? providerName(session, t("emailProvider"), t("googleProvider"), t("providerUnknown")) : null, [session, t]);

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-muted">{t("checkingAccount")}</main>;

  if (!session) {
    return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 text-center shadow-sm sm:p-9"><h1 className="text-3xl font-semibold tracking-tight text-navy">{t("accountTitle")}</h1><p className="mt-3 text-base leading-7 text-muted">{t("accountSignInRequired")}</p><div className="mt-7"><PublicAuthButton /></div></div></main>;
  }

  return <main className="min-h-screen bg-background px-5 py-10 sm:px-8 sm:py-16"><div className="mx-auto w-full max-w-2xl"><div className="flex items-center justify-between gap-4"><Link href="/" className="text-sm font-bold tracking-wide text-primary">Ster Schoonmaak</Link><button type="button" onClick={() => void signOut().then(() => setSession(null))} className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-navy hover:bg-surface-muted">{t("logout")}</button></div><section className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm sm:p-9"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{t("account")}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy">{t("accountTitle")}</h1><p className="mt-3 text-base leading-7 text-muted">{t("accountDescription")}</p><dl className="mt-8 divide-y divide-border border-y border-border"><div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-5"><dt className="text-sm font-semibold text-muted">{t("name")}</dt><dd className="text-base font-semibold text-navy">{displayName(session, t("nameFallback"))}</dd></div><div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-5"><dt className="text-sm font-semibold text-muted">{t("email")}</dt><dd className="text-base text-navy" dir="ltr">{session.user.email ?? "—"}</dd></div><div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-5"><dt className="text-sm font-semibold text-muted">{t("authenticationProvider")}</dt><dd className="text-base text-navy">{provider}</dd></div><div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-5"><dt className="text-sm font-semibold text-muted">{t("language")}</dt><dd className="text-base text-navy">{t("languageValue")}</dd></div></dl></section></div></main>;
}
