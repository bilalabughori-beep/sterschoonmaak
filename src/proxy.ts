import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // Next.js can run the proxy again after an internal rewrite. Preserve the
  // locale already resolved by next-intl instead of resolving the internal
  // pathname as a new public URL.
  if (request.headers.has("X-NEXT-INTL-LOCALE")) {
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
