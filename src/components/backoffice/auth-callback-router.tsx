"use client";

import { useEffect } from "react";
import { consumeAuthCallback, hasAuthCallbackUrl, roleOf } from "@/lib/auth-client";

function resetPath(role: "client_admin" | "site_owner") { return role === "site_owner" ? "/owner/reset" : "/backoffice/reset"; }

export function AuthCallbackRouter() {
  useEffect(() => {
    if (!hasAuthCallbackUrl()) return;
    void consumeAuthCallback().then((session) => {
      const role = roleOf(session);
      if (!role) return;
      const target = resetPath(role);
      if (window.location.pathname !== target) window.location.replace(target);
    }).catch(() => undefined);
  }, []);

  return null;
}
