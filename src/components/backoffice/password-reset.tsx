"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { consumeAuthCallback, friendlyAuthError, refreshSession, requestPasswordReset, resetRedirect, roleOf, updatePassword, type Role, type Session } from "@/lib/auth-client";
import { BackofficeLanguageSwitcher } from "@/components/backoffice/backoffice-language-switcher";
import { BackofficeLocaleProvider, useBackofficeLocale } from "@/lib/backoffice-i18n";

export function PasswordReset({ expectedRole }: { expectedRole: Role }) {
  return <BackofficeLocaleProvider><PasswordResetContent expectedRole={expectedRole} /></BackofficeLocaleProvider>;
}

function PasswordResetContent({ expectedRole }: { expectedRole: Role }) {
  const { t } = useBackofficeLocale();
  const owner = expectedRole === "site_owner";
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void consumeAuthCallback().then((callbackSession) => refreshSession().then((current) => {
      if (!active) return;
      const next = callbackSession ?? current;
      const role = roleOf(next);
      if (role && role !== expectedRole) { window.location.replace(role === "site_owner" ? "/owner/reset" : "/backoffice/reset"); return; }
      setSession(next); setReady(true);
    })).catch((caught) => { if (active) { setError(friendlyAuthError(caught, t("authLinkInvalid"))); setReady(true); } });
    return () => { active = false; };
  }, [expectedRole, t]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null); setMessage(null);
    try {
      if (!session) {
        await requestPasswordReset(email, resetRedirect(expectedRole));
        setMessage(t("passwordResetSent"));
      } else if (password.length < 8) {
        setError(t("passwordMin"));
      } else if (password !== confirmation) {
        setError(t("passwordMismatch"));
      } else {
        const updated = await updatePassword(password);
        setPassword(""); setConfirmation("");
        window.location.replace(roleOf(updated) === "site_owner" ? "/owner" : "/backoffice");
      }
    } catch (caught) { setError(friendlyAuthError(caught, t("requestFailed"))); }
    finally { setBusy(false); }
  };

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-muted">{t("secureFlowLoading")}</main>;

  return (
    <main className="flex min-h-screen items-center bg-background px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between gap-4"><Link href="/" className="text-sm font-bold tracking-wide text-primary">{t("brand")}</Link><BackofficeLanguageSwitcher /></div>
        <div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{owner ? t("siteOwner") : t("backoffice")}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy">{session ? t("setNewPassword") : t("resetYourPassword")}</h1>
          <p className="mt-3 text-base leading-7 text-muted">{session ? t("chooseSecurePassword") : t("enterEmailForReset")}</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {session ? <><div><label htmlFor="new-password" className="block text-sm font-semibold text-navy">{t("newPassword")}</label><div className="relative mt-2"><input id="new-password" type={showPassword ? "text" : "password"} minLength={8} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} dir="ltr" className="min-h-12 w-full rounded-xl border border-border bg-background px-4 pe-24 text-base outline-none focus:border-primary" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-pressed={showPassword} className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-surface-muted">{showPassword ? t("hide") : t("show")}</button></div></div><div><label htmlFor="confirm-password" className="block text-sm font-semibold text-navy">{t("confirmNewPassword")}</label><input id="confirm-password" type={showPassword ? "text" : "password"} minLength={8} required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} dir="ltr" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div></> : <div><label htmlFor="reset-email" className="block text-sm font-semibold text-navy">{t("email")}</label><input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div>}
            {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
            {message ? <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}
            <button disabled={busy} className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-white hover:bg-navy disabled:pointer-events-none disabled:opacity-50">{busy ? t("pleaseWait") : session ? t("setPassword") : t("sendResetLink")}</button>
          </form>
          <Link href={owner ? "/owner/login" : "/backoffice/login"} className="mt-6 inline-block text-sm font-semibold text-primary underline">{t("backToSignIn")}</Link>
        </div>
      </div>
    </main>
  );
}
