import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ModuleCard } from "@/components/dashboard/module-card";
import { BookmarkedModules, RecentModules } from "@/components/dashboard/module-lists";
import { clinicalModules } from "@/lib/clinical/modules";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("dashboard.title") };
}

export default async function DashboardPage() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader title={t("dashboard.welcome")} description={t("dashboard.welcomeText")} />

      <section aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="mb-4 text-lg font-semibold">{t("dashboard.modulesTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clinicalModules.map((m) => (
            <ModuleCard key={m.id} module={m} locale={locale} t={t} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RecentModules />
        <BookmarkedModules />
        <div role="note" className="flex gap-3 rounded-card border border-border bg-background-subtle p-5 md:col-span-2 xl:col-span-1">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="text-sm">
            <h2 className="font-semibold">{t("dashboard.contentStatusTitle")}</h2>
            <p className="mt-1 text-muted">{t("dashboard.contentStatusText")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
