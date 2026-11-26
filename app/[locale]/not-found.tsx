import Link from "next/link";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  return (
    <div className="mx-auto max-w-reading py-16 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 text-2xl font-semibold">{t("notFound.title")}</h1>
      <Link href={`/${locale}/dashboard`} className="mt-6 inline-block text-primary hover:underline">
        {t("notFound.back")}
      </Link>
    </div>
  );
}
