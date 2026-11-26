"use client";

import Link from "next/link";
import { Bookmark, Clock } from "lucide-react";
import { ModuleIcon } from "@/components/clinical/module-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getModule } from "@/lib/clinical/modules";
import { useI18n } from "@/lib/i18n/client";
import { useBookmarks, useRecents } from "@/lib/storage/user-prefs";
import type { ModuleId } from "@/types/clinical/module";

function ModuleLinkList({ ids, empty }: { ids: ModuleId[]; empty: string }) {
  const { locale, t } = useI18n();
  if (ids.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="-mx-2 space-y-1">
      {ids.map((id) => {
        const m = getModule(id);
        if (!m) return null;
        return (
          <li key={id}>
            <Link href={`/${locale}/modules/${id}`}
              className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm transition-colors hover:bg-card-hover">
              <ModuleIcon name={m.icon} className="size-4 shrink-0 text-primary" />
              <span className="truncate">{t(`modules.${id}.title`)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function RecentModules() {
  const { t } = useI18n();
  const { recents } = useRecents();
  return (
    <Card>
      <CardHeader className="justify-start">
        <Clock aria-hidden="true" className="size-4 text-muted" />
        <CardTitle>{t("dashboard.recentTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ModuleLinkList ids={recents.map((r) => r.moduleId)} empty={t("dashboard.recentEmpty")} />
      </CardContent>
    </Card>
  );
}

export function BookmarkedModules() {
  const { t } = useI18n();
  const { bookmarks } = useBookmarks();
  return (
    <Card>
      <CardHeader className="justify-start">
        <Bookmark aria-hidden="true" className="size-4 text-muted" />
        <CardTitle>{t("dashboard.bookmarksTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ModuleLinkList ids={bookmarks} empty={t("dashboard.bookmarksEmpty")} />
      </CardContent>
    </Card>
  );
}
