import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { BookmarkButton } from "@/components/clinical/bookmark-button";
import { PendingReviewNotice } from "@/components/clinical/content-status";
import { ModuleIcon } from "@/components/clinical/module-icon";
import { RecordRecent } from "@/components/clinical/record-recent";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { clinicalModules, getModule } from "@/lib/clinical/modules";
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

export default async function ModulePage({ params }: PageProps<"/[locale]/modules/[module]">) {
  const { module: id } = await params;
  const m = getModule(id);
  if (!m) notFound();
  const locale = await getLocale();
  const t = await getTranslator(locale);

  return (
    <div className="mx-auto flex max-w-7xl gap-8">
      <RecordRecent moduleId={m.id} />
      <article className="min-w-0 flex-1 space-y-6">
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

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge tone="warning">{t("status.moduleStatus")}</Badge>
          <span>
            {t("status.version")}: {t("status.notPublished")}
          </span>
        </div>

        <section aria-labelledby="sections-heading" className="max-w-reading">
          <h2 id="sections-heading" className="sr-only">{t("modules.sectionsTitle")}</h2>
          <ol className="space-y-3">
            {m.sections.map((s, i) => (
              <li key={s} id={s} className="scroll-mt-24">
                <details className="group rounded-card border border-border bg-card open:border-primary/30">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="w-6 shrink-0 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 font-medium">{t(`sections.${s}`)}</span>
                    <Badge tone="warning" className="hidden sm:inline-flex">{t("status.pendingReview")}</Badge>
                    <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4">
                    <PendingReviewNotice title={t("status.pendingReview")}>{t("status.pendingReviewText")}</PendingReviewNotice>
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </section>
      </article>

      <aside className="sticky top-24 hidden h-fit w-72 shrink-0 xl:block" aria-labelledby="outline-heading">
        <h2 id="outline-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          {t("modules.sectionsTitle")}
        </h2>
        <ol className="space-y-0.5 border-l border-border">
          {m.sections.map((s) => (
            <li key={s}>
              <a href={`#${s}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted hover:border-primary hover:text-foreground">
                {t(`sections.${s}`)}
              </a>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
