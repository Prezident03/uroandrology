import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, localeCookie, locales, type Locale } from "@/lib/i18n/config";

function preferredLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get(localeCookie)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const accept = request.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase().split("-")[0];
    if (isLocale(tag)) return tag;
  }
  return defaultLocale;
}

/** Adds the locale prefix to any path that lacks one (/, /dashboard, ...). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;
  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "/dashboard" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
