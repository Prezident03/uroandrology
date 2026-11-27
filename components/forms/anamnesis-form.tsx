"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { AlertTriangle, Copy, Pencil, Printer, ShieldCheck, Trash2 } from "lucide-react";
import { inputClass } from "@/components/calculators/field";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import {
  fields,
  isRequired,
  isVisible,
  sectionOrder,
  validateAnswers,
  visibleAnswers,
  type Answers,
  type FieldDef,
  type FieldId,
  type SectionKey,
  type TemplateId,
} from "@/lib/validation/anamnesis";

export function AnamnesisForm({ template }: { template: TemplateId }) {
  const { t } = useI18n();
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState<"form" | "summary">("form");
  const [confirmClear, setConfirmClear] = useState(false);
  const errors = useMemo(() => validateAnswers(template, answers), [template, answers]);
  const errorCount = Object.keys(errors).length;
  const dirty = Object.values(answers).some((v) => (v ?? "").trim() !== "");

  // Answers are memory-only: warn before the tab is closed or reloaded.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (id: FieldId, value: string) => setAnswers((a) => ({ ...a, [id]: value }));

  function toSummary() {
    setSubmitted(true);
    if (errorCount > 0) {
      const first = fields.find((f) => errors[f.id]);
      if (first) document.getElementById(`field-${first.id}`)?.focus();
      return;
    }
    setMode("summary");
    window.scrollTo({ top: 0 });
  }

  if (mode === "summary") {
    return <Summary template={template} answers={visibleAnswers(answers)} onEdit={() => setMode("form")} />;
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        toSummary();
      }}
      className="space-y-5"
    >
      <p role="note" className="flex gap-3 rounded-card border border-secondary/30 bg-secondary/5 p-3 text-sm">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-secondary" />
        {t("assessment.privacy")}
      </p>

      {sectionOrder[template].map((section) => (
        <SectionFields key={section} section={section} template={template} answers={answers} errors={submitted ? errors : {}} onChange={set} />
      ))}

      {submitted && errorCount > 0 && (
        <p role="alert" className="flex items-center gap-2 rounded-card border border-danger/40 bg-danger/5 p-3 text-sm text-danger-text">
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
          {t("assessment.errorsSummary", { n: errorCount })}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary">{t("assessment.toSummary")}</Button>
        {dirty &&
          (confirmClear ? (
            <span className="flex items-center gap-2 text-sm">
              {t("assessment.clearConfirm")}
              <Button variant="danger" size="sm" onClick={() => { setAnswers({}); setSubmitted(false); setConfirmClear(false); }}>{t("assessment.options.yes")}</Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>{t("assessment.options.no")}</Button>
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
              <Trash2 aria-hidden="true" />
              {t("assessment.clear")}
            </Button>
          ))}
      </div>
    </form>
  );
}

function SectionFields({
  section,
  template,
  answers,
  errors,
  onChange,
}: {
  section: SectionKey;
  template: TemplateId;
  answers: Answers;
  errors: Partial<Record<FieldId, string>>;
  onChange: (id: FieldId, v: string) => void;
}) {
  const { t } = useI18n();
  const sectionFields = fields.filter((f) => f.section === section && isVisible(f, answers));
  return (
    <fieldset className="rounded-card border border-border bg-card p-4 sm:p-5">
      <legend className="sr-only">{t(`assessment.sections.${section}`)}</legend>
      <h2 aria-hidden="true" className="mb-4 font-semibold">{t(`assessment.sections.${section}`)}</h2>
      <div className={cn("grid gap-4", section === "complaint" && "sm:grid-cols-2")}>
        {sectionFields.map((f) => (
          <Field key={f.id} field={f} required={isRequired(f, template)} value={answers[f.id] ?? ""} error={errors[f.id]} onChange={(v) => onChange(f.id, v)} />
        ))}
      </div>
    </fieldset>
  );
}

