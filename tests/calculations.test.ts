import { describe, expect, it } from "vitest";
import { computeBmi, validateBmiInput } from "@/lib/calculations/bmi";
import { compareToLimits, parseDecimal, totalSpermNumber } from "@/lib/calculations/limits";
import { scoreQuestionnaire } from "@/lib/calculations/questionnaire";
import type { Questionnaire } from "@/lib/content/schema";

const L = (s: string) => ({ uz: s, en: s, ru: s });

// TEST FIXTURE ONLY: not a real questionnaire.
const q: Questionnaire = {
  id: "test",
  title: L("Test"),
  source: "test",
  licence: "test",
  status: "draft",
  items: [
    { id: "a", text: L("A"), options: [{ score: 0, text: L("0") }, { score: 2, text: L("2") }] },
    { id: "b", text: L("B"), options: [{ score: 1, text: L("1") }, { score: 3, text: L("3") }] },
  ],
  bands: [
    { min: 1, max: 3, label: L("low"), tone: "neutral" },
    { min: 4, max: 5, label: L("high"), tone: "warning" },
  ],
};

describe("BMI", () => {
  it("computes kg/m² to one decimal", () => {
    expect(computeBmi(70, 175)).toBe(22.9);
    expect(computeBmi(100, 200)).toBe(25);
  });
  it("rejects out-of-range input", () => {
    expect(computeBmi(10, 175)).toBeNull();
    expect(validateBmiInput(70, 50)).toEqual(["height-range"]);
    expect(validateBmiInput(Number.NaN, 175)).toEqual(["weight-range"]);
  });
});

describe("questionnaire scoring", () => {
  it("sums scores and assigns a band only when complete", () => {
    expect(scoreQuestionnaire(q, { a: 2 })).toMatchObject({ complete: false, missing: ["b"], total: 2, band: undefined });
    const full = scoreQuestionnaire(q, { a: 2, b: 3 });
    expect(full).toMatchObject({ complete: true, total: 5, minPossible: 1, maxPossible: 5 });
    expect(full.band?.label.en).toBe("high");
  });
  it("rejects scores that are not options", () => {
    expect(() => scoreQuestionnaire(q, { a: 1 })).toThrow();
  });
});

describe("reference limits", () => {
  it("classifies values against limits", () => {
    expect(compareToLimits(1, 2)).toBe("below");
    expect(compareToLimits(2, 2)).toBe("within");
    expect(compareToLimits(5, undefined, 4)).toBe("above");
    expect(compareToLimits(4, undefined, 4)).toBe("within");
    expect(compareToLimits(4)).toBe("no-limit");
  });
  it("computes total sperm number and parses decimals with commas", () => {
    expect(totalSpermNumber(20, 2.5)).toBe(50);
    expect(parseDecimal("1,4")).toBe(1.4);
    expect(parseDecimal("")).toBeUndefined();
    expect(parseDecimal("abc")).toBeUndefined();
  });
});
