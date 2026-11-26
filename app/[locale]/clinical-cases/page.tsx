import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Stethoscope } from "lucide-react";
import { StatusBadge } from "@/components/clinical/status-badge";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { getCaseContent, listCaseSlugs } from "@/lib/content";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("cases.title") };
}

export default async function CasesPage() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const cases = listCaseSlugs()
    .map((slug) => ({ slug, ...getCaseContent(slug, locale) }))
    .filter((c) => c.entry || c.otherLocales.length > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={t("cases.title")} description={t("cases.intro")} />
      <p role="note" className="rounded-card border border-border bg-background-subtle p-4 text-sm text-muted">{t("cases.policy")}</p>
      {cases.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-8 text-center">
          <Stethoscope aria-hidden="true" className="mx-auto size-8 text-muted" />
          <p className="mt-3 font-medium">{t("cases.emptyTitle")}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">{t("cases.emptyText")}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {cases.map(({ slug, entry }) => (
            <li key={slug}>
              <Link href={`/${locale}/clinical-cases/${slug}`} className="group flex h-full flex-col rounded-card border border-border bg-card p-5 hover:border-primary/40">
                <div className="flex flex-wrap items-center gap-2">
                  {entry && <StatusBadge status={entry.status} t={t} />}
                  {entry?.caseMeta && <Badge>{t(`cases.${entry.caseMeta.anonymisation}`)}</Badge>}
                </div>
                <h2 className="mt-3 text-lg font-semibold">{entry?.title ?? slug}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">
                  {entry ? t(`modules.${entry.module}.title` as MessageKey) : t("cases.otherLanguageOnly")}
                  {entry?.caseMeta && entry.caseMeta.questions.length > 0 && ` · ${t("cases.questionsCount", { count: entry.caseMeta.questions.length })}`}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t("cases.open")} <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
