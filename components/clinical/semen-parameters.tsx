import { semenParameterIds } from "@/lib/clinical/modules";
import type { Translator } from "@/lib/i18n/translate";

/** Parameters the semen analysis section covers (structure only; limits come from reviewed datasets). */
export function SemenParameters({ t }: { t: Translator }) {
  return (
    <section aria-labelledby="semen-params" className="max-w-reading rounded-card border border-border bg-card p-5">
      <h2 id="semen-params" className="text-base font-semibold">{t("content.parametersTitle")}</h2>
      <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {semenParameterIds.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            {t(`semenParameters.${p}`)}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">{t("content.parametersNote")}</p>
    </section>
  );
}
