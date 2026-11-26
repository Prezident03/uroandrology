"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { ModuleIcon } from "@/components/clinical/module-icon";
import { useI18n } from "@/lib/i18n/client";
import { buildSearchIndex, searchEntries } from "@/lib/search/index";
import { cn } from "@/lib/utils";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const index = useMemo(() => buildSearchIndex(locale, t), [locale, t]);
  const results = useMemo(() => searchEntries(index, query), [index, query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function close() {
    setQuery("");
    setActive(0);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      router.push(results[active].href);
      close();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={(e) => e.target === dialogRef.current && close()}
      aria-label={t("nav.search")}
      className="no-print m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-foreground backdrop:bg-black/60 sm:mx-auto sm:mt-[10vh] sm:h-auto sm:max-w-xl"
    >
      <div className="flex h-full flex-col overflow-hidden border-border bg-background-subtle sm:h-auto sm:max-h-[70vh] sm:rounded-card sm:border">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search aria-hidden="true" className="size-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("search.placeholder")}
            aria-label={t("search.placeholder")}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
          <button type="button" onClick={close} aria-label={t("search.close")}
            className="grid size-10 place-items-center rounded-lg text-muted hover:bg-card hover:text-foreground">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {query.trim() === "" ? (
            <p className="px-3 py-6 text-center text-sm text-muted">{t("search.hint")}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">{t("search.noResults", { query })}</p>
          ) : (
            <ul id={listId} role="listbox" aria-label={t("nav.search")} className="space-y-1">
              {results.map((r, i) => (
                <li key={r.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={r.href}
                    onClick={close}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5",
                      i === active ? "bg-card" : "hover:bg-card",
                    )}
                  >
                    <ModuleIcon name={r.icon} className="size-5 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      {r.context && <span className="block truncate text-xs text-muted">{r.context}</span>}
                    </span>
                    <span className="shrink-0 rounded border border-border px-1.5 text-[11px] text-muted">
                      {r.kind === "module" ? t("search.categoryModule") : t("search.categorySection")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="border-t border-border px-4 py-2 text-xs text-muted">{t("search.scopeNote")}</p>
      </div>
    </dialog>
  );
}
