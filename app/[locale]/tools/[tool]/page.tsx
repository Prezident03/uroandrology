import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlgorithmView } from "@/components/algorithms/algorithm-view";
import { BmiTool } from "@/components/calculators/bmi-tool";
import { HormoneTool } from "@/components/calculators/hormone-tool";
import { QuestionnaireTool } from "@/components/calculators/questionnaire-tool";
import { RangeLibrary } from "@/components/calculators/range-library";
import { SemenTool } from "@/components/calculators/semen-tool";
import { ToolShell } from "@/components/calculators/tool-shell";
import { PendingReviewNotice } from "@/components/clinical/content-status";
import { StatusBadge } from "@/components/clinical/status-badge";
import { isToolId, toolIds } from "@/lib/clinical/tools";
import { getAlgorithm, getInterpretation, getQuestionnaire, getReferences, listRangeDatasets } from "@/lib/content";
import { getLocale, getTranslator } from "@/lib/i18n/server";

type Props = PageProps<"/[locale]/tools/[tool]">;

export function generateStaticParams() {
  return toolIds.map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  if (!isToolId(tool)) return {};
  const t = await getTranslator();
  return { title: t(`tools.${tool}.title`), description: t(`tools.${tool}.description`) };
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;
  if (!isToolId(tool)) notFound();
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const shell = { t, locale, title: t(`tools.${tool}.title`), description: t(`tools.${tool}.description`) };

  switch (tool) {
    case "iief-5":
    case "pedt": {
      const q = getQuestionnaire(tool);
      return (
        <ToolShell
          {...shell}
          status={q && <StatusBadge status={q.status} t={t} />}
          how={t("tools.questionnaireHow")}
          limitations={q?.limitations?.[locale] ?? t("tools.limitationsGeneric")}
          refs={q ? getReferences([q.source]) : undefined}
        >
          {q ? <QuestionnaireTool questionnaire={q} /> : <PendingReviewNotice title={t("tools.pendingData")}>{t("tools.questionnaireMissing")}</PendingReviewNotice>}
        </ToolShell>
      );
    }
    case "bmi": {
      const it = getInterpretation("bmi");
      return (
        <ToolShell {...shell} how={t("tools.bmiHow")} limitations={t("tools.limitationsGeneric")} refs={it ? getReferences([it.source]) : undefined}>
          <BmiTool interpretation={it} />
        </ToolShell>
      );
    }
    case "semen-analysis": {
      const datasets = listRangeDatasets("semen");
      return (
        <ToolShell {...shell} how={t("tools.semenHow")} limitations={t("tools.semenLimitations")} refs={getReferences([...new Set(datasets.map((d) => d.source))])}>
          <SemenTool datasets={datasets} />
        </ToolShell>
      );
    }
    case "hormonal-assessment":
      return (
        <ToolShell
          {...shell}
          how={t("tools.hormoneHow")}
          limitations={t("tools.hormoneLimitations")}
          aside={
            <p className="text-sm text-muted">
              {t("tools.relatedTopics")}:{" "}
              {(["morning-sampling", "repeat-confirmation", "primary-vs-secondary"] as const).map((id, i) => (
                <span key={id}>
                  {i > 0 && ", "}
                  <Link href={`/${locale}/modules/hypogonadism/topics/${id}`} className="text-primary hover:underline">{t(`topics.${id}`)}</Link>
                </span>
              ))}
            </p>
          }
        >
          <p className="text-sm text-muted">{t("tools.hormoneIntro")}</p>
          <HormoneTool />
        </ToolShell>
      );
    case "testosterone-pathway": {
      const a = getAlgorithm("hypogonadism");
      return (
        <ToolShell {...shell} refs={a ? getReferences(a.references) : undefined}>
          <p className="text-sm text-muted">{t("tools.pathwayIntro")}</p>
          {a ? <AlgorithmView algorithm={a} locale={locale} t={t} /> : <PendingReviewNotice title={t("tools.pendingData")} />}
        </ToolShell>
      );
    }
    case "reference-ranges":
      return (
        <ToolShell {...shell}>
          <p className="text-sm text-muted">{t("tools.libraryIntro")}</p>
          <RangeLibrary datasets={listRangeDatasets()} locale={locale} t={t} />
        </ToolShell>
      );
  }
}
