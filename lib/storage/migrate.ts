"use client";

import { isModuleId } from "@/lib/clinical/modules";
import { isSitePath } from "./user-prefs";
import { writeStore } from "./local-store";

/** One-time move of phase-1 module bookmarks ("ua:bookmarks") to path bookmarks; old recents are dropped. */
export function migrateLegacyPrefs() {
  try {
    const ls = window.localStorage;
    const raw = ls.getItem("ua:bookmarks");
    if (raw !== null) {
      const old: unknown = JSON.parse(raw);
      const current: unknown = JSON.parse(ls.getItem("ua:bookmarks-v2") ?? "[]");
      if (Array.isArray(old) && Array.isArray(current)) {
        const paths = old.filter((id): id is string => typeof id === "string" && isModuleId(id)).map((id) => `/modules/${id}`);
        const merged = [...current.filter(isSitePath), ...paths.filter((p) => !current.includes(p))];
        writeStore("bookmarks-v2", merged);
      }
      ls.removeItem("ua:bookmarks");
    }
    ls.removeItem("ua:recent");
  } catch {
    /* storage disabled or corrupt: nothing to migrate */
  }
}
