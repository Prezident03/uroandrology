/** Body-mass index: weight (kg) divided by height (m) squared. */
export const BMI_LIMITS = { weightKg: { min: 20, max: 400 }, heightCm: { min: 100, max: 250 } } as const;

export type BmiError = "weight-range" | "height-range";

export function validateBmiInput(weightKg: number, heightCm: number): BmiError[] {
  const errors: BmiError[] = [];
  if (!Number.isFinite(weightKg) || weightKg < BMI_LIMITS.weightKg.min || weightKg > BMI_LIMITS.weightKg.max) errors.push("weight-range");
  if (!Number.isFinite(heightCm) || heightCm < BMI_LIMITS.heightCm.min || heightCm > BMI_LIMITS.heightCm.max) errors.push("height-range");
  return errors;
}

export function computeBmi(weightKg: number, heightCm: number): number | null {
  if (validateBmiInput(weightKg, heightCm).length > 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}
