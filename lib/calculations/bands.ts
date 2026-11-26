import type { Band } from "@/lib/content/schema";

/** Band whose inclusive [min, max] range contains the value, if any. */
export function findBand(bands: Band[], value: number): Band | undefined {
  return bands.find((b) => value >= b.min && value <= b.max);
}
