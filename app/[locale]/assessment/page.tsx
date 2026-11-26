import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ModuleIcon } from "@/components/clinical/module-icon";
import { PageHeader } from "@/components/common/page-header";
import { getModule } from "@/lib/clinical/modules";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { templateIds } from "@/lib/validation/anamnesis";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("assessment.title") };
}

export default async function AssessmentPage() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={t("assessment.title")} description={t("assessment.intro")} />
      <ul className="grid gap-4 sm:grid-cols-2">
        {templateIds.map((id) => (
          <li key={id}>
            <Link href={`/${locale}/assessment/${id}`} className="group flex h-full items-center gap-4 rounded-card border border-border bg-card p-5 hover:border-primary/40">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                <ModuleIcon name={getModule(id)!.icon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{t(`assessment.templates.${id}`)}</span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-sm text-primary">
                  {t("assessment.start")} <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
