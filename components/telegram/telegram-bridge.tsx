"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { localizedPath } from "@/components/navigation/language-switcher";
import { localeCookie, locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { isTelegramLaunch, loadTelegramSdk, type TelegramWebApp } from "@/lib/telegram/webapp";

const BG = "#0b1120";
const BAR = "#111827";

/**
 * Connects the site to Telegram when it is opened as a Mini App: dark header and background,
 * the native back button, no swipe-to-close while scrolling, external links via Telegram, and the
 * user's Telegram language on first open. Outside Telegram it does nothing and loads nothing.
 * No Telegram user data is stored or sent anywhere.
 */
export function TelegramBridge() {
  const [app, setApp] = useState<TelegramWebApp>();
  const { locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isTelegramLaunch()) return;
    document.documentElement.classList.add("tg");
    let cancelled = false;
    loadTelegramSdk().then((wa) => {
      if (cancelled || !wa) return;
      wa.ready();
      wa.expand();
      if (wa.isVersionAtLeast("6.1")) {
        wa.setHeaderColor(BG);
        wa.setBackgroundColor(BG);
      }
      if (wa.isVersionAtLeast("7.10")) wa.setBottomBarColor?.(BAR);
      if (wa.isVersionAtLeast("7.7")) wa.disableVerticalSwipes?.();
      setApp(wa);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // First open: follow the Telegram interface language unless the user already picked one here.
  useEffect(() => {
    if (!app) return;
    const lang = app.initDataUnsafe.user?.language_code?.slice(0, 2);
    const chosen = document.cookie.split("; ").some((c) => c.startsWith(`${localeCookie}=`));
    if (chosen || !lang || !(locales as readonly string[]).includes(lang) || lang === locale) return;
    document.cookie = `${localeCookie}=${lang}; path=/; max-age=31536000; samesite=lax`;
    router.replace(localizedPath(window.location.pathname, lang as Locale));
  }, [app, locale, router]);

  // Native back button everywhere except the dashboard.
  useEffect(() => {
    if (!app || !app.isVersionAtLeast("6.1")) return;
    const home = pathname === `/${locale}/dashboard` || pathname === `/${locale}`;
    const back = () => (window.history.length > 1 ? router.back() : router.push(`/${locale}/dashboard`));
    if (home) {
      app.BackButton.hide();
      return;
    }
    app.BackButton.show();
    app.BackButton.onClick(back);
    return () => app.BackButton.offClick(back);
  }, [app, pathname, locale, router]);

  // Links to other sites open in Telegram's browser instead of replacing the Mini App.
  useEffect(() => {
    if (!app) return;
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin === window.location.origin || !/^https?:$/.test(url.protocol)) return;
      e.preventDefault();
      app!.openLink(url.href);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [app]);

  return null;
}
