export type LimitComparison = "below" | "within" | "above" | "no-limit";

/**
 * Compares a value with a reference limit pair. A lower limit is inclusive
 * (a value equal to it is within). Values equal to the upper limit are within.
 */
export function compareToLimits(value: number, lower?: number, upper?: number): LimitComparison {
  if (lower === undefined && upper === undefined) return "no-limit";
  if (lower !== undefined && value < lower) return "below";
  if (upper !== undefined && value > upper) return "above";
  return "within";
}

/** Total sperm number (10⁶ per ejaculate) = concentration (10⁶/mL) × volume (mL). */
export function totalSpermNumber(concentrationMillionsPerMl: number, volumeMl: number): number {
  return Math.round(concentrationMillionsPerMl * volumeMl * 10) / 10;
}

export function parseDecimal(input: string): number | undefined {
  const normalised = input.trim().replace(",", ".");
  if (normalised === "") return undefined;
  const n = Number(normalised);
  return Number.isFinite(n) ? n : undefined;
}
