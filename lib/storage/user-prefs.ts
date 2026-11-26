"use client";

import { useCallback } from "react";
import { isToolId, type ToolId } from "@/lib/clinical/tools";
import { useLocalStore } from "./local-store";

/**
 * Non-clinical UI preferences only. Entries are locale-free site paths such as
 * "/tools/bmi"; nothing typed into a form or calculator is ever stored here.
 */
export interface RecentEntry {
  path: string;
  openedAt: number;
}

const MAX_RECENT = 8;
const MAX_BOOKMARKS = 50;
const EMPTY_RECENT: RecentEntry[] = [];
const EMPTY_PATHS: string[] = [];
const EMPTY_USAGE: Partial<Record<ToolId, number>> = {};

/** Site paths only: lowercase letters, digits, dashes and slashes. */
export const isSitePath = (v: unknown): v is string =>
  typeof v === "string" && v.length < 200 && /^\/[a-z0-9\-/]*$/.test(v);

const isRecentList = (v: unknown): v is RecentEntry[] =>
  Array.isArray(v) &&
  v.every((e) => typeof e === "object" && e !== null && isSitePath((e as RecentEntry).path) && typeof (e as RecentEntry).openedAt === "number");

const isPathList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isSitePath);

const isUsage = (v: unknown): v is Partial<Record<ToolId, number>> =>
  typeof v === "object" && v !== null && !Array.isArray(v) &&
  Object.entries(v).every(([k, n]) => isToolId(k) && typeof n === "number" && n >= 0);

const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

export function useRecents() {
  const [recents, setRecents] = useLocalStore("recent-v2", EMPTY_RECENT, isRecentList);
  const add = useCallback(
    (path: string) =>
      setRecents((prev) => [{ path, openedAt: Date.now() }, ...prev.filter((r) => r.path !== path)].slice(0, MAX_RECENT)),
    [setRecents],
  );
  const clear = useCallback(() => setRecents([]), [setRecents]);
  return { recents, add, clear };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStore("bookmarks-v2", EMPTY_PATHS, isPathList);
  const toggle = useCallback(
    (path: string) =>
      setBookmarks((prev) => (prev.includes(path) ? prev.filter((b) => b !== path) : [path, ...prev].slice(0, MAX_BOOKMARKS))),
    [setBookmarks],
  );
  const clear = useCallback(() => setBookmarks([]), [setBookmarks]);
  return { bookmarks, toggle, clear, isBookmarked: (path: string) => bookmarks.includes(path) };
}

/** How often each tool was opened in this browser, for "Frequently used tools". */
export function useToolUsage() {
  const [usage, setUsage] = useLocalStore("tool-usage", EMPTY_USAGE, isUsage);
  const record = useCallback(
    (id: ToolId) => setUsage((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 })),
    [setUsage],
  );
  const clear = useCallback(() => setUsage({}), [setUsage]);
  return { usage, record, clear };
}

export function useSidebarCollapsed() {
  return useLocalStore("sidebar-collapsed", false, isBoolean);
}
