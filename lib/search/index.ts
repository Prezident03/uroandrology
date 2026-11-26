import { clinicalModules } from "@/lib/clinical/modules";
import { toolIds } from "@/lib/clinical/tools";
import type { Translator } from "@/lib/i18n/translate";
import { normalizeForSearch } from "@/lib/utils";
import { templateIds } from "@/lib/validation/anamnesis";

export const searchKinds = ["module", "section", "topic", "lab", "tool", "form", "algorithm", "guideline", "case"] as const;
export type SearchKind = (typeof searchKinds)[number];

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  context?: string;
  /** Path without the locale prefix, e.g. "/tools/bmi". Also the key for bookmarks and recents. */
  path: string;
  haystack: string;
}

/** Entries that come from the content library, computed on the server and passed to the client. */
export interface ExtraSearchItem {
  kind: "algorithm" | "guideline" | "case";
  id: string;
  title: string;
  context?: string;
  path: string;
  keywords?: string;
}

/** Topic groups whose entries are laboratory parameters. */
const labSections = new Set(["semen-analysis", "hormonal-diagnostics"]);

/** Full index in the current language: modules, sections, topics, lab parameters, tools, forms and library items. */
export function buildSearchIndex(t: Translator, extras: ExtraSearchItem[] = []): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const push = (e: Omit<SearchEntry, "haystack">, keywords = "") =>
    entries.push({ ...e, haystack: normalizeForSearch(`${e.title} ${e.context ?? ""} ${keywords}`) });

  for (const m of clinicalModules) {
    const moduleTitle = t(`modules.${m.id}.title`);
    const base = `/modules/${m.id}`;
    push({ id: m.id, kind: "module", title: moduleTitle, path: base }, t(`modules.${m.id}.description`));
    for (const s of m.sections) push({ id: `${m.id}/${s}`, kind: "section", title: t(`sections.${s}`), context: moduleTitle, path: `${base}/${s}` });
    for (const g of m.topics ?? [])
      for (const id of g.ids)
        push({
          id: `${m.id}/topics/${id}`,
          kind: labSections.has(g.section) ? "lab" : "topic",
          title: t(`topics.${id}`),
          context: `${moduleTitle} · ${t(`sections.${g.section}`)}`,
          path: `${base}/topics/${id}`,
        });
  }
  for (const id of toolIds)
    push({ id: `tool/${id}`, kind: "tool", title: t(`tools.${id}.title`), context: t("tools.title"), path: `/tools/${id}` }, t(`tools.${id}.description`));
  for (const id of templateIds)
    push({ id: `form/${id}`, kind: "form", title: t(`assessment.templates.${id}`), context: t("assessment.title"), path: `/assessment/${id}` });
  for (const x of extras)
    push({ id: `${x.kind}/${x.id}`, kind: x.kind, title: x.title, context: x.context, path: x.path }, x.keywords);
  return entries;
}

const kindRank: Record<SearchKind, number> = {
  module: 0, tool: 1, lab: 1, topic: 2, section: 2, algorithm: 2, form: 3, guideline: 3, case: 3,
};

export function searchEntries(index: SearchEntry[], query: string, limit = 30): SearchEntry[] {
  const terms = normalizeForSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const q = terms.join(" ");
  const rank = (e: SearchEntry) => {
    const title = normalizeForSearch(e.title);
    return (title.startsWith(q) ? 0 : title.includes(q) ? 4 : 8) + kindRank[e.kind];
  };
  return index
    .filter((e) => terms.every((term) => e.haystack.includes(term)))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}

/** Looks up a page by its locale-free path (for bookmarks and recents). */
export function findByPath(index: SearchEntry[], path: string): SearchEntry | undefined {
  return index.find((e) => e.path === path);
}

/** Paths that make sense to show before the user has typed anything. */
export const suggestedPaths = ["/tools/semen-analysis", "/tools/hormonal-assessment", "/tools/bmi", "/algorithms/male-infertility", "/guidelines"];
