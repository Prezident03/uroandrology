import "server-only";
import data from "@/.content/bundle.json";
import { locales, type Locale } from "@/lib/i18n/config";
import type { ExtraSearchItem } from "@/lib/search/index";
import type { Algorithm, CompiledEntry, CompiledReference, ContentBundle, ContentStatusValue, Interpretation, Questionnaire, RangeDataset } from "./schema";

/** Compiled by scripts/build-content.ts before every dev/build run. */
const bundle = data as unknown as ContentBundle;

export interface ContentLookup {
  entry?: CompiledEntry;
  /** Other languages in which this item is published. */
  otherLocales: Locale[];
}

function lookup(group: ContentBundle["sections"], key: string, locale: Locale): ContentLookup {
  const byLocale = group[key] ?? {};
  return {
    entry: byLocale[locale],
    otherLocales: locales.filter((l) => l !== locale && byLocale[l]),
  };
}

export const getSectionContent = (module: string, slug: string, locale: Locale) =>
  lookup(bundle.sections, `${module}/${slug}`, locale);

export const getTopicContent = (module: string, slug: string, locale: Locale) =>
  lookup(bundle.topics, `${module}/${slug}`, locale);

export function getReferences(keys: string[]): CompiledReference[] {
  return keys.map((k) => bundle.references[k]).filter((r): r is CompiledReference => Boolean(r));
}

export function getStatus(kind: "section" | "topic", module: string, slug: string, locale: Locale): ContentStatusValue | undefined {
  return bundle.statusIndex[`${kind}:${module}/${slug}`]?.[locale];
}

export function getRangeDataset(id: string): RangeDataset | undefined {
  return bundle.rangeDatasets[id];
}

export const isPreviewBuild = bundle.preview;

export const getQuestionnaire = (id: string): Questionnaire | undefined => bundle.questionnaires[id];
export const getInterpretation = (id: string): Interpretation | undefined => bundle.interpretations[id];
export const getAlgorithm = (id: string): Algorithm | undefined => bundle.algorithms[id];
export const listAlgorithms = (): Algorithm[] => Object.values(bundle.algorithms);
export const listRangeDatasets = (group?: RangeDataset["group"]): RangeDataset[] =>
  Object.values(bundle.rangeDatasets).filter((d) => !group || d.group === group);

export const getCaseContent = (slug: string, locale: Locale) => lookup(bundle.cases, slug, locale);
export const listCaseSlugs = (): string[] => Object.keys(bundle.cases);
export const listReferences = (): CompiledReference[] => Object.values(bundle.references);

/** Every place a reference is cited, for the guidelines library. */
export function getReferenceUsage(key: string, locale: Locale): { kind: "section" | "topic" | "case" | "dataset" | "algorithm" | "questionnaire" | "interpretation"; module?: string; slug: string }[] {
  const out: ReturnType<typeof getReferenceUsage> = [];
  const groups = [
    ["section", bundle.sections],
    ["topic", bundle.topics],
    ["case", bundle.cases],
  ] as const;
  for (const [kind, group] of groups)
    for (const byLocale of Object.values(group)) {
      const e = byLocale[locale] ?? Object.values(byLocale)[0];
      if (e?.references.includes(key)) out.push({ kind, module: e.module, slug: e.slug });
    }
  for (const d of Object.values(bundle.rangeDatasets)) if (d.source === key) out.push({ kind: "dataset", slug: d.id });
  for (const a of Object.values(bundle.algorithms))
    if (a.references.includes(key) || a.nodes.some((n) => n.references?.includes(key))) out.push({ kind: "algorithm", slug: a.id });
  for (const q of Object.values(bundle.questionnaires)) if (q.source === key) out.push({ kind: "questionnaire", slug: q.id });
  for (const i of Object.values(bundle.interpretations)) if (i.source === key) out.push({ kind: "interpretation", slug: i.id });
  return out;
}

/** Library items for the client-side search index (titles in the requested language). */
export function getSearchExtras(locale: Locale, labels: { algorithms: string; guidelines: string; cases: string }): ExtraSearchItem[] {
  const out: ExtraSearchItem[] = [
    { kind: "guideline", id: "library", title: labels.guidelines, path: "/guidelines" },
    { kind: "case", id: "library", title: labels.cases, path: "/clinical-cases" },
  ];
  for (const a of Object.values(bundle.algorithms))
    out.push({ kind: "algorithm", id: a.id, title: a.title[locale], context: labels.algorithms, path: `/algorithms/${a.id}` });
  for (const r of Object.values(bundle.references))
    out.push({
      kind: "guideline",
      id: r.key,
      title: r.title,
      context: [r.organization, r.year, r.edition].filter(Boolean).join(" · "),
      path: `/guidelines/${r.key}`,
      keywords: [r.chapter, r.key].filter(Boolean).join(" "),
    });
  for (const [slug, byLocale] of Object.entries(bundle.cases)) {
    const e = byLocale[locale];
    if (e?.title) out.push({ kind: "case", id: slug, title: e.title, context: labels.cases, path: `/clinical-cases/${slug}` });
  }
  return out;
}
