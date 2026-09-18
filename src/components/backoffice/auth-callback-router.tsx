"use client";

import { useEffect, useState } from "react";
import { consumeAuthCallback, hasAuthCallbackUrl, roleOf } from "@/lib/auth-client";

function resetPath(role: "client_admin" | "site_owner") { return role === "site_owner" ? "/owner/reset" : "/backoffice/reset"; }

export function AuthCallbackRouter() {
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let active = true;
    if (!hasAuthCallbackUrl()) {
      const timer = window.setTimeout(() => { if (active) setProcessing(false); }, 0);
      return () => { active = false; window.clearTimeout(timer); };
    }
    void consumeAuthCallback().then((session) => {
      const role = roleOf(session);
      if (!role) return;
      const target = resetPath(role);
      if (window.location.pathname !== target) window.location.replace(target);
    }).catch(() => undefined).finally(() => {
      if (active) setProcessing(false);
    });
    return () => { active = false; };
  }, []);

  if (!processing) return null;
  return <div role="status" aria-label="Loading secure account flow" className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-5 text-muted">Loading secure account flow…</div>;
}
