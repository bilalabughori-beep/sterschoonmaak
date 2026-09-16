import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TopBar } from "@/components/layout/top-bar";

export async function SiteShell({ children }: Readonly<{ children: ReactNode }>) {
  const t = await getTranslations("common");

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[60] rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
      >
        {t("skipToContent")}
      </a>
      <TopBar />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
