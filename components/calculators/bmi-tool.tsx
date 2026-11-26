"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { findBand } from "@/lib/calculations/bands";
import { computeBmi, validateBmiInput } from "@/lib/calculations/bmi";
import { parseDecimal } from "@/lib/calculations/limits";
import type { Interpretation } from "@/lib/content/schema";
import { useI18n } from "@/lib/i18n/client";
import { NumberField } from "./field";

export function BmiTool({ interpretation }: { interpretation?: Interpretation }) {
  const { locale, t } = useI18n();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const w = parseDecimal(weight);
  const h = parseDecimal(height);
  const errors = w !== undefined && h !== undefined ? validateBmiInput(w, h) : [];
  const weightError = weight !== "" && (w === undefined || errors.includes("weight-range")) ? t("tools.weightRange") : undefined;
  const heightError = height !== "" && (h === undefined || errors.includes("height-range")) ? t("tools.heightRange") : undefined;
  const bmi = w !== undefined && h !== undefined ? computeBmi(w, h) : null;
  const band = bmi !== null && interpretation ? findBand(interpretation.bands, bmi) : undefined;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4 rounded-card border border-border bg-card p-5">
        <NumberField label={t("tools.weight")} value={weight} onChange={(e) => setWeight(e.target.value)} error={weightError} placeholder="75" />
        <NumberField label={t("tools.height")} value={height} onChange={(e) => setHeight(e.target.value)} error={heightError} placeholder="178" />
      </div>
      <section aria-live="polite" className="rounded-card border border-border bg-background-subtle p-5">
        <h2 className="font-semibold">{t("tools.result")}</h2>
        <p className="mt-3 font-mono text-4xl font-semibold">{bmi ?? "—"}</p>
        <p className="text-sm text-muted">kg/m²</p>
        {bmi !== null &&
          (interpretation ? (
            band && <Badge tone={band.tone} className="mt-3 text-sm">{band.label[locale]}</Badge>
          ) : (
            <p className="mt-3 text-sm text-muted">{t("tools.bmiNoBands")}</p>
          ))}
      </section>
    </div>
  );
}
