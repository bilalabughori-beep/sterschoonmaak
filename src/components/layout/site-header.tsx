import { getTranslations } from "next-intl/server";
import { quotePath } from "@/config/navigation";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ButtonLink } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function SiteHeader() {
  const t = await getTranslations("navigation");

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-22 w-full max-w-[76rem] items-center justify-between gap-5 px-5 sm:px-8">
        <Link href="/" aria-label={t("home")} className="shrink-0">
          <BrandLogo />
        </Link>
        <DesktopNav />
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <ButtonLink href={quotePath} size="sm">
            {t("quote")}
          </ButtonLink>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
