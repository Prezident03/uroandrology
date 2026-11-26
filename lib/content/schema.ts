/**
 * Content model (architecture plan, section 2 "Content model").
 * Shared by the build-time compiler (scripts/build-content.ts) and the app.
 * Clinical text itself never lives in code: only these shapes do.
 */
import { z } from "zod";

export const localeSchema = z.enum(["uz", "en", "ru"]);
export const contentStatusSchema = z.enum(["draft", "in-review", "approved", "requires-review"]);
const isoDate = z.iso.date();
const semver = z.string().regex(/^\d+\.\d+\.\d+$/, "version must look like 1.0.0");
const refKey = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "reference keys use lowercase letters, digits and dashes");

export const organizationSchema = z.enum(["EAU", "AUA", "ASRM", "WHO", "ISSM", "Endocrine Society", "Other"]);

/** One entry of content/guidelines/references.yaml (spec section 10). */
export const referenceSchema = z
  .object({
    key: refKey,
    organization: organizationSchema,
    title: z.string().min(3),
    /** Optional for living online guidelines whose version year is recorded at verification. */
    year: z.number().int().min(1900).max(2100).optional(),
    edition: z.string().optional(),
    chapter: z.string().optional(),
    recommendation: z.string().optional(),
    strength: z.string().optional(),
    evidenceLevel: z.string().optional(),
    url: z.url().optional(),
    lastVerified: isoDate.optional(),
    /** Update tracking: newest first. */
    updates: z.array(z.object({ date: isoDate, note: z.string() })).optional(),
  })
  .strict();

export const referenceFileSchema = z.array(referenceSchema);

/** Front matter of every content file (section or topic). */
export const frontMatterSchema = z
  .object({
    title: z.string().optional(),
    version: semver,
    status: contentStatusSchema,
    sourceLocale: localeSchema,
    sourceVersion: semver.optional(),
    reviewedBy: z.string().optional(),
    reviewedAt: isoDate.optional(),
    reviewDue: isoDate.optional(),
    translationVerifiedBy: z.string().optional(),
    references: z.array(refKey).default([]),
  })
  .strict();

export type FrontMatter = z.infer<typeof frontMatterSchema>;

/** Clinical case files (content/cases/<slug>.<locale>.md): fictional or properly anonymised only. */
export const caseFrontMatterSchema = frontMatterSchema
  .extend({
    title: z.string().min(3),
    module: z.enum(["male-infertility", "erectile-dysfunction", "premature-ejaculation", "hypogonadism", "clinical-assessment"]),
    anonymisation: z.enum(["fictional", "anonymised"]),
    questions: z
      .array(
        z
          .object({
            question: z.string().min(3),
            options: z.array(z.string().min(1)).min(2),
            answer: z.number().int().min(0),
            explanation: z.string().min(3),
          })
          .strict()
          .refine((q) => q.answer < q.options.length, "answer must be the index of one of the options"),
      )
      .default([]),
  })
  .strict();

export type CaseFrontMatter = z.infer<typeof caseFrontMatterSchema>;
export type CaseQuestion = CaseFrontMatter["questions"][number];

const localizedText = z.object({ uz: z.string(), en: z.string(), ru: z.string() }).strict();
const reviewFields = {
  status: contentStatusSchema,
  reviewedBy: z.string().optional(),
  reviewedAt: isoDate.optional(),
};

