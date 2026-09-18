"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { consumeAuthCallback, friendlyAuthError, refreshSession, requestPasswordReset, resetRedirect, roleOf, updatePassword, type Role, type Session } from "@/lib/auth-client";

export function PasswordReset({ expectedRole }: { expectedRole: Role }) {
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
    })).catch((caught) => { if (active) { setError(friendlyAuthError(caught, "This authentication link is no longer valid.")); setReady(true); } });
    return () => { active = false; };
  }, [expectedRole]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null); setMessage(null);
    try {
      if (!session) {
        await requestPasswordReset(email, resetRedirect(expectedRole));
        setMessage("If this account exists, a password reset link has been sent.");
      } else if (password.length < 8) {
        setError("Choose a password with at least 8 characters.");
      } else if (password !== confirmation) {
        setError("The password confirmations do not match.");
      } else {
        const updated = await updatePassword(password);
        setPassword(""); setConfirmation("");
        window.location.replace(roleOf(updated) === "site_owner" ? "/owner" : "/backoffice");
      }
    } catch (caught) { setError(friendlyAuthError(caught, "We could not complete that request.")); }
    finally { setBusy(false); }
  };

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-muted">Loading secure account flow…</main>;

  return <main className="flex min-h-screen items-center bg-background px-5 py-10 sm:px-8 sm:py-16"><div className="mx-auto w-full max-w-md"><Link href="/" className="text-sm font-bold tracking-wide text-primary">Ster Schoonmaak</Link><div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-sm sm:p-9"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{owner ? "Site owner" : "Backoffice"}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy">{session ? "Set a new password" : "Reset your password"}</h1><p className="mt-3 text-base leading-7 text-muted">{session ? "Choose a secure password for your Ster Schoonmaak account." : "Enter your email address and we will send a secure reset link."}</p><form onSubmit={submit} className="mt-8 space-y-5">{session ? <><div><label htmlFor="new-password" className="block text-sm font-semibold text-navy">New password</label><div className="relative mt-2"><input id="new-password" type={showPassword ? "text" : "password"} minLength={8} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-12 w-full rounded-xl border border-border bg-background px-4 pr-24 text-base outline-none focus:border-primary" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-pressed={showPassword} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-surface-muted">{showPassword ? "Hide" : "Show"}</button></div></div><div><label htmlFor="confirm-password" className="block text-sm font-semibold text-navy">Confirm new password</label><input id="confirm-password" type={showPassword ? "text" : "password"} minLength={8} required autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div></> : <div><label htmlFor="reset-email" className="block text-sm font-semibold text-navy">Email address</label><input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div>}{error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}{message ? <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}<button disabled={busy} className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-white hover:bg-navy disabled:pointer-events-none disabled:opacity-50">{busy ? "Please wait…" : session ? "Set password" : "Send reset link"}</button></form><Link href={owner ? "/owner/login" : "/backoffice/login"} className="mt-6 inline-block text-sm font-semibold text-primary underline">Back to sign in</Link></div></div></main>;
}
