"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isActivePath, primaryNav, secondaryNav, type NavItem } from "./nav-items";

function NavRow({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const label = t(item.labelKey);
  const Icon = item.icon;
  const base =
    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors [&_svg]:size-5 [&_svg]:shrink-0";

  if (!item.path) {
    const note = t("nav.plannedFor", { phase: item.plannedPhase ?? "" });
    return (
      <li>
        <span
          className={cn(base, "cursor-default text-muted/60")}
          aria-disabled="true"
          title={collapsed ? `${label} · ${note}` : note}
        >
          <Icon aria-hidden="true" />
          {collapsed ? (
            <span className="sr-only">{`${label} (${t("nav.soon")})`}</span>
          ) : (
            <>
              <span className="truncate">{label}</span>
              <span className="ml-auto rounded border border-border px-1.5 text-[11px] leading-5">{t("nav.soon")}</span>
            </>
          )}
        </span>
      </li>
    );
  }

  const active = isActivePath(pathname, locale, item.path);
  return (
    <li>
      <Link
        href={`/${locale}${item.path}`}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        title={collapsed ? label : undefined}
        className={cn(
          base,
          active ? "bg-primary/10 text-primary" : "text-muted hover:bg-card hover:text-foreground",
        )}
      >
        <Icon aria-hidden="true" />
        <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
      </Link>
    </li>
  );
}

export function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("nav.main")} className="flex flex-1 flex-col justify-between gap-4 p-3">
      <ul className="space-y-1">
        {primaryNav.map((item) => (
          <NavRow key={item.labelKey} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </ul>
      <ul className="space-y-1 border-t border-border pt-3">
        {secondaryNav.map((item) => (
          <NavRow key={item.labelKey} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  );
}

export function Brand({ collapsed, nameFromSm = false }: { collapsed: boolean; nameFromSm?: boolean }) {
  const { locale, t } = useI18n();
  return (
    <Link href={`/${locale}/dashboard`} className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/10 text-sm font-bold text-primary"
      >
        UA
      </span>
      <span className={cn("min-w-0 leading-tight", collapsed && "sr-only", nameFromSm && "max-sm:sr-only")}>
        <span className="block truncate text-sm font-semibold tracking-wide">{t("meta.appName")}</span>
        <span className="block truncate text-xs text-muted">{t("meta.appTagline")}</span>
      </span>
    </Link>
  );
}

export function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  return (
    <aside
      className={cn(
        "no-print sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-background-subtle transition-[width] duration-150 lg:flex",
        collapsed ? "w-[72px]" : "w-[264px]",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed && "justify-center px-0")}>
        <Brand collapsed={collapsed} />
      </div>
      <SidebarNav collapsed={collapsed} />
      <div className={cn("border-t border-border p-3", collapsed && "flex justify-center")}>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          aria-expanded={!collapsed}
          className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted transition-colors hover:bg-card hover:text-foreground [&_svg]:size-5"
        >
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          <span className={cn(collapsed && "sr-only")}>{collapsed ? t("nav.expand") : t("nav.collapse")}</span>
        </button>
      </div>
    </aside>
  );
}
