import { getTranslations } from "next-intl/server";
import { quotePath } from "@/config/navigation";
import { Link } from "@/i18n/navigation";

export async function TopBar() {
  const t = await getTranslations("topBar");

  return (
    <div className="border-b border-[#254268] bg-navy text-sm text-white">
      <div className="mx-auto flex min-h-9 w-full max-w-[76rem] items-center justify-between gap-3 px-5 sm:gap-4 sm:px-8">
        <ul className="flex min-w-0 items-center gap-2 text-xs sm:gap-6 sm:text-sm" aria-label={t("label")}>
          <li className="sm:hidden">{t("mobileServiceArea")}</li>
          <li className="hidden sm:block">{t("serviceArea")}</li>
          <li className="flex items-center gap-2 text-white/75">
            <span aria-hidden="true">•</span>
            <span className="sm:hidden">{t("mobileDays")}</span>
            <span className="hidden sm:inline">{t("days")}</span>
          </li>
        </ul>
        <Link
          href={quotePath}
          className="hidden shrink-0 font-semibold text-white underline-offset-4 hover:underline sm:block"
        >
          {t("quote")}
        </Link>
      </div>
    </div>
  );
}
