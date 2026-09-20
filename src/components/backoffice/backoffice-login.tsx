"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { friendlyAuthError, requestPasswordReset, resetRedirect, routeForSession, signIn, signInWithGoogle, type Role } from "@/lib/auth-client";
import { BackofficeLanguageSwitcher } from "@/components/backoffice/backoffice-language-switcher";
import { BackofficeLocaleProvider, useBackofficeLocale } from "@/lib/backoffice-i18n";

export function BackofficeLogin({ expectedRole }: { expectedRole: Role }) {
  return <BackofficeLocaleProvider><BackofficeLoginContent expectedRole={expectedRole} /></BackofficeLocaleProvider>;
}

function BackofficeLoginContent({ expectedRole }: { expectedRole: Role }) {
  const { t } = useBackofficeLocale();
  const liveBrandLabel = "Ster Schoonmaak";
  const owner = expectedRole === "site_owner";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(null); setMessage(null);
    try {
      if (forgot) {
        await requestPasswordReset(email, resetRedirect(expectedRole));
        setMessage(t("passwordResetSent"));
      } else {
        const session = await signIn(email, password);
        window.location.replace(routeForSession(session));
      }
    } catch (caught) { setError(friendlyAuthError(caught, t("requestFailed"))); }
    finally { setBusy(false); setPassword(""); }
  };

  return (
    <main className="flex min-h-screen items-center bg-background px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-bold tracking-wide text-primary">{liveBrandLabel}</Link>
          <BackofficeLanguageSwitcher />
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{owner ? t("siteOwner") : t("backoffice")}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy">{forgot ? t("resetYourPassword") : t("signInSecurely")}</h1>
          <p className="mt-3 text-base leading-7 text-muted">{owner ? t("manageComplaintsOffers") : t("viewHandleComplaints")}</p>
          {!forgot && owner ? <button type="button" disabled={busy} onClick={() => { setBusy(true); setError(null); void signInWithGoogle().catch((caught) => setError(friendlyAuthError(caught, t("requestFailed")))).finally(() => setBusy(false)); }} className="mt-8 min-h-12 w-full rounded-xl border border-border bg-surface px-5 py-3 text-base font-bold text-navy hover:border-primary disabled:opacity-50">{t("continueGoogle")}</button> : null}
          {!forgot && owner ? <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted"><span className="h-px flex-1 bg-border" />{t("or")}<span className="h-px flex-1 bg-border" /></div> : null}
          <form onSubmit={submit} className={`${forgot || !owner ? "mt-8" : "mt-5"} space-y-5`}>
            <div><label htmlFor="login-email" className="block text-sm font-semibold text-navy">{t("email")}</label><input id="login-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div>
            {!forgot ? <div><label htmlFor="login-password" className="block text-sm font-semibold text-navy">{t("password")}</label><div className="relative mt-2"><input id="login-password" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} dir="ltr" className="min-h-12 w-full rounded-xl border border-border bg-background px-4 pe-24 text-base outline-none focus:border-primary" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-pressed={showPassword} className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-surface-muted">{showPassword ? t("hide") : t("show")}</button></div></div> : null}
            {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
            {message ? <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}
            <button disabled={busy} className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-white hover:bg-navy disabled:pointer-events-none disabled:opacity-50">{busy ? t("pleaseWait") : forgot ? t("sendResetLink") : t("signIn")}</button>
          </form>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm"><button type="button" onClick={() => { setForgot((value) => !value); setError(null); setMessage(null); setPassword(""); }} className="font-semibold text-primary underline">{forgot ? t("backToSignIn") : t("forgotPassword")}</button><Link href="/" className="text-muted underline">{t("backToWebsite")}</Link></div>
        </div>
      </div>
    </main>
  );
}
