import "server-only";
import type { Locale } from "@/lib/i18n/config";
import type { MessageKey, Translator } from "@/lib/i18n/translate";
import { toolIds } from "@/lib/clinical/tools";
import { getAlgorithm, getCaseContent, getRangeDataset, getReferenceUsage } from "./index";

export interface UsageLink {
  label: string;
  context: string;
  href: string;
}

/** Turns every place a reference is cited into a readable, linked entry. */
export function referenceUsageLinks(key: string, locale: Locale, t: Translator): UsageLink[] {
  const seen = new Set<string>();
  const out: UsageLink[] = [];
  const add = (l: UsageLink) => {
    if (seen.has(l.href)) return;
    seen.add(l.href);
    out.push(l);
  };
  for (const u of getReferenceUsage(key, locale)) {
    const moduleTitle = u.module ? t(`modules.${u.module}.title` as MessageKey) : "";
    switch (u.kind) {
      case "section":
        add({ label: t(`sections.${u.slug}` as MessageKey), context: moduleTitle, href: `/${locale}/modules/${u.module}/${u.slug}` });
        break;
      case "topic":
        add({ label: t(`topics.${u.slug}` as MessageKey), context: moduleTitle, href: `/${locale}/modules/${u.module}/topics/${u.slug}` });
        break;
      case "case": {
        const e = getCaseContent(u.slug, locale).entry;
        add({ label: e?.title ?? u.slug, context: t("nav.cases"), href: `/${locale}/clinical-cases/${u.slug}` });
        break;
      }
      case "dataset": {
        const d = getRangeDataset(u.slug);
        const tool = d?.group === "semen" ? "semen-analysis" : "reference-ranges";
        add({ label: d?.title[locale] ?? u.slug, context: t(`tools.${tool}.title`), href: `/${locale}/tools/${tool}` });
        break;
      }
      case "algorithm": {
        const a = getAlgorithm(u.slug);
        add({ label: a?.title[locale] ?? u.slug, context: t("algorithms.title"), href: `/${locale}/algorithms/${u.slug}` });
        break;
      }
      case "questionnaire":
      case "interpretation": {
        const tool = toolIds.find((id) => id === u.slug);
        if (tool) add({ label: t(`tools.${tool}.title`), context: t("tools.title"), href: `/${locale}/tools/${tool}` });
        break;
      }
    }
  }
  return out;
}
