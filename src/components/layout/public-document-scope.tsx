"use client";

import { useEffect, type ReactNode } from "react";
import type { SupportedLocale } from "@/config/site";

export function PublicDocumentScope({ locale, children }: { locale: SupportedLocale; children: ReactNode }) {
  useEffect(() => {
    const previous = {
      documentLang: document.documentElement.lang,
      documentDir: document.documentElement.dir,
      bodyDir: document.body.dir,
    };

    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";
    document.body.dir = "ltr";

    return () => {
      document.documentElement.lang = previous.documentLang || "nl-BE";
      document.documentElement.dir = previous.documentDir || "ltr";
      document.body.dir = previous.bodyDir || "ltr";
    };
  }, [locale]);

  return children;
}
