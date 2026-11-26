"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scoreQuestionnaire } from "@/lib/calculations/questionnaire";
import type { Questionnaire } from "@/lib/content/schema";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function QuestionnaireTool({ questionnaire: q }: { questionnaire: Questionnaire }) {
  const { locale, t } = useI18n();
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const score = scoreQuestionnaire(q, answers);
  const answered = q.items.length - score.missing.length;

  return (
    <div className="space-y-4">
      {q.instructions?.[locale] && <p className="text-sm text-muted">{q.instructions[locale]}</p>}
      <ol className="space-y-3">
        {q.items.map((item, i) => (
          <li key={item.id}>
            <fieldset className="rounded-card border border-border bg-card p-4">
              <legend className="sr-only">{item.text[locale]}</legend>
              <p className="mb-3 font-medium" aria-hidden="true">
                <span className="mr-2 font-mono text-xs text-muted">{i + 1}.</span>
                {item.text[locale]}
              </p>
              <div className="grid gap-2">
                {item.options.map((o) => {
                  const checked = answers[item.id] === o.score;
                  return (
                    <label
                      key={o.score}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                        checked ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                      )}
                    >
                      <input
                        type="radio"
                        name={item.id}
                        value={o.score}
                        checked={checked}
                        onChange={() => setAnswers((a) => ({ ...a, [item.id]: o.score }))}
                        className="size-4 accent-[var(--ua-primary)]"
                      />
                      <span className="flex-1">{o.text[locale]}</span>
                      <span className="font-mono text-xs text-muted">{o.score}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <section aria-live="polite" className="sticky bottom-20 z-10 rounded-card border border-border bg-background-subtle p-4 shadow-lg lg:bottom-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-semibold">{t("tools.result")}</h2>
          <span className="text-xs text-muted">{t("tools.answered", { n: answered, total: q.items.length })}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setAnswers({})}>{t("tools.reset")}</Button>
        </div>
        <p className="mt-2 text-2xl font-semibold">
          {t("tools.score")}: <span className="font-mono">{score.total}</span>
          <span className="ml-2 text-sm font-normal text-muted">{t("tools.scoreRange", { min: score.minPossible, max: score.maxPossible })}</span>
        </p>
        {score.band ? (
          <Badge tone={score.band.tone} className="mt-2 text-sm">{score.band.label[locale]}</Badge>
        ) : (
          <p className="mt-1 text-sm text-muted">{t("tools.incomplete")}</p>
        )}
      </section>
    </div>
  );
}