function Field({ field: f, required, value, error, onChange }: { field: FieldDef; required: boolean; value: string; error?: string; onChange: (v: string) => void }) {
  const { t } = useI18n();
  const hintId = useId();
  const label = t(`assessment.fields.${f.id}`);
  const errorText =
    error === "required" ? t("assessment.errorRequired") : error === "age" ? t("assessment.errorAge") : error === "number" ? t("assessment.errorNumber") : undefined;
  const labelEl = (
    <span className="flex items-baseline gap-2 text-sm font-medium">
      {label}
      {required ? <span className="text-xs font-normal text-warning">{t("assessment.required")}</span> : <span className="text-xs font-normal text-muted">{t("assessment.optional")}</span>}
    </span>
  );
  const describedBy = errorText ? `${hintId}-err` : f.type === "textarea" ? `${hintId}-hint` : undefined;
  const wide = f.type === "textarea" || f.section === "complaint" && f.id === "mainComplaint";

  return (
    <div className={cn("space-y-1.5", wide && "sm:col-span-2")}>
      {f.type === "choice" ? (
        <fieldset aria-describedby={describedBy} aria-invalid={errorText ? true : undefined}>
          <legend className="mb-2">{labelEl}</legend>
          <div className="flex flex-wrap gap-2">
            {f.options!.map((o, i) => (
              <label
                key={o}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  value === o ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40",
                )}
              >
                <input
                  id={i === 0 ? `field-${f.id}` : undefined}
                  type="radio"
                  name={f.id}
                  value={o}
                  checked={value === o}
                  onChange={() => onChange(o)}
                  className="sr-only"
                />
                {t(`assessment.options.${o}`)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <label className="block space-y-1.5">
          {labelEl}
          {f.type === "textarea" ? (
            <textarea
              id={`field-${f.id}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
              aria-invalid={errorText ? true : undefined}
              aria-describedby={describedBy}
              className={cn(inputClass, "h-auto min-h-24 py-2")}
            />
          ) : (
            <input
              id={`field-${f.id}`}
              inputMode="numeric"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={errorText ? true : undefined}
              aria-describedby={describedBy}
              className={cn(inputClass, "max-w-40 font-mono")}
            />
          )}
        </label>
      )}
      {errorText ? (
        <p id={`${hintId}-err`} className="text-xs text-danger-text">{errorText}</p>
      ) : f.type === "textarea" ? (
        <p id={`${hintId}-hint`} className="text-xs text-muted">{t("assessment.freeTextHint")}</p>
      ) : null}
    </div>
  );
}

function Summary({ template, answers, onEdit }: { template: TemplateId; answers: Answers; onEdit: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const display = (f: FieldDef) => {
    const v = answers[f.id];
    if (v === undefined) return undefined;
    return f.type === "choice" ? t(`assessment.options.${v as "yes"}`) : v;
  };
  const sections = sectionOrder[template]
    .map((s) => ({
      s,
      items: fields
        .filter((f) => f.section === s && f.id !== "durationUnit" && answers[f.id] !== undefined)
        .map((f) => ({
          label: t(`assessment.fields.${f.id}`),
          value: f.id === "duration" ? `${answers.duration} ${t(`assessment.options.${answers.durationUnit as "days"}`)}` : display(f)!,
        })),
    }))
    .filter((x) => x.items.length > 0);

  const title = `${t("assessment.summaryTitle")}: ${t(`assessment.templates.${template}`)}`;
  const text = [title, "", ...sections.flatMap(({ s, items }) => [t(`assessment.sections.${s}`).toUpperCase(), ...items.map((i) => `- ${i.label}: ${i.value}`), ""])].join("\n");

  return (
    <article className="space-y-5">
      <div className="no-print flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onEdit}><Pencil aria-hidden="true" />{t("assessment.edit")}</Button>
        <Button variant="secondary" size="sm" className="tg-hide" onClick={() => window.print()}><Printer aria-hidden="true" />{t("assessment.print")}</Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
          }}
        >
          <Copy aria-hidden="true" />
          {copied ? t("assessment.copied") : t("assessment.copy")}
        </Button>
      </div>
      <div className="rounded-card border border-border bg-card p-5 print:border-0 print:p-0">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-muted">{t("assessment.summaryNote")}</p>
        <div className="mt-5 space-y-5">
          {sections.map(({ s, items }) => (
            <section key={s} className="break-inside-avoid">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">{t(`assessment.sections.${s}`)}</h3>
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[minmax(0,14rem)_1fr]">
                {items.map((i) => (
                  <div key={i.label} className="contents">
                    <dt className="text-muted">{i.label}</dt>
                    <dd className="whitespace-pre-wrap">{i.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
        <p className="mt-6 border-t border-border pt-3 text-xs text-muted">{t("disclaimer.short")}</p>
      </div>
    </article>
  );
}
