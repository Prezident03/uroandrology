export const locales = ["uz", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uz";
export const localeCookie = "UA_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** BCP 47 tags used for <html lang> and hreflang. Uzbek is Latin script. */
export const htmlLang: Record<Locale, string> = {
  uz: "uz-Latn",
  en: "en",
  ru: "ru",
};
