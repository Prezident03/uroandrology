import type { Messages } from "@/lib/i18n/translate";

export type ModuleId =
  | "male-infertility"
  | "erectile-dysfunction"
  | "premature-ejaculation"
  | "hypogonadism"
  | "clinical-assessment";

export type ModuleIcon = "microscope" | "heart-pulse" | "timer" | "flask" | "clipboard";

/** Section ids are keys of the "sections" message namespace. */
export type SectionId = keyof Messages["sections"];

/** Review lifecycle for every clinical content item (see architecture plan, content model). */
export type ContentStatus = "draft" | "in-review" | "approved" | "requires-review";

/** Topic ids are keys of the "topics" message namespace. */
export type TopicId = keyof Messages["topics"];

export interface ClinicalModuleDefinition {
  id: ModuleId;
  /** Display order, also used for the "A–E" labels on the dashboard. */
  order: number;
  icon: ModuleIcon;
  sections: SectionId[];
  /** Separate topic pages, listed under the section they belong to. */
  topics?: { section: SectionId; ids: TopicId[] }[];
}
