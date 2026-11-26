import { AlertTriangle, ExternalLink } from "lucide-react";
import type { CompiledReference } from "@/lib/content/schema";
import type { Translator } from "@/lib/i18n/translate";

/** Numbered source list; numbers match the [n] citation markers in the text. */
export function ReferenceList({ refs, t, headingId = "references" }: { refs: CompiledReference[]; t: Translator; headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className="max-w-reading">
      <h2 id={headingId} className="mb-3 text-lg font-semibold">{t("content.references")}</h2>
      {refs.length === 0 ? (
        <p className="text-sm text-muted">{t("content.noReferences")}</p>
      ) : (
        <ol className="space-y-3">
          {refs.map((r, i) => (
            <li key={r.key} id={`ref-${r.key}`} className="scroll-mt-24 rounded-card border border-border bg-card p-4 text-sm">
              <div className="flex gap-3">
                <span className="font-mono text-xs text-muted">[{i + 1}]</span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium">
                    {r.organization} · {r.title}
                  </p>
                  <p className="text-xs text-muted">
                    {[r.year, r.edition, r.chapter].filter(Boolean).join(" · ")}
                  </p>
                  {r.recommendation && <p className="text-muted">{r.recommendation}</p>}
                  {(r.evidenceLevel || r.strength) && (
                    <p className="text-xs text-muted">
                      {r.evidenceLevel && <>{t("content.evidence")}: {r.evidenceLevel}</>}
                      {r.evidenceLevel && r.strength && " · "}
                      {r.strength && <>{t("content.strength")}: {r.strength}</>}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        {t("content.openSource")} <ExternalLink aria-hidden="true" className="size-3.5" />
                      </a>
                    )}
                    {r.verified ? (
                      <span className="text-muted">{t("content.lastVerified", { date: r.lastVerified ?? "" })}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning">
                        <AlertTriangle aria-hidden="true" className="size-3.5" /> {t("content.unverifiedRef")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
