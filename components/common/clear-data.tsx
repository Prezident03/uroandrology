"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import { useBookmarks, useRecents, useToolUsage } from "@/lib/storage/user-prefs";

export function ClearLocalData() {
  const { t } = useI18n();
  const recents = useRecents();
  const bookmarks = useBookmarks();
  const usage = useToolUsage();
  const [done, setDone] = useState<"recent" | "bookmarks" | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="danger" size="sm" disabled={recents.recents.length === 0 && Object.keys(usage.usage).length === 0}
        onClick={() => { recents.clear(); usage.clear(); setDone("recent"); }}>
        <Trash2 aria-hidden="true" />
        {t("settings.clearRecent")}
      </Button>
      <Button variant="danger" size="sm" disabled={bookmarks.bookmarks.length === 0}
        onClick={() => { bookmarks.clear(); setDone("bookmarks"); }}>
        <Trash2 aria-hidden="true" />
        {t("settings.clearBookmarks")}
      </Button>
      <span role="status" className="text-sm text-success">{done ? t("settings.cleared") : ""}</span>
    </div>
  );
}
