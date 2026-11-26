import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookmarkButton } from "@/components/clinical/bookmark-button";
import { ModuleIcon } from "@/components/clinical/module-icon";
import type { Translator } from "@/lib/i18n/translate";
import type { ClinicalModuleDefinition } from "@/types/clinical/module";

export function ModuleCard({ module, locale, t }: { module: ClinicalModuleDefinition; locale: string; t: Translator }) {
  const letter = String.fromCharCode(64 + module.order);
  return (
    <article className="group relative flex flex-col rounded-card border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <ModuleIcon name={module.icon} className="size-5" />
        </span>
        <div className="relative z-10 -mr-2 -mt-2">
          <BookmarkButton path={`/modules/${module.id}`} compact />
        </div>
      </div>
      <p className="mt-4 font-mono text-xs text-muted">
        {letter} · {t("dashboard.sectionsCount", { count: module.sections.length })}
      </p>
      <h3 className="mt-1 text-lg font-semibold leading-snug">
        <Link href={`/${locale}/modules/${module.id}`} className="after:absolute after:inset-0 after:rounded-card">
          {t(`modules.${module.id}.title`)}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted">{t(`modules.${module.id}.description`)}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {t("dashboard.openModule")}
        <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}
