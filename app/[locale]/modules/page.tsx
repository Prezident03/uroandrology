import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ModuleCard } from "@/components/dashboard/module-card";
import { clinicalModules } from "@/lib/clinical/modules";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("modules.title") };
}

export default async function ModulesPage() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title={t("modules.title")} description={t("modules.intro")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {clinicalModules.map((m) => (
          <ModuleCard key={m.id} module={m} locale={locale} t={t} />
        ))}
      </div>
    </div>
  );
}