/** content/reference-ranges/<id>.yaml: one dataset per source edition. */
export const rangeDatasetSchema = z
  .object({
    id: refKey,
    title: localizedText,
    source: refKey,
    edition: z.string(),
    /** Which tool may use the dataset; the semen interpreter reads "semen" datasets. */
    group: z.enum(["semen", "hormone", "other"]).default("other"),
    ...reviewFields,
    parameters: z
      .array(
        z
          .object({
            id: z.string(),
            label: localizedText,
            unit: z.string(),
            lowerLimit: z.number().optional(),
            upperLimit: z.number().optional(),
            note: localizedText.partial().optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

/** A score or value band with its interpretation, e.g. a questionnaire severity band. */
export const bandSchema = z
  .object({
    min: z.number(),
    max: z.number(),
    label: localizedText,
    tone: z.enum(["success", "info", "warning", "danger", "neutral"]).default("neutral"),
  })
  .strict();

/** content/questionnaires/<id>.yaml: licensed, validated questionnaire text per language. */
export const questionnaireSchema = z
  .object({
    id: refKey,
    title: localizedText,
    source: refKey,
    licence: z.string().min(3),
    ...reviewFields,
    instructions: localizedText.partial().optional(),
    items: z
      .array(
        z
          .object({
            id: z.string(),
            text: localizedText,
            options: z.array(z.object({ score: z.number(), text: localizedText }).strict()).min(2),
          })
          .strict(),
      )
      .min(1),
    bands: z.array(bandSchema).min(1),
    limitations: localizedText.partial().optional(),
  })
  .strict();

/** content/interpretation/<id>.yaml: value bands for a calculator (e.g. BMI categories). */
export const interpretationSchema = z
  .object({
    id: refKey,
    title: localizedText,
    source: refKey,
    unit: z.string(),
    ...reviewFields,
    bands: z.array(bandSchema).min(1),
  })
  .strict();

/** content/algorithms/<id>.yaml: a diagnostic pathway as data. */
export const algorithmSchema = z
  .object({
    id: refKey,
    title: localizedText,
    /** "specification": step structure taken from the project specification, clinical detail pending. */
    basis: z.enum(["specification", "guideline"]),
    ...reviewFields,
    references: z.array(refKey).default([]),
    nodes: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]+$/),
            type: z.enum(["step", "decision", "end"]),
            title: localizedText,
            detail: localizedText.partial().optional(),
            requirement: z.enum(["mandatory", "optional", "conditional"]).optional(),
            referral: z.boolean().optional(),
            branches: z.array(z.object({ label: localizedText, to: z.string() }).strict()).optional(),
            references: z.array(refKey).optional(),
          })
          .strict(),
      )
      .min(2),
  })
  .strict();

export type Band = z.infer<typeof bandSchema>;
export type Questionnaire = z.infer<typeof questionnaireSchema>;
export type Interpretation = z.infer<typeof interpretationSchema>;
export type Algorithm = z.infer<typeof algorithmSchema>;
export type LocalizedText = z.infer<typeof localizedText>;
export type Reference = z.infer<typeof referenceSchema>;
export type RangeDataset = z.infer<typeof rangeDatasetSchema>;
export type ContentLocale = z.infer<typeof localeSchema>;
export type ContentStatusValue = z.infer<typeof contentStatusSchema>;

export interface CompiledEntry {
  kind: "section" | "topic" | "case";
  module: string;
  slug: string;
  locale: ContentLocale;
  title?: string;
  version: string;
  status: ContentStatusValue;
  sourceLocale: ContentLocale;
  sourceVersion?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewDue?: string;
  overdue: boolean;
  translationVerifiedBy?: string;
  translationBehind: boolean;
  /** Reference keys in citation order. */
  references: string[];
  html: string;
  /** Only for clinical cases. */
  caseMeta?: { anonymisation: "fictional" | "anonymised"; questions: CaseQuestion[] };
}

export interface CompiledReference extends Reference {
  verified: boolean;
}

export interface ContentBundle {
  generatedAt: string;
  preview: boolean;
  /** key: `${module}/${slug}` → locale → entry */
  sections: Record<string, Partial<Record<ContentLocale, CompiledEntry>>>;
  topics: Record<string, Partial<Record<ContentLocale, CompiledEntry>>>;
  /** key: case slug → locale → entry (entry.module = the case's clinical module) */
  cases: Record<string, Partial<Record<ContentLocale, CompiledEntry>>>;
  /** Review status of every file, including drafts hidden from production: `${kind}:${module}/${slug}` → locale → status */
  statusIndex: Record<string, Partial<Record<ContentLocale, ContentStatusValue>>>;
  references: Record<string, CompiledReference>;
  rangeDatasets: Record<string, RangeDataset>;
  questionnaires: Record<string, Questionnaire>;
  interpretations: Record<string, Interpretation>;
  algorithms: Record<string, Algorithm>;
  warnings: string[];
}
