"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { useSearchIndex } from "@/lib/search/context";
import { findByPath, searchEntries, searchKinds, suggestedPaths, type SearchEntry, type SearchKind } from "@/lib/search/index";
import { useRecents } from "@/lib/storage/user-prefs";
import { cn } from "@/lib/utils";
import { KindIcon } from "./kind-icon";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [kind, setKind] = useState<SearchKind | "all">("all");
  const listId = useId();

  const index = useSearchIndex();
  const { recents } = useRecents();
  const empty = query.trim() === "";
  const results = useMemo<SearchEntry[]>(() => {
    if (empty) {
      // Suggestions: recently opened pages first, then a few common starting points.
      const paths = [...recents.map((r) => r.path), ...suggestedPaths];
      return [...new Set(paths)].map((p) => findByPath(index, p)).filter((e): e is SearchEntry => Boolean(e)).slice(0, 8);
    }
    const all = searchEntries(index, query, 200);
    return (kind === "all" ? all : all.filter((e) => e.kind === kind)).slice(0, 30);
  }, [empty, index, query, kind, recents]);
  const counts = useMemo(() => {
    const c = new Map<SearchKind, number>();
    if (!empty) for (const e of searchEntries(index, query, 200)) c.set(e.kind, (c.get(e.kind) ?? 0) + 1);
    return c;
  }, [empty, index, query]);

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
    setKind("all");
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
      router.push(`/${locale}${results[active].path}`);
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
        {!empty && counts.size > 0 && (
          <div role="group" aria-label={t("search.filter")} className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
            {(["all", ...searchKinds.filter((k) => counts.has(k))] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => { setKind(k); setActive(0); }}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs",
                  kind === k ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted hover:text-foreground",
                )}
              >
                {k === "all" ? t("search.kinds.all") : t(`search.kinds.${k}`)}
                {k !== "all" && <span className="ml-1 font-mono">{counts.get(k)}</span>}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-2">
          {empty && results.length > 0 && (
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">{t("search.suggestions")}</p>
          )}
          {empty && results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">{t("search.hint")}</p>
          ) : !empty && results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">{t("search.noResults", { query })}</p>
          ) : (
            <ul id={listId} role="listbox" aria-label={t("nav.search")} className="space-y-1">
              {results.map((r, i) => (
                <li key={r.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={`/${locale}${r.path}`}
                    onClick={close}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5",
                      i === active ? "bg-card" : "hover:bg-card",
                    )}
                  >
                    <KindIcon kind={r.kind} className="size-5 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      {r.context && <span className="block truncate text-xs text-muted">{r.context}</span>}
                    </span>
                    <span className="shrink-0 rounded border border-border px-1.5 text-[11px] text-muted">
                      {t(`search.kinds.${r.kind}`)}
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
