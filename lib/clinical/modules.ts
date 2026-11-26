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
