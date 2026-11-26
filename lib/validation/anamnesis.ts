/**
 * Anamnesis form definitions (spec section 7). Structure only: every field is
 * a generic history prompt from the specification. Answers live in memory and
 * are never persisted (no localStorage, no server).
 */
export const templateIds = ["male-infertility", "erectile-dysfunction", "premature-ejaculation", "hypogonadism"] as const;
export type TemplateId = (typeof templateIds)[number];
export const isTemplateId = (v: string): v is TemplateId => (templateIds as readonly string[]).includes(v);

export const sectionKeys = ["patient", "complaint", "medical", "surgical", "urological", "reproductive", "sexual", "medications", "lifestyle", "family"] as const;
export type SectionKey = (typeof sectionKeys)[number];

export const optionKeys = ["yes", "no", "unknown", "never", "former", "current", "none", "occasional", "regular", "days", "weeks", "months", "years"] as const;
export type OptionKey = (typeof optionKeys)[number];

export type FieldId =
  | "age"
  | "mainComplaint"
  | "duration"
  | "durationUnit"
  | "medicalHistory"
  | "hadSurgery"
  | "surgeryDetails"
  | "urologicalHistory"
  | "tryingToConceive"
  | "conceptionMonths"
  | "previousConception"
  | "sexualHistory"
  | "takesMedication"
  | "medicationList"
  | "testosteroneUse"
  | "smoking"
  | "smokingDetails"
  | "alcohol"
  | "otherLifestyle"
  | "familyHistory";

export interface FieldDef {
  id: FieldId;
  section: SectionKey;
  type: "number" | "textarea" | "choice";
  options?: OptionKey[];
  /** Shown only when another field has one of these values. */
  showIf?: { field: FieldId; equals: OptionKey[] };
  /** Templates in which the field is required ("all" = every template). */
  requiredIn?: "all" | TemplateId[];
  min?: number;
  max?: number;
}

const YNU: OptionKey[] = ["yes", "no", "unknown"];
const YN: OptionKey[] = ["yes", "no"];

export const fields: FieldDef[] = [
  { id: "age", section: "patient", type: "number", requiredIn: "all", min: 18, max: 100 },
  { id: "mainComplaint", section: "complaint", type: "textarea", requiredIn: "all" },
  { id: "duration", section: "complaint", type: "number", requiredIn: "all", min: 0 },
  { id: "durationUnit", section: "complaint", type: "choice", options: ["days", "weeks", "months", "years"], requiredIn: "all" },
  { id: "medicalHistory", section: "medical", type: "textarea" },
  { id: "hadSurgery", section: "surgical", type: "choice", options: YN },
  { id: "surgeryDetails", section: "surgical", type: "textarea", showIf: { field: "hadSurgery", equals: ["yes"] }, requiredIn: "all" },
  { id: "urologicalHistory", section: "urological", type: "textarea" },
  { id: "tryingToConceive", section: "reproductive", type: "choice", options: YN, requiredIn: ["male-infertility"] },
  { id: "conceptionMonths", section: "reproductive", type: "number", min: 0, showIf: { field: "tryingToConceive", equals: ["yes"] } },
  { id: "previousConception", section: "reproductive", type: "choice", options: YNU },
  { id: "sexualHistory", section: "sexual", type: "textarea", requiredIn: ["erectile-dysfunction", "premature-ejaculation"] },
  { id: "takesMedication", section: "medications", type: "choice", options: YN },
  { id: "medicationList", section: "medications", type: "textarea", showIf: { field: "takesMedication", equals: ["yes"] }, requiredIn: "all" },
  { id: "testosteroneUse", section: "medications", type: "choice", options: YNU, requiredIn: ["hypogonadism", "male-infertility"] },
  { id: "smoking", section: "lifestyle", type: "choice", options: ["never", "former", "current"] },
  { id: "smokingDetails", section: "lifestyle", type: "textarea", showIf: { field: "smoking", equals: ["former", "current"] } },
  { id: "alcohol", section: "lifestyle", type: "choice", options: ["none", "occasional", "regular"] },
  { id: "otherLifestyle", section: "lifestyle", type: "textarea" },
  { id: "familyHistory", section: "family", type: "textarea" },
];

/** Section order puts the most relevant history first for each template. */
export const sectionOrder: Record<TemplateId, SectionKey[]> = {
  "male-infertility": ["patient", "complaint", "reproductive", "sexual", "medical", "surgical", "urological", "medications", "lifestyle", "family"],
  "erectile-dysfunction": ["patient", "complaint", "sexual", "medical", "medications", "lifestyle", "surgical", "urological", "reproductive", "family"],
  "premature-ejaculation": ["patient", "complaint", "sexual", "medical", "medications", "urological", "lifestyle", "surgical", "reproductive", "family"],
  hypogonadism: ["patient", "complaint", "medical", "medications", "sexual", "reproductive", "surgical", "urological", "lifestyle", "family"],
};

export type Answers = Partial<Record<FieldId, string>>;
export type FieldError = "required" | "age" | "number";

export function isVisible(f: FieldDef, answers: Answers): boolean {
  if (!f.showIf) return true;
  const v = answers[f.showIf.field];
  return v !== undefined && (f.showIf.equals as string[]).includes(v);
}

export function isRequired(f: FieldDef, template: TemplateId): boolean {
  return f.requiredIn === "all" || (Array.isArray(f.requiredIn) && f.requiredIn.includes(template));
}

export function validateAnswers(template: TemplateId, answers: Answers): Partial<Record<FieldId, FieldError>> {
  const errors: Partial<Record<FieldId, FieldError>> = {};
  for (const f of fields) {
    if (!isVisible(f, answers)) continue;
    const raw = (answers[f.id] ?? "").trim();
    if (raw === "") {
      if (isRequired(f, template)) errors[f.id] = "required";
      continue;
    }
    if (f.type === "number") {
      const n = Number(raw.replace(",", "."));
      if (!Number.isFinite(n) || n < (f.min ?? 0) || (f.max !== undefined && n > f.max)) {
        errors[f.id] = f.id === "age" ? "age" : "number";
      }
    }
  }
  return errors;
}

/** Drops answers to questions that are hidden, so the summary only shows what applies. */
export function visibleAnswers(answers: Answers): Answers {
  return Object.fromEntries(
    fields.filter((f) => isVisible(f, answers) && (answers[f.id] ?? "").trim() !== "").map((f) => [f.id, answers[f.id]!.trim()]),
  ) as Answers;
}
