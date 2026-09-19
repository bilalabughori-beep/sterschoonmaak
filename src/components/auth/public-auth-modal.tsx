"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { friendlyPublicAuthError, requestPasswordReset, roleOf, routeForSession, signIn, signInWithGoogle, signUp, subscribeAuthState, type Session } from "@/lib/auth-client";

type AuthMode = "login" | "signup" | "forgot";

export function PublicAuthButton({ className = "" }: { className?: string }) {
  const t = useTranslations("auth");
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void import("@/lib/auth-client").then(({ refreshSession }) => refreshSession()).then((next) => { if (active) setSession(next); }).catch(() => undefined);
    let unsubscribe: (() => void) | undefined;
    try { unsubscribe = subscribeAuthState((next) => setSession(next)); } catch { /* Auth can be unavailable during static preview. */ }
    return () => { active = false; unsubscribe?.(); };
  }, []);

  const label = session ? (roleOf(session) ? t("backoffice") : t("account")) : t("login");
  return <><button type="button" onClick={() => { if (session) window.location.assign(routeForSession(session)); else setOpen(true); }} className={`inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1249b6] ${className}`}>{label}</button>{open && typeof document !== "undefined" ? createPortal(<PublicAuthModal onClose={() => setOpen(false)} />, document.body) : null}</>;
}

function PublicAuthModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const resetFormScroll = () => {
    formScrollRef.current?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    resetFormScroll();
    closeButtonRef.current?.focus({ preventScroll: true });
    const frame = window.requestAnimationFrame(resetFormScroll);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const firstElement = focusable[0]; const lastElement = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) { event.preventDefault(); lastElement.focus(); }
      else if (!event.shiftKey && document.activeElement === lastElement) { event.preventDefault(); firstElement.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { window.cancelAnimationFrame(frame); document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); previousFocus.current?.focus({ preventScroll: true }); };
  }, [onClose]);

  const changeMode = (next: AuthMode) => { setMode(next); setError(null); setMessage(null); setPassword(""); setConfirmation(""); resetFormScroll(); window.requestAnimationFrame(resetFormScroll); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null); setMessage(null);
    try {
      if (mode === "forgot") {
        await requestPasswordReset(email);
        setMessage(t("resetSent"));
      } else if (mode === "login") {
        const session = await signIn(email, password);
        window.location.replace(routeForSession(session));
      } else if (password.length < 8) {
        setError(t("passwordMin"));
      } else if (password !== confirmation) {
        setError(t("passwordMismatch"));
      } else {
        const session = await signUp(email, password, name);
        if (session) window.location.replace(routeForSession(session));
        else setMessage(t("checkEmail"));
      }
    } catch (caught) { setError(friendlyPublicAuthError(caught, t("requestFailed"))); }
    finally { setBusy(false); if (mode !== "forgot") setPassword(""); }
  };

  const heading = mode === "signup" ? t("signUp") : mode === "forgot" ? t("resetTitle") : t("login");
  return <div className="fixed inset-0 z-[1000] h-[100dvh] w-screen overflow-hidden bg-navy/50" role="presentation"><div className="flex h-full w-full items-start justify-center px-4 py-4 sm:px-6 sm:py-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="public-auth-title" style={{ maxHeight: "calc(100dvh - 2rem)" }} className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"><div className="flex-none p-6 pb-0 sm:p-8 sm:pb-0"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Ster Schoonmaak</p><h2 id="public-auth-title" className="mt-2 text-2xl font-semibold tracking-tight text-navy">{heading}</h2></div><button ref={closeButtonRef} type="button" onClick={onClose} aria-label={t("close")} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-2xl leading-none text-muted hover:bg-surface-muted">×</button></div>{mode !== "forgot" ? <div className="mt-6 grid grid-cols-2 rounded-xl bg-surface-muted p-1"><button type="button" onClick={() => changeMode("login")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-surface text-primary shadow-sm" : "text-muted"}`}>{t("login")}</button><button type="button" onClick={() => changeMode("signup")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "signup" ? "bg-surface text-primary shadow-sm" : "text-muted"}`}>{t("signUp")}</button></div> : null}{mode !== "forgot" ? <><button type="button" disabled={busy} onClick={() => void signInWithGoogle().catch((caught) => setError(friendlyPublicAuthError(caught, t("googleUnavailable"))))} className="mt-6 min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-navy hover:border-primary disabled:opacity-50">{t("continueGoogle")}</button><div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted"><span className="h-px flex-1 bg-border" />{t("or")}<span className="h-px flex-1 bg-border" /></div></> : null}</div><div ref={formScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 [overflow-anchor:none] sm:px-8 sm:pb-8"><form onSubmit={submit} className={`space-y-4 ${mode === "forgot" ? "pt-6 sm:pt-8" : ""}`}>{mode === "signup" ? <div><label htmlFor="public-auth-name" className="block text-sm font-semibold text-navy">{t("name")}</label><input id="public-auth-name" type="text" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div> : null}<div><label htmlFor="public-auth-email" className="block text-sm font-semibold text-navy">{t("email")}</label><input id="public-auth-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div>{mode !== "forgot" ? <div><label htmlFor="public-auth-password" className="block text-sm font-semibold text-navy">{t("password")}</label><div className="relative mt-2"><input id="public-auth-password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} dir="ltr" className="min-h-12 w-full rounded-xl border border-border bg-background px-4 pe-24 text-base outline-none focus:border-primary" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-surface-muted">{showPassword ? t("hide") : t("show")}</button></div></div> : null}{mode === "signup" ? <div><label htmlFor="public-auth-confirm" className="block text-sm font-semibold text-navy">{t("confirmPassword")}</label><input id="public-auth-confirm" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} dir="ltr" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary" /></div> : null}{error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}{message ? <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}<button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-white hover:bg-navy disabled:opacity-50">{busy ? t("pleaseWait") : mode === "signup" ? t("createAccount") : mode === "forgot" ? t("sendResetLink") : t("login")}</button></form><div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">{mode === "login" ? <button type="button" onClick={() => changeMode("forgot")} className="font-semibold text-primary underline">{t("forgotPassword")}</button> : <button type="button" onClick={() => changeMode("login")} className="font-semibold text-primary underline">{t("backToLogin")}</button>}{mode === "login" ? <button type="button" onClick={() => changeMode("signup")} className="text-muted underline">{t("noAccount")}</button> : mode === "signup" ? <button type="button" onClick={() => changeMode("login")} className="text-muted underline">{t("hasAccount")}</button> : null}</div></div></div></div></div>;
}
