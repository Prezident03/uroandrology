"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/client";
import { buildSearchIndex, type ExtraSearchItem, type SearchEntry } from "./index";

const SearchIndexContext = createContext<SearchEntry[]>([]);

/** Builds the site index once per language and shares it with search, bookmarks and recents. */
export function SearchIndexProvider({ extras, children }: { extras: ExtraSearchItem[]; children: ReactNode }) {
  const { t } = useI18n();
  const index = useMemo(() => buildSearchIndex(t, extras), [t, extras]);
  return <SearchIndexContext.Provider value={index}>{children}</SearchIndexContext.Provider>;
}

export const useSearchIndex = () => useContext(SearchIndexContext);
