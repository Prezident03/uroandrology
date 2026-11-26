"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { DesktopSidebar } from "@/components/navigation/sidebar";
import { SearchDialog } from "@/components/navigation/search-dialog";
import { useI18n } from "@/lib/i18n/client";
import { useSidebarCollapsed } from "@/lib/storage/user-prefs";
import { Header } from "./header";
import { MobileDrawer } from "./mobile-drawer";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-dvh">
      <a href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        {t("nav.skipToContent")}
      </a>
      <DesktopSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} />
        <main id="main" className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
        <footer className="border-t border-border px-4 pb-24 pt-4 text-xs text-muted sm:px-6 lg:px-8 lg:pb-4">
          {t("disclaimer.short")}
        </footer>
      </div>
      <BottomNav onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
