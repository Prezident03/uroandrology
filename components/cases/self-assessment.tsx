"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CaseQuestion } from "@/lib/content/schema";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** Multiple-choice self-check for a clinical case. Answers stay in memory and are never stored. */
export function SelfAssessment({ questions }: { questions: CaseQuestion[] }) {
  const { t } = useI18n();
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(() => questions.map(() => false));
  const done = checked.filter(Boolean).length;
  const correct = questions.filter((q, i) => checked[i] && picked[i] === q.answer).length;

  if (questions.length === 0) return null;

  return (
    <section aria-labelledby="self-check-heading" className="max-w-reading space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="self-check-heading" className="text-lg font-semibold">{t("cases.selfCheck")}</h2>
        <span role="status" className="font-mono text-xs text-muted">
          {t("cases.score", { correct, done, total: questions.length })}
        </span>
      </div>
      <ol className="space-y-4">
        {questions.map((q, qi) => {
          const isChecked = checked[qi];
          const name = `q-${qi}`;
          return (
            <li key={qi} className="rounded-card border border-border bg-card p-4">
              <fieldset disabled={isChecked}>
                <legend className="mb-3 text-sm font-medium">
                  <span className="mr-2 font-mono text-xs text-muted">{qi + 1}.</span>
                  {q.question}
                </legend>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const state = !isChecked ? undefined : oi === q.answer ? "correct" : oi === picked[qi] ? "wrong" : undefined;
                    return (
                      <label
                        key={oi}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                          state === "correct" ? "border-success/50 bg-success/10" : state === "wrong" ? "border-danger/50 bg-danger/10" : "border-border hover:border-primary/40",
                        )}
                      >
                        <input
                          type="radio"
                          name={name}
                          checked={picked[qi] === oi}
                          onChange={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                          className="accent-[var(--color-primary)]"
                        />
                        <span className="flex-1">{opt}</span>
                        {state === "correct" && <CheckCircle2 aria-label={t("cases.correct")} className="size-4 text-success" />}
                        {state === "wrong" && <XCircle aria-label={t("cases.incorrect")} className="size-4 text-danger-text" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {isChecked ? (
                <div className="mt-3 space-y-2">
                  <p className={cn("text-sm font-medium", picked[qi] === q.answer ? "text-success" : "text-danger-text")}>
                    {picked[qi] === q.answer ? t("cases.correct") : t("cases.incorrect")}
                  </p>
                  <p className="text-sm text-muted">{q.explanation}</p>
                </div>
              ) : (
                <Button size="sm" className="mt-3" disabled={picked[qi] === null}
                  onClick={() => setChecked((c) => c.map((v, i) => (i === qi ? true : v)))}>
                  {t("cases.check")}
                </Button>
              )}
            </li>
          );
        })}
      </ol>
      {done > 0 && (
        <Button variant="secondary" size="sm" onClick={() => { setPicked(questions.map(() => null)); setChecked(questions.map(() => false)); }}>
          <RotateCcw aria-hidden="true" /> {t("cases.restart")}
        </Button>
      )}
    </section>
  );
}
