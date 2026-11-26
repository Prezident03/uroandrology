import { clinicalModules } from "@/lib/clinical/modules";
import type { Translator } from "@/lib/i18n/translate";
import { normalizeForSearch } from "@/lib/utils";
import type { ModuleIcon } from "@/types/clinical/module";

export interface SearchEntry {
  id: string;
  kind: "module" | "section";
  title: string;
  context?: string;
  href: string;
  icon: ModuleIcon;
  haystack: string;
}

/** Phase 1 index: modules and their sections in the current language. */
export function buildSearchIndex(locale: string, t: Translator): SearchEntry[] {
  return clinicalModules.flatMap((m) => {
    const moduleTitle = t(`modules.${m.id}.title`);
    const moduleHref = `/${locale}/modules/${m.id}`;
    const entry: SearchEntry = {
      id: m.id,
      kind: "module",
      title: moduleTitle,
      href: moduleHref,
      icon: m.icon,
      haystack: normalizeForSearch(`${moduleTitle} ${t(`modules.${m.id}.description`)}`),
    };
    const sections = m.sections.map<SearchEntry>((s) => {
      const title = t(`sections.${s}`);
      return {
        id: `${m.id}/${s}`,
        kind: "section",
        title,
        context: moduleTitle,
        href: `${moduleHref}/${s}`,
        icon: m.icon,
        haystack: normalizeForSearch(`${title} ${moduleTitle}`),
      };
    });
    const topics = (m.topics ?? []).flatMap((g) =>
      g.ids.map<SearchEntry>((id) => {
        const title = t(`topics.${id}`);
        return {
          id: `${m.id}/topics/${id}`,
          kind: "section",
          title,
          context: `${moduleTitle} · ${t(`sections.${g.section}`)}`,
          href: `${moduleHref}/topics/${id}`,
          icon: m.icon,
          haystack: normalizeForSearch(`${title} ${moduleTitle}`),
        };
      }),
    );
    return [entry, ...sections, ...topics];
  });
}

export function searchEntries(index: SearchEntry[], query: string, limit = 20): SearchEntry[] {
  const terms = normalizeForSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const q = terms.join(" ");
  const rank = (e: SearchEntry) =>
    (normalizeForSearch(e.title).startsWith(q) ? 0 : 2) + (e.kind === "module" ? 0 : 1);
  return index
    .filter((e) => terms.every((term) => e.haystack.includes(term)))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}
