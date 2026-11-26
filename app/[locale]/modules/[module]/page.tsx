import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BookmarkButton } from "@/components/clinical/bookmark-button";
import { ModuleIcon } from "@/components/clinical/module-icon";
import { RecordRecent } from "@/components/clinical/record-recent";
import { StatusBadge } from "@/components/clinical/status-badge";
import { PageHeader } from "@/components/common/page-header";
import { clinicalModules, getModule, integratedModuleIds } from "@/lib/clinical/modules";
import { getSectionContent, getTopicContent } from "@/lib/content";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export function generateStaticParams() {
  return clinicalModules.map((m) => ({ module: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/modules/[module]">): Promise<Metadata> {
  const { module: id } = await params;
  const m = getModule(id);
  if (!m) return {};
  const t = await getTranslator();
  return { title: t(`modules.${m.id}.title`), description: t(`modules.${m.id}.description`) };
}

const row =
  "flex min-h-14 items-center gap-3 rounded-card border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40";

export default async function ModulePage({ params }: PageProps<"/[locale]/modules/[module]">) {
  const { module: id } = await params;
  const m = getModule(id);
  if (!m) notFound();
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const base = `/${locale}/modules/${m.id}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <RecordRecent moduleId={m.id} />
      <PageHeader
        eyebrow={
          <span className="mb-3 inline-grid size-11 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <ModuleIcon name={m.icon} className="size-5" />
          </span>
        }
        title={t(`modules.${m.id}.title`)}
        description={t(`modules.${m.id}.description`)}
        actions={<BookmarkButton moduleId={m.id} />}
      />

      {m.id === "clinical-assessment" && (
        <section aria-labelledby="related-heading" className="rounded-card border border-border bg-background-subtle p-5">
          <h2 id="related-heading" className="font-semibold">{t("content.relatedModulesTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("content.relatedModulesText")}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {integratedModuleIds.map((rid) => {
              const rm = getModule(rid)!;
              return (
                <li key={rid}>
                  <Link href={`/${locale}/modules/${rid}`} className="flex min-h-12 items-center gap-3 rounded-card border border-border bg-card px-4 text-sm font-medium hover:border-primary/40">
                    <ModuleIcon name={rm.icon} className="size-4 shrink-0 text-primary" />
                    {t(`modules.${rid}.title`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="sections-heading">
        <h2 id="sections-heading" className="mb-3 text-lg font-semibold">{t("modules.sectionsTitle")}</h2>
        <ol className="space-y-2">
          {m.sections.map((s, i) => {
            const topics = m.topics?.find((g) => g.section === s)?.ids ?? [];
            return (
              <li key={s} id={s} className="scroll-mt-24">
                <Link href={`${base}/${s}`} className={row}>
                  <span className="w-6 shrink-0 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 font-medium">{t(`sections.${s}`)}</span>
                  <StatusBadge status={getSectionContent(m.id, s, locale).entry?.status} t={t} className="hidden sm:inline-flex" />
                  <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
                </Link>
                {topics.length > 0 && (
                  <ul aria-label={t("content.topicsTitle")} className="ml-6 mt-2 space-y-2 border-l border-border pl-4">
                    {topics.map((topic) => (
                      <li key={topic}>
                        <Link href={`${base}/topics/${topic}`} className={`${row} min-h-12 py-2 text-sm`}>
                          <span className="min-w-0 flex-1">{t(`topics.${topic}`)}</span>
                          <StatusBadge status={getTopicContent(m.id, topic, locale).entry?.status} t={t} className="hidden sm:inline-flex" />
                          <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
