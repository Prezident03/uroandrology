"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import { useBookmarks } from "@/lib/storage/user-prefs";
import { cn } from "@/lib/utils";

/** Bookmarks any page by its locale-free path, e.g. "/tools/bmi". */
export function BookmarkButton({ path, compact = false }: { path: string; compact?: boolean }) {
  const { t } = useI18n();
  const { isBookmarked, toggle } = useBookmarks();
  const on = isBookmarked(path);
  const label = on ? t("modules.removeBookmark") : t("modules.bookmark");
  return (
    <Button
      variant={compact ? "ghost" : "secondary"}
      size={compact ? "icon" : "sm"}
      onClick={() => toggle(path)}
      aria-pressed={on}
      aria-label={compact ? label : undefined}
      title={label}
      className={cn("no-print", on && "text-primary", compact && "size-10")}
    >
      {on ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
      {!compact && <span>{on ? t("modules.bookmarked") : t("modules.bookmark")}</span>}
    </Button>
  );
}
