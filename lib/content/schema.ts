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
    year: z.number().int().min(1900).max(2100),
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

const localizedText = z.object({ uz: z.string(), en: z.string(), ru: z.string() }).strict();

/** content/reference-ranges/<id>.yaml: one dataset per source edition. */
export const rangeDatasetSchema = z
  .object({
    id: refKey,
    title: localizedText,
    source: refKey,
    edition: z.string(),
    status: contentStatusSchema,
    reviewedBy: z.string().optional(),
    reviewedAt: isoDate.optional(),
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

export type Reference = z.infer<typeof referenceSchema>;
export type RangeDataset = z.infer<typeof rangeDatasetSchema>;
export type ContentLocale = z.infer<typeof localeSchema>;
export type ContentStatusValue = z.infer<typeof contentStatusSchema>;

export interface CompiledEntry {
  kind: "section" | "topic";
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
  /** Review status of every file, including drafts hidden from production: `${kind}:${module}/${slug}` → locale → status */
  statusIndex: Record<string, Partial<Record<ContentLocale, ContentStatusValue>>>;
  references: Record<string, CompiledReference>;
  rangeDatasets: Record<string, RangeDataset>;
  warnings: string[];
}
