"use client";

import { Menu, Search } from "lucide-react";
import { Brand } from "@/components/navigation/sidebar";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { useI18n } from "@/lib/i18n/client";

export function Header({ onSearch, onMenu }: { onSearch: () => void; onMenu: () => void }) {
  const { t } = useI18n();
  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <button type="button" onClick={onMenu} aria-label={t("nav.openMenu")}
        className="-ml-2 hidden size-11 place-items-center rounded-lg text-muted hover:bg-card hover:text-foreground md:grid lg:hidden">
        <Menu aria-hidden="true" className="size-5" />
      </button>
      <div className="min-w-0 lg:hidden">
        <Brand collapsed={false} nameFromSm />
      </div>
      <button
        type="button"
        onClick={onSearch}
        aria-label={t("search.open")}
        className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted transition-colors hover:border-primary/40 hover:text-foreground lg:ml-0 lg:w-full lg:max-w-md"
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="hidden truncate sm:inline">{t("search.placeholder")}</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 font-mono text-[11px] lg:inline">
          {t("search.shortcut")}
        </kbd>
      </button>
      <LanguageSwitcher className="lg:ml-auto" />
    </header>
  );
}
