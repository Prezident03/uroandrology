import type { Metadata } from "next";
import Link from "next/link";
import { History, Info } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ModuleCard } from "@/components/dashboard/module-card";
import { BookmarkedPages, FrequentTools, RecentPages } from "@/components/dashboard/module-lists";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listReferences } from "@/lib/content";
import { clinicalModules } from "@/lib/clinical/modules";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("dashboard.title") };
}

export default async function DashboardPage() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const updates = listReferences()
    .flatMap((r) => (r.updates ?? []).map((u) => ({ ...u, key: r.key, title: r.title, org: r.organization })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
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
        <RecentPages />
        <BookmarkedPages />
        <FrequentTools />
        <Card>
          <CardHeader className="justify-start">
            <History aria-hidden="true" className="size-4 text-muted" />
            <CardTitle>{t("dashboard.guidelineUpdatesTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {updates.length === 0 ? (
              <p className="text-sm text-muted">{t("dashboard.guidelineUpdatesEmpty")}</p>
            ) : (
              <ul className="-mx-2 space-y-1">
                {updates.map((u) => (
                  <li key={`${u.key}-${u.date}`}>
                    <Link href={`/${locale}/guidelines/${u.key}`} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-card-hover">
                      <span className="block truncate">{u.org} · {u.title}</span>
                      <span className="block truncate text-xs text-muted"><time dateTime={u.date}>{u.date}</time> · {u.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/${locale}/guidelines`} className="mt-3 inline-block text-sm text-primary hover:underline">{t("dashboard.allGuidelines")}</Link>
          </CardContent>
        </Card>
        <div role="note" className="flex gap-3 rounded-card border border-border bg-background-subtle p-5 md:col-span-2">
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
