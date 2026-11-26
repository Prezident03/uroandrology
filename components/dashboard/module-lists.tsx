"use client";

import Link from "next/link";
import { Bookmark, Clock, Gauge } from "lucide-react";
import type { ReactNode } from "react";
import { KindIcon } from "@/components/navigation/kind-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toolIds } from "@/lib/clinical/tools";
import { useI18n } from "@/lib/i18n/client";
import { useSearchIndex } from "@/lib/search/context";
import { findByPath, type SearchEntry } from "@/lib/search/index";
import { useBookmarks, useRecents, useToolUsage } from "@/lib/storage/user-prefs";

function PageLinkList({ paths, empty, max = 6 }: { paths: string[]; empty: string; max?: number }) {
  const { locale } = useI18n();
  const index = useSearchIndex();
  // Paths that no longer exist (e.g. a removed page) are skipped silently.
  const entries = paths.map((p) => findByPath(index, p)).filter((e): e is SearchEntry => Boolean(e)).slice(0, max);
  if (entries.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="-mx-2 space-y-1">
      {entries.map((e) => (
        <li key={e.path}>
          <Link href={`/${locale}${e.path}`}
            className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm transition-colors hover:bg-card-hover">
            <KindIcon kind={e.kind} className="size-4 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block truncate">{e.title}</span>
              {e.context && <span className="block truncate text-xs text-muted">{e.context}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ListCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="justify-start">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function RecentPages() {
  const { t } = useI18n();
  const { recents } = useRecents();
  return (
    <ListCard icon={<Clock aria-hidden="true" className="size-4 text-muted" />} title={t("dashboard.recentTitle")}>
      <PageLinkList paths={recents.map((r) => r.path)} empty={t("dashboard.recentEmpty")} />
    </ListCard>
  );
}

export function BookmarkedPages() {
  const { t } = useI18n();
  const { bookmarks } = useBookmarks();
  return (
    <ListCard icon={<Bookmark aria-hidden="true" className="size-4 text-muted" />} title={t("dashboard.bookmarksTitle")}>
      <PageLinkList paths={bookmarks} empty={t("dashboard.bookmarksEmpty")} max={8} />
    </ListCard>
  );
}

export function FrequentTools() {
  const { t } = useI18n();
  const { usage } = useToolUsage();
  const top = toolIds
    .filter((id) => (usage[id] ?? 0) > 0)
    .sort((a, b) => (usage[b] ?? 0) - (usage[a] ?? 0))
    .slice(0, 4);
  return (
    <ListCard icon={<Gauge aria-hidden="true" className="size-4 text-muted" />} title={t("dashboard.frequentToolsTitle")}>
      <PageLinkList paths={top.map((id) => `/tools/${id}`)} empty={t("dashboard.frequentToolsEmpty")} />
    </ListCard>
  );
}
