import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function ServiceBreadcrumbs({ current }: { current?: string }) {
  const t = await getTranslations("navigation");

  return (
    <nav aria-label={t("breadcrumbs")} className="text-sm text-navy/65">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <li><Link href="/" className="underline-offset-4 hover:text-primary hover:underline">{t("home")}</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link href="/diensten" className="underline-offset-4 hover:text-primary hover:underline">{t("services")}</Link></li>
        {current ? <><li aria-hidden="true">/</li><li aria-current="page" className="font-semibold text-navy">{current}</li></> : null}
      </ol>
    </nav>
  );
}
