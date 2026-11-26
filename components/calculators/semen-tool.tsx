"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { compareToLimits, parseDecimal, totalSpermNumber, type LimitComparison } from "@/lib/calculations/limits";
import type { RangeDataset } from "@/lib/content/schema";
import { useI18n } from "@/lib/i18n/client";
import { inputClass } from "./field";

const tone = { below: "danger", above: "danger", within: "success", "no-limit": "neutral" } as const;

export function SemenTool({ datasets }: { datasets: RangeDataset[] }) {
  const { locale, t } = useI18n();
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? "");
  const [values, setValues] = useState<Record<string, string>>({});
  const ds = datasets.find((d) => d.id === datasetId);

  const rows = useMemo(() => {
    if (!ds) return [];
    const num = (id: string) => parseDecimal(values[id] ?? "");
    return ds.parameters.map((p) => {
      let value = num(p.id);
      let computed = false;
      if (p.id === "total-number" && value === undefined) {
        const c = num("concentration");
        const v = num("volume");
        if (c !== undefined && v !== undefined) {
          value = totalSpermNumber(c, v);
          computed = true;
        }
      }
      const invalid = (values[p.id] ?? "") !== "" && num(p.id) === undefined;
      const result: LimitComparison | undefined = value === undefined ? undefined : compareToLimits(value, p.lowerLimit, p.upperLimit);
      return { p, value, computed, invalid, result };
    });
  }, [ds, values]);

  if (!ds) {
    return <p className="rounded-card border border-warning/30 bg-warning/5 p-4 text-sm text-warning">{t("tools.noDataset")}</p>;
  }
  const abnormal = rows.filter((r) => r.result === "below" || r.result === "above").length;
  const anyValue = rows.some((r) => r.value !== undefined);
  const limitText = (lower?: number, upper?: number) =>
    lower !== undefined ? `≥ ${lower}` : upper !== undefined ? `≤ ${upper}` : "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-card border border-border bg-card p-4">
        <label className="min-w-0 flex-1 space-y-1.5">
          <span className="block text-sm font-medium">{t("tools.dataset")}</span>
          <select value={datasetId} onChange={(e) => setDatasetId(e.target.value)} className={inputClass}>
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>{d.title[locale]}</option>
            ))}
          </select>
        </label>
        <Button variant="ghost" size="sm" onClick={() => setValues({})}>{t("tools.reset")}</Button>
      </div>
      {ds.status !== "approved" && (
        <p role="note" className="flex items-start gap-2 rounded-card border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {t("content.rangeNotApproved")}
        </p>
      )}
      <p className="text-sm text-muted">{t("tools.semenEnter")}</p>

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background-subtle text-left text-xs text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">{t("tools.parameter")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("tools.value")}</th>
              <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">{t("tools.limit")}</th>
              <th scope="col" className="px-3 py-2 font-medium"><span className="sr-only">{t("tools.interpretation")}</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, value, computed, invalid, result }) => (
              <tr key={p.id} className="border-t border-border align-top">
                <th scope="row" className="px-3 py-3 text-left font-normal">
                  <span className="block">{p.label[locale]}</span>
                  <span className="text-xs text-muted">{p.unit}</span>
                  <span className="block text-xs text-muted sm:hidden">{limitText(p.lowerLimit, p.upperLimit)}</span>
                </th>
                <td className="w-28 px-3 py-2 sm:w-36">
                  <input
                    aria-label={`${p.label[locale]} (${p.unit})`}
                    inputMode="decimal"
                    value={values[p.id] ?? ""}
                    placeholder={computed && value !== undefined ? String(value) : ""}
                    onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
                    aria-invalid={invalid || undefined}
                    className={`${inputClass} h-10 font-mono`}
                  />
                  {computed && <span className="mt-1 block text-[11px] text-muted">{t("tools.computed")}</span>}
                  {invalid && <span className="mt-1 block text-[11px] text-danger-text">{t("assessment.errorNumber")}</span>}
                </td>
                <td className="hidden px-3 py-3 font-mono text-xs text-muted sm:table-cell">{limitText(p.lowerLimit, p.upperLimit)}</td>
                <td className="px-3 py-3">
                  {result && (
                    <Badge tone={tone[result]}>
                      {result === "below" ? t("tools.below") : result === "above" ? t("tools.above") : result === "within" ? t("tools.within") : t("tools.noLimit")}
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {anyValue && (
        <p aria-live="polite" className={`rounded-card border p-4 text-sm font-medium ${abnormal ? "border-danger/40 bg-danger/5 text-danger-text" : "border-success/40 bg-success/5 text-success"}`}>
          {abnormal ? t("tools.summaryAbnormal", { n: abnormal }) : t("tools.summaryNone")}
        </p>
      )}
    </div>
  );
}
