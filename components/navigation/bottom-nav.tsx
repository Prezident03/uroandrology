"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Menu, Search, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isActivePath } from "./nav-items";

export function BottomNav({ onSearch, onMenu }: { onSearch: () => void; onMenu: () => void }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] [&_svg]:size-5";
  const links = [
    { path: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { path: "/modules", label: t("nav.modulesShort"), icon: Layers },
    { path: "/settings", label: t("nav.settings"), icon: Settings },
  ];
  return (
    <nav
      aria-label={t("nav.main")}
      className="no-print fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background-subtle pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {links.slice(0, 2).map(({ path, label, icon: Icon }) => {
        const active = isActivePath(pathname, locale, path);
        return (
          <Link key={path} href={`/${locale}${path}`} aria-current={active ? "page" : undefined}
            className={cn(item, active ? "text-primary" : "text-muted")}>
            <Icon aria-hidden="true" />
            <span className="max-w-full truncate px-1">{label}</span>
          </Link>
        );
      })}
      <button type="button" onClick={onSearch} className={cn(item, "text-muted")}>
        <Search aria-hidden="true" />
        <span>{t("nav.search")}</span>
      </button>
      {links.slice(2).map(({ path, label, icon: Icon }) => {
        const active = isActivePath(pathname, locale, path);
        return (
          <Link key={path} href={`/${locale}${path}`} aria-current={active ? "page" : undefined}
            className={cn(item, active ? "text-primary" : "text-muted")}>
            <Icon aria-hidden="true" />
            <span className="max-w-full truncate px-1">{label}</span>
          </Link>
        );
      })}
      <button type="button" onClick={onMenu} className={cn(item, "text-muted")} aria-label={t("nav.openMenu")}>
        <Menu aria-hidden="true" />
        <span aria-hidden="true">{t("nav.more")}</span>
      </button>
    </nav>
  );
}
