import { ShieldAlert } from "lucide-react";
import type { Translator } from "@/lib/i18n/translate";

/** Fixed safety rule from the master specification, shown regardless of content status. */
export function TestosteroneFertilityRule({ t }: { t: Translator }) {
  return (
    <aside role="note" className="flex max-w-reading gap-3 rounded-card border border-l-4 border-danger/40 border-l-danger bg-danger/5 p-4">
      <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger-text" />
      <div className="text-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-danger-text">{t("content.safetyRuleLabel")}</p>
        <p className="mt-1">{t("content.safetyRuleTestosterone")}</p>
      </div>
    </aside>
  );
}
