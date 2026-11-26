"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { compareToLimits, parseDecimal } from "@/lib/calculations/limits";
import { useI18n } from "@/lib/i18n/client";
import type { TopicId } from "@/types/clinical/module";
import { inputClass } from "./field";

const hormones: TopicId[] = ["total-testosterone", "free-testosterone", "shbg", "lh", "fsh", "prolactin", "estradiol", "tsh"];

type Row = { value: string; unit: string; low: string; high: string };
const empty: Row = { value: "", unit: "", low: "", high: "" };

export function HormoneTool() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const set = (id: string, patch: Partial<Row>) => setRows((r) => ({ ...r, [id]: { ...empty, ...r[id], ...patch } }));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setRows({})}>{t("tools.reset")}</Button>
      </div>
      {hormones.map((h) => {
        const r = rows[h] ?? empty;
        const value = parseDecimal(r.value);
        const low = parseDecimal(r.low);
        const high = parseDecimal(r.high);
        const rangeInvalid = low !== undefined && high !== undefined && low >= high;
        const result = value !== undefined && !rangeInvalid && (low !== undefined || high !== undefined) ? compareToLimits(value, low, high) : undefined;
        const name = t(`topics.${h}`);
        return (
          <fieldset key={h} className="rounded-card border border-border bg-card p-4">
            <legend className="sr-only">{name}</legend>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="font-medium" aria-hidden="true">{name}</p>
              {result && (
                <Badge tone={result === "within" ? "success" : "danger"} className="ml-auto">
                  {result === "below" ? t("tools.below") : result === "above" ? t("tools.above") : t("tools.within")}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ["value", t("tools.value")],
                  ["unit", t("tools.unit")],
                  ["low", t("tools.labLow")],
                  ["high", t("tools.labHigh")],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="space-y-1">
                  <span className="block text-xs text-muted">{label}</span>
                  <input
                    aria-label={`${name}: ${label}`}
                    inputMode={key === "unit" ? "text" : "decimal"}
                    value={r[key]}
                    onChange={(e) => set(h, { [key]: e.target.value })}
                    className={`${inputClass} h-10 ${key === "unit" ? "" : "font-mono"}`}
                    aria-invalid={(key === "low" || key === "high") && rangeInvalid ? true : undefined}
                  />
                </label>
              ))}
            </div>
            {rangeInvalid && <p className="mt-2 text-xs text-danger-text">{t("tools.rangeInvalid")}</p>}
          </fieldset>
        );
      })}
    </div>
  );
}
