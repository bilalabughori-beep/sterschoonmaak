"use client";

import { useEffect, useState } from "react";
import { consumeAuthCallback, hasAuthCallbackUrl, isRecoveryCallbackUrl, roleOf } from "@/lib/auth-client";

function callbackPath(recovery: boolean, role: "client_admin" | "site_owner" | null) {
  if (recovery) return role === "site_owner" ? "/owner/reset" : role === "client_admin" ? "/backoffice/reset" : "/account/reset";
  return role === "site_owner" ? "/owner" : role === "client_admin" ? "/backoffice" : "/account";
}

export function AuthCallbackRouter() {
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let active = true;
    if (!hasAuthCallbackUrl()) {
      const timer = window.setTimeout(() => { if (active) setProcessing(false); }, 0);
      return () => { active = false; window.clearTimeout(timer); };
    }
    const recovery = isRecoveryCallbackUrl();
    void consumeAuthCallback().then((session) => {
      const role = roleOf(session);
      const target = callbackPath(recovery, role);
      if (window.location.pathname !== target) window.location.replace(target);
    }).catch(() => undefined).finally(() => {
      if (active) setProcessing(false);
    });
    return () => { active = false; };
  }, []);

  if (!processing) return null;
  return <div role="status" aria-label="Loading secure account flow" className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-5 text-muted">Loading secure account flow…</div>;
}
