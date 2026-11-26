import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalises text for search: lower-case, strips diacritics and folds the
 * Uzbek oʻ/gʻ apostrophe variants (ʻ ʼ ' ‘ ’ `) into one form.
 */
export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ʻʼ‘’'`]/g, "'")
    .replace(/ё/g, "е")
    .trim();
}
