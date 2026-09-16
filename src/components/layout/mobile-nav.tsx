"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { navigationItems, quotePath } from "@/config/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a, button, select, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border text-navy transition-colors hover:bg-surface-muted"
      >
        <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
        <span aria-hidden="true" className="text-xl leading-none">
          {open ? "×" : "☰"}
        </span>
      </button>

      {open ? (
        <div
          id="mobile-navigation"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("mobileLabel")}
          className="fixed inset-0 top-[7rem] z-50 overflow-y-auto bg-surface px-5 pb-8 pt-6 sm:px-8"
        >
          <nav aria-label={t("label")}>
            <ul className="divide-y divide-border border-y border-border">
              {navigationItems.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMenu}
                      className={`flex min-h-14 items-center justify-between text-lg font-semibold ${active ? "text-primary" : "text-navy"}`}
                    >
                      {t(item.key)}
                      {active ? <span aria-hidden="true">●</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <ButtonLink href={quotePath} size="lg" onClick={closeMenu}>
              {t("quote")}
            </ButtonLink>
            <LanguageSwitcher />
          </div>
        </div>
      ) : null}
    </div>
  );
}
