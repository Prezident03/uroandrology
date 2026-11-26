import "server-only";
import data from "@/.content/bundle.json";
import { locales, type Locale } from "@/lib/i18n/config";
import type { CompiledEntry, CompiledReference, ContentBundle, ContentStatusValue, RangeDataset } from "./schema";

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
