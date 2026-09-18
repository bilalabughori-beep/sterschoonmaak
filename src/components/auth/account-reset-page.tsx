"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { consumeAuthCallback, friendlyPublicAuthError, refreshSession, requestPasswordReset, roleOf, routeForSession, updatePassword, type Session } from "@/lib/auth-client";

export function AccountResetPage() {
  const t = useTranslations("auth");
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; if (active) { setError(t("invalidReset")); setReady(true); } }, 8000);
    void (async () => {
      try {
        const callbackSession = await consumeAuthCallback();
        const current = callbackSession ?? await refreshSession();
        if (!active || timedOut) return;
        const role = roleOf(current);
        if (role) { window.location.replace(routeForSession(current)); return; }
        setSession(current);
      } catch (caught) {
        if (active && !timedOut) setError(friendlyPublicAuthError(caught, t("invalidReset")));
      } finally {
        window.clearTimeout(timeout);
        if (active && !timedOut) setReady(true);
      }
    })();
    return () => { active = false; window.clearTimeout(timeout); };
  }, [t]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null); setMessage(null);
    try {
      if (!session) {
        await requestPasswordReset(email);
        setMessage(t("resetSent"));
      } else if (password.length < 8) {
        setError(t("passwordMin"));
      } else if (password !== confirmation) {
        setError(t("passwordMismatch"));
      } else {
        const updated = await updatePassword(password);
        setPassword(""); setConfirmation("");
        window.location.replace(routeForSession(updated));
      }
    } catch (caught) { setError(friendlyPublicAuthError(caught, t("requestFailed"))); }
    finally { setBusy(false); }
  };

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-muted">{t("checkingAccount")}</main>;

  return <main className="flex min-h-screen items-center bg-background px-5 py-10 sm:px-8 sm:py-16"><div className="mx-auto w-full max-w-md"><div className="flex items-center justify-between gap-4"><Link href="/" className="text-sm font-bold tracking-wide text-primary">Ster Schoonmaak</Link><Link href="/account" className="text-sm font-semibold text-primary underline">{t("account")}</Link></div><div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm sm:p-9"><h1 className="text-3xl font-semibold tracking-tight text-navy">{t("resetTitle")}</h1><p className="mt-3 text-base leading-7 text-muted">{session ? t("resetChoosePassword") : t("resetRequestDescription")}</p><form onSubmit={submit} className="mt-8 space-y-5">{session ? <><div><label htmlFor="account-new-password" className="block text-sm font-semibold text-navy">{t("newPassword")}</label><div className="relative mt-2"><input id="account-new-password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} dir="ltr" className="min-h-12 w-full rounded-xl border border-border bg-background px-4 pe-24 text-base outline-none focus:border-primary" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-surface-muted">{showPassword ? t("hide") : t("show")}</button></div></div><div><label htmlFor="account-confirm-password" className="block text-sm font-semibold text-navy">{t("confirmNewPassword")}</label><input id="account-confirm-password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} dir="ltr" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div></> : <div><label htmlFor="account-reset-email" className="block text-sm font-semibold text-navy">{t("email")}</label><input id="account-reset-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div>}{error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}{message ? <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}<button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-white hover:bg-navy disabled:opacity-50">{busy ? t("pleaseWait") : session ? t("setPassword") : t("sendResetLink")}</button></form><Link href="/" className="mt-6 inline-block text-sm font-semibold text-primary underline">{t("backToWebsite")}</Link></div></div></main>;
}
