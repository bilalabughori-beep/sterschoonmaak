"use client";

import { useTranslations } from "next-intl";
import { navigationItems } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav() {
  const t = useTranslations("navigation");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="hidden lg:block">
      <ul className="flex items-center gap-5 xl:gap-7">
        {navigationItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-5 text-[0.9375rem] font-semibold transition-colors after:absolute after:inset-x-0 after:bottom-2 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:text-primary hover:after:scale-x-100 ${active ? "text-primary after:scale-x-100" : "text-navy/80"}`}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
