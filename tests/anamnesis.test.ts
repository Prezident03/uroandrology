import { describe, expect, it } from "vitest";
import { validateAnswers, visibleAnswers } from "@/lib/validation/anamnesis";

const base = { age: "34", mainComplaint: "x", duration: "6", durationUnit: "months" } as const;

describe("anamnesis validation", () => {
  it("requires the common fields", () => {
    expect(validateAnswers("erectile-dysfunction", {})).toMatchObject({
      age: "required",
      mainComplaint: "required",
      duration: "required",
      durationUnit: "required",
      sexualHistory: "required",
    });
  });
  it("applies template-specific requirements", () => {
    expect(validateAnswers("male-infertility", base)).toEqual({ tryingToConceive: "required", testosteroneUse: "required" });
    expect(validateAnswers("hypogonadism", { ...base, testosteroneUse: "no" })).toEqual({});
  });
  it("checks number ranges", () => {
    expect(validateAnswers("hypogonadism", { ...base, age: "12", testosteroneUse: "no" })).toEqual({ age: "age" });
    expect(validateAnswers("hypogonadism", { ...base, duration: "-1", testosteroneUse: "no" })).toEqual({ duration: "number" });
  });
  it("requires conditional follow-ups only when shown", () => {
    const answers = { ...base, testosteroneUse: "no", hadSurgery: "yes" };
    expect(validateAnswers("hypogonadism", answers)).toEqual({ surgeryDetails: "required" });
    expect(validateAnswers("hypogonadism", { ...answers, hadSurgery: "no" })).toEqual({});
  });
  it("drops hidden answers from the summary", () => {
    const v = visibleAnswers({ ...base, takesMedication: "no", medicationList: "old text" });
    expect(v.medicationList).toBeUndefined();
    expect(v.takesMedication).toBe("no");
  });
});
