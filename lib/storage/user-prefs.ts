"use client";

import { useCallback } from "react";
import { isModuleId } from "@/lib/clinical/modules";
import type { ModuleId } from "@/types/clinical/module";
import { useLocalStore } from "./local-store";

export interface RecentEntry {
  moduleId: ModuleId;
  openedAt: number;
}

const MAX_RECENT = 6;
const EMPTY_RECENT: RecentEntry[] = [];
const EMPTY_BOOKMARKS: ModuleId[] = [];

const isRecentList = (v: unknown): v is RecentEntry[] =>
  Array.isArray(v) &&
  v.every(
    (e) =>
      typeof e === "object" && e !== null &&
      isModuleId((e as RecentEntry).moduleId) &&
      typeof (e as RecentEntry).openedAt === "number",
  );

const isModuleList = (v: unknown): v is ModuleId[] =>
  Array.isArray(v) && v.every((e) => typeof e === "string" && isModuleId(e));

const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

export function useRecents() {
  const [recents, setRecents] = useLocalStore("recent", EMPTY_RECENT, isRecentList);
  const add = useCallback(
    (moduleId: ModuleId) =>
      setRecents((prev) =>
        [{ moduleId, openedAt: Date.now() }, ...prev.filter((r) => r.moduleId !== moduleId)].slice(0, MAX_RECENT),
      ),
    [setRecents],
  );
  const clear = useCallback(() => setRecents([]), [setRecents]);
  return { recents, add, clear };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStore("bookmarks", EMPTY_BOOKMARKS, isModuleList);
  const toggle = useCallback(
    (id: ModuleId) =>
      setBookmarks((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id])),
    [setBookmarks],
  );
  const clear = useCallback(() => setBookmarks([]), [setBookmarks]);
  return { bookmarks, toggle, clear, isBookmarked: (id: ModuleId) => bookmarks.includes(id) };
}

export function useSidebarCollapsed() {
  return useLocalStore("sidebar-collapsed", false, isBoolean);
}
