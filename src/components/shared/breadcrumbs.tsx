import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type BreadcrumbParent = { href: string; label: string };

export async function Breadcrumbs({ current, parent }: { current?: string; parent?: BreadcrumbParent }) {
  const t = await getTranslations("navigation");

  return (
    <nav aria-label={t("breadcrumbs")} className="text-sm text-navy/65">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <li><Link href="/" className="underline-offset-4 hover:text-primary hover:underline">{t("home")}</Link></li>
        {parent ? <><li aria-hidden="true">/</li><li><Link href={parent.href as never} className="underline-offset-4 hover:text-primary hover:underline">{parent.label}</Link></li></> : null}
        {current ? <><li aria-hidden="true">/</li><li aria-current="page" className="font-semibold text-navy">{current}</li></> : null}
      </ol>
    </nav>
  );
}
