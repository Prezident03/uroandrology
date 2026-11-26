import type { LucideIcon } from "lucide-react";
import { Activity, BookMarked, ClipboardCheck, FlaskConical, GitBranch, Microscope, Scale, Timer } from "lucide-react";

export const toolIds = [
  "iief-5",
  "pedt",
  "bmi",
  "semen-analysis",
  "hormonal-assessment",
  "testosterone-pathway",
  "reference-ranges",
] as const;
export type ToolId = (typeof toolIds)[number];

export const toolIcons: Record<ToolId, LucideIcon> = {
  "iief-5": ClipboardCheck,
  pedt: Timer,
  bmi: Scale,
  "semen-analysis": Microscope,
  "hormonal-assessment": FlaskConical,
  "testosterone-pathway": GitBranch,
  "reference-ranges": BookMarked,
};

export const isToolId = (id: string): id is ToolId => (toolIds as readonly string[]).includes(id);

export const ToolFallbackIcon = Activity;
