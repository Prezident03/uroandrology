import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { toolIcons, toolIds } from "@/lib/clinical/tools";
import { toolDataStatus } from "@/lib/clinical/tool-status";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("tools.title") };
}

export default async function ToolsPage() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title={t("tools.title")} description={t("tools.intro")} />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {toolIds.map((id) => {
          const Icon = toolIcons[id];
          const status = toolDataStatus(id);
          return (
            <li key={id}>
              <Link href={`/${locale}/tools/${id}`} className="group flex h-full flex-col rounded-card border border-border bg-card p-5 transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  {status === undefined ? (
                    <Badge tone="warning">{t("tools.pendingData")}</Badge>
                  ) : status === "approved" || status === "none-needed" ? (
                    <Badge tone="success">{t("tools.ready")}</Badge>
                  ) : (
                    <Badge tone="warning">{t("tools.readyReview")}</Badge>
                  )}
                </div>
                <h2 className="mt-4 text-lg font-semibold">{t(`tools.${id}.title`)}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{t(`tools.${id}.description`)}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t("tools.open")} <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
