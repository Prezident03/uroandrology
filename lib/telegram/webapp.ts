/**
 * Minimal typing of the Telegram Mini App SDK (https://core.telegram.org/bots/webapps).
 * Only what this app uses. The SDK is loaded only when the page is opened inside Telegram.
 */
export interface TelegramBackButton {
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
}

export interface TelegramWebApp {
  version: string;
  platform: string;
  initData: string;
  initDataUnsafe: { user?: { language_code?: string } };
  ready(): void;
  expand(): void;
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  BackButton: TelegramBackButton;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
    TelegramWebviewProxy?: unknown;
  }
}

export const TELEGRAM_SDK_URL = "https://telegram.org/js/telegram-web-app.js";
const FLAG = "ua-telegram";

/**
 * True when the page runs as a Telegram Mini App. Telegram passes launch parameters in the URL
 * fragment on first load; the result is remembered for the tab so client-side navigation keeps it.
 */
export function isTelegramLaunch(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(FLAG) === "1") return true;
    const launched = /tgWebApp(Data|Platform|Version)=/.test(window.location.hash) || Boolean(window.TelegramWebviewProxy);
    if (launched) sessionStorage.setItem(FLAG, "1");
    return launched;
  } catch {
    return /tgWebApp(Data|Platform|Version)=/.test(window.location.hash);
  }
}

export function loadTelegramSdk(): Promise<TelegramWebApp | undefined> {
  if (window.Telegram?.WebApp) return Promise.resolve(window.Telegram.WebApp);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = TELEGRAM_SDK_URL;
    s.async = true;
    s.onload = () => resolve(window.Telegram?.WebApp);
    s.onerror = () => resolve(undefined);
    document.head.appendChild(s);
  });
}
