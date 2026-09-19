import { getTranslations } from "next-intl/server";
import { BrandLogo } from "@/components/shared/brand-logo";
import { navigationItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { toTelHref, toWhatsAppHref } from "@/lib/contact-links";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const navigationT = await getTranslations("navigation");
  const contactT = await getTranslations("contactPage");
  const phoneHref = toTelHref(siteConfig.contact.phone);
  const whatsappHref = toWhatsAppHref(siteConfig.contact.whatsapp, contactT("whatsappMessage"));
  const socialLinks = [
    { label: "Facebook", href: siteConfig.social.facebook },
    { label: "Instagram", href: siteConfig.social.instagram },
    { label: "TikTok", href: siteConfig.social.tiktok },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <BrandLogo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">{t("descriptor")}</p>
          <p className="mt-3 text-sm font-semibold text-white">{siteConfig.tagline}</p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/60">
            {t("navigation")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {navigationItems.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="text-white/85 underline-offset-4 hover:text-white hover:underline">
                  {navigationT(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/60">
            {t("services")}
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">{t("servicesPending")}</p>
          <Link href="/diensten" className="mt-3 inline-block text-sm font-semibold text-white underline-offset-4 hover:underline">{t("servicesLink")}</Link>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/60">
            {t("contact")}
          </h2>
          <p className="mt-4 text-sm text-white/85">{t("location")}</p>
          {phoneHref ? <a href={phoneHref} className="mt-4 block text-sm font-semibold text-white underline-offset-4 hover:underline">{contactT("phoneLabel")}<span className="mt-1 block font-normal text-white/70">{siteConfig.contact.phoneDisplay}</span></a> : null}
          {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm font-semibold text-white underline-offset-4 hover:underline">{contactT("whatsappLabel")}</a> : null}
          {socialLinks.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-4 text-sm">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <nav aria-label={t("legalLabel")}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li>
                <a href={`${siteConfig.siteUrl}/privacy`} className="underline-offset-4 hover:text-white hover:underline">
                  {t("privacy")}
                </a>
              </li>
              <li>
                <a href={`${siteConfig.siteUrl}/terms`} className="underline-offset-4 hover:text-white hover:underline">
                  {t("terms")}
                </a>
              </li>
              <li>
                <Link href="/cookiebeleid" className="underline-offset-4 hover:text-white hover:underline">
                  {t("cookies")}
                </Link>
              </li>
              {siteConfig.legal.vatNumber ? <li>{siteConfig.legal.vatNumber}</li> : null}
              {siteConfig.legal.enterpriseNumber ? <li>{siteConfig.legal.enterpriseNumber}</li> : null}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
