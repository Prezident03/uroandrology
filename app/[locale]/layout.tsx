import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { htmlLang, locales } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/client";
import { getSearchExtras } from "@/lib/content";
import { getLocale, getMessages } from "@/lib/i18n/server";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages();
  return {
    title: {
      default: `${messages.meta.appName} — ${messages.meta.appTagline}`,
      template: `%s · ${messages.meta.appName}`,
    },
    description: messages.meta.description,
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0B1120",
  colorScheme: "dark",
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  const searchExtras = getSearchExtras(locale, {
    algorithms: messages.nav.algorithms,
    guidelines: messages.nav.guidelines,
    cases: messages.nav.cases,
  });
  return (
    <html lang={htmlLang[locale]} className={`${inter.variable} ${jetbrains.variable} antialiased`}>
      <body>
        <I18nProvider locale={locale} messages={messages}>
          <AppShell searchExtras={searchExtras}>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
