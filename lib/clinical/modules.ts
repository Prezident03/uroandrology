import type { ClinicalModuleDefinition, ModuleId } from "@/types/clinical/module";

/**
 * Module structure, taken from the master specification (section 6).
 * Only structure lives here. Clinical text is published per locale through
 * the reviewed content system (phase 2) and never hard-coded in components.
 */
export const clinicalModules: ClinicalModuleDefinition[] = [
  {
    id: "male-infertility",
    order: 1,
    icon: "microscope",
    sections: [
      "definition-classification",
      "epidemiology",
      "etiology",
      "pathophysiology",
      "medical-history",
      "physical-examination",
      "semen-analysis",
      "hormonal-assessment",
      "genetic-testing",
      "imaging",
      "differential-diagnosis",
      "treatment",
      "follow-up",
      "clinical-cases",
      "references",
    ],
    topics: [
      {
        section: "semen-analysis",
        ids: [
          "azoospermia",
          "oligozoospermia",
          "asthenozoospermia",
          "teratozoospermia",
          "oligoasthenoteratozoospermia",
          "necrozoospermia",
          "leukocytospermia",
        ],
      },
    ],
  },
  {
    id: "erectile-dysfunction",
    order: 2,
    icon: "heart-pulse",
    sections: [
      "definition",
      "classification",
      "etiology",
      "pathophysiology",
      "medical-history",
      "physical-examination",
      "cardiovascular-risk",
      "laboratory-diagnostics",
      "hormonal-assessment",
      "differential-diagnosis",
      "treatment",
      "follow-up",
    ],
    topics: [
      {
        section: "etiology",
        ids: ["psychogenic-vs-organic", "vascular-factors", "endocrine-factors", "neurological-factors", "medication-related-ed"],
      },
      { section: "medical-history", ids: ["iief-5"] },
      {
        section: "treatment",
        ids: [
          "lifestyle-modifications",
          "pde5-inhibitors",
          "testosterone-therapy",
          "vacuum-devices",
          "intracavernosal-therapy",
          "surgical-treatment",
          "contraindications-interactions",
        ],
      },
    ],
  },
  {
    id: "premature-ejaculation",
    order: 3,
    icon: "timer",
    sections: [
      "definition",
      "classification",
      "lifelong-acquired",
      "etiology",
      "diagnostic-criteria",
      "history",
      "pedt",
      "differential-diagnosis",
      "treatment",
      "follow-up",
    ],
    topics: [
      { section: "diagnostic-criteria", ids: ["ielt", "ejaculatory-control", "patient-distress", "partner-impact"] },
      { section: "differential-diagnosis", ids: ["associated-ed"] },
    ],
  },
  {
    id: "hypogonadism",
    order: 4,
    icon: "flask",
    sections: [
      "definition",
      "classification",
      "primary",
      "secondary",
      "etiology",
      "clinical-symptoms",
      "physical-examination",
      "hormonal-diagnostics",
      "differential-diagnosis",
      "treatment",
      "follow-up",
    ],
    topics: [
      {
        section: "hormonal-diagnostics",
        ids: [
          "total-testosterone",
          "free-testosterone",
          "shbg",
          "lh",
          "fsh",
          "prolactin",
          "estradiol",
          "tsh",
          "morning-sampling",
          "repeat-confirmation",
        ],
      },
      { section: "differential-diagnosis", ids: ["primary-vs-secondary", "pituitary-investigation"] },
      { section: "treatment", ids: ["fertility-implications"] },
    ],
  },
  {
    id: "clinical-assessment",
    order: 5,
    icon: "clipboard",
    sections: [
      "initial-assessment",
      "anamnesis-workflow",
      "physical-examination-checklist",
      "laboratory-selection",
      "decision-trees",
      "differential-diagnosis",
      "referral-criteria",
      "follow-up-planning",
    ],
  },
];

export const moduleIds = clinicalModules.map((m) => m.id);

export function getModule(id: string): ClinicalModuleDefinition | undefined {
  return clinicalModules.find((m) => m.id === id);
}

export function isModuleId(id: string): id is ModuleId {
  return moduleIds.includes(id as ModuleId);
}

/**
 * Pages that must carry the testosterone/fertility safety rule from the
 * master specification (Module 04): testosterone replacement is never
 * presented as routine treatment for men actively seeking fertility.
 */
export const testosteroneFertilityRulePages = new Set([
  "male-infertility/treatment",
  "hypogonadism/treatment",
  "hypogonadism/fertility-implications",
  "erectile-dysfunction/testosterone-therapy",
]);

/** Clinical assessment integrates the other modules (spec, Module 05). */
export const integratedModuleIds = ["male-infertility", "erectile-dysfunction", "premature-ejaculation", "hypogonadism"] as const;

export function getModuleTopics(m: ClinicalModuleDefinition): string[] {
  return m.topics?.flatMap((t) => t.ids) ?? [];
}

/**
 * Semen analysis parameters the interpreter and reference tables cover
 * (spec section 6, Module 01). Values come only from reviewed datasets.
 */
export const semenParameterIds = [
  "volume",
  "concentration",
  "total-number",
  "total-motility",
  "progressive-motility",
  "non-progressive-motility",
  "immotile",
  "morphology",
  "vitality",
  "ph",
  "leukocytes",
  "agglutination",
] as const;
