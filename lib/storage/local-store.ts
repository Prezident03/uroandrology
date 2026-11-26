"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Small typed wrapper around localStorage for non-clinical UI preferences
 * only (bookmarks, recents, sidebar state). Never use it for patient data.
 */
const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();
const PREFIX = "ua:";

function emit(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key?.startsWith(PREFIX)) emit(event.key.slice(PREFIX.length));
  });
}

function read<T>(key: string, fallback: T, validate: (v: unknown) => v is T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PREFIX + key);
  } catch {
    return fallback;
  }
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (validate(parsed)) value = parsed;
    } catch {
      /* ignore corrupt values */
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeStore<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or disabled: preference simply isn't kept */
  }
  emit(key);
}

export function useLocalStore<T>(key: string, fallback: T, validate: (v: unknown) => v is T) {
  const subscribe = useCallback(
    (fn: () => void) => {
      const set = listeners.get(key) ?? new Set();
      set.add(fn);
      listeners.set(key, set);
      return () => set.delete(fn);
    },
    [key],
  );
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback, validate),
    () => fallback,
  );
  const set = useCallback((next: T | ((prev: T) => T)) => {
    const prev = read(key, fallback, validate);
    writeStore(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
  }, [key, fallback, validate]);
  return [value, set] as const;
}
