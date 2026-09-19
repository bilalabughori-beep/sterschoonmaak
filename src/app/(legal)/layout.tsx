import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import messages from "../../../messages/en-BE.json";
import { PublicDocumentScope } from "@/components/layout/public-document-scope";
import { SiteShell } from "@/components/layout/site-shell";

export default function LegalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  setRequestLocale("en-BE");

  return (
    <NextIntlClientProvider locale="en-BE" messages={messages}>
      <PublicDocumentScope locale="en-BE">
        <SiteShell>{children}</SiteShell>
      </PublicDocumentScope>
    </NextIntlClientProvider>
  );
}
