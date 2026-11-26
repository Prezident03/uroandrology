import { locale as rootLocale } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { createTranslator, type Messages } from "./translate";

const loaders: Record<Locale, () => Promise<Messages>> = {
  uz: () => import("@/messages/uz.json").then((m) => m.default),
  en: () => import("@/messages/en.json").then((m) => m.default),
  ru: () => import("@/messages/ru.json").then((m) => m.default),
};

/** Current locale from the [locale] root segment. Unknown locales render 404. */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale();
  if (!isLocale(value)) notFound();
  return value;
}

export async function getMessages(locale?: Locale): Promise<Messages> {
  return loaders[locale ?? (await getLocale())]();
}

export async function getTranslator(locale?: Locale) {
  return createTranslator(await getMessages(locale));
}
