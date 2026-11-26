import { StatusBadge } from "@/components/clinical/status-badge";
import { getReferences } from "@/lib/content";
import type { RangeDataset } from "@/lib/content/schema";
import type { Locale } from "@/lib/i18n/config";
import type { Translator } from "@/lib/i18n/translate";

export function RangeLibrary({ datasets, locale, t }: { datasets: RangeDataset[]; locale: Locale; t: Translator }) {
  if (datasets.length === 0) return <p className="text-sm text-muted">{t("tools.libraryEmpty")}</p>;
  const fmt = (n?: number) => (n === undefined ? "—" : String(n));
  return (
    <div className="space-y-6">
      {datasets.map((d) => {
        const source = getReferences([d.source])[0];
        return (
          <section key={d.id} aria-labelledby={`ds-${d.id}`} className="rounded-card border border-border bg-card">
            <header className="space-y-2 border-b border-border p-4">
              <h2 id={`ds-${d.id}`} className="font-semibold">{d.title[locale]}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <StatusBadge status={d.status} t={t} />
                <span>{t("content.rangeEdition")}: {d.edition}</span>
                {source && <span>· {t("content.rangeSource")}: {source.organization} — {source.title}</span>}
              </div>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-medium">{t("content.rangeParameter")}</th>
                    <th scope="col" className="px-4 py-2 font-medium">{t("content.rangeUnit")}</th>
                    <th scope="col" className="px-4 py-2 font-medium">{t("content.rangeLower")}</th>
                    <th scope="col" className="px-4 py-2 font-medium">{t("content.rangeUpper")}</th>
                  </tr>
                </thead>
                <tbody>
                  {d.parameters.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <th scope="row" className="px-4 py-2 text-left font-normal">
                        {p.label[locale]}
                        {p.note?.[locale] && <span className="block text-xs text-muted">{p.note[locale]}</span>}
                      </th>
                      <td className="px-4 py-2 text-muted">{p.unit}</td>
                      <td className="px-4 py-2 font-mono">{fmt(p.lowerLimit)}</td>
                      <td className="px-4 py-2 font-mono">{fmt(p.upperLimit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
