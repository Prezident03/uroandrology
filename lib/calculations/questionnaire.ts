import type { Band, Questionnaire } from "@/lib/content/schema";
import { findBand } from "./bands";

export interface QuestionnaireScore {
  complete: boolean;
  missing: string[];
  total: number;
  minPossible: number;
  maxPossible: number;
  band?: Band;
}

/** Sums item scores. A band is only assigned when every item is answered. */
export function scoreQuestionnaire(q: Questionnaire, answers: Record<string, number | undefined>): QuestionnaireScore {
  const missing = q.items.filter((i) => answers[i.id] === undefined).map((i) => i.id);
  for (const item of q.items) {
    const a = answers[item.id];
    if (a !== undefined && !item.options.some((o) => o.score === a)) throw new Error(`Invalid score ${a} for item ${item.id}`);
  }
  const total = q.items.reduce((n, i) => n + (answers[i.id] ?? 0), 0);
  const minPossible = q.items.reduce((n, i) => n + Math.min(...i.options.map((o) => o.score)), 0);
  const maxPossible = q.items.reduce((n, i) => n + Math.max(...i.options.map((o) => o.score)), 0);
  const complete = missing.length === 0;
  return { complete, missing, total, minPossible, maxPossible, band: complete ? findBand(q.bands, total) : undefined };
}
