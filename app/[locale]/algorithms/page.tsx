import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { StatusBadge } from "@/components/clinical/status-badge";
import { PageHeader } from "@/components/common/page-header";
import { listAlgorithms } from "@/lib/content";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("algorithms.title") };
}

export default async function AlgorithmsPage() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const algorithms = listAlgorithms();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={t("algorithms.title")} description={t("algorithms.intro")} />
      <ul className="grid gap-4 sm:grid-cols-2">
        {algorithms.map((a) => (
          <li key={a.id}>
            <Link href={`/${locale}/algorithms/${a.id}`} className="group flex h-full flex-col rounded-card border border-border bg-card p-5 hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <GitBranch aria-hidden="true" className="size-5" />
                </span>
                <StatusBadge status={a.status} t={t} />
              </div>
              <h2 className="mt-4 text-lg font-semibold">{a.title[locale]}</h2>
              <p className="mt-1 flex-1 font-mono text-xs text-muted">{t("algorithms.stepsCount", { count: a.nodes.length })}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                {t("algorithms.open")} <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
