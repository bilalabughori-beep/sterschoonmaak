import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import messages from "../../../messages/nl-BE.json";

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  setRequestLocale("nl-BE");
  return <NextIntlClientProvider locale="nl-BE" messages={messages}>{children}</NextIntlClientProvider>;
}
