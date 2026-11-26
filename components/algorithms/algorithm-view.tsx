import { ArrowDown, CornerDownRight, GitFork, Flag, Send } from "lucide-react";
import { StatusBadge } from "@/components/clinical/status-badge";
import { Badge } from "@/components/ui/badge";
import type { Algorithm } from "@/lib/content/schema";
import type { Locale } from "@/lib/i18n/config";
import type { Translator } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";

/** Accessible vertical flowchart: an ordered list of steps with decision branches. */
export function AlgorithmView({ algorithm: a, locale, t }: { algorithm: Algorithm; locale: Locale; t: Translator }) {
  const titleOf = (id: string) => a.nodes.find((n) => n.id === id)?.title[locale] ?? id;
  const stepNumbers = new Map(a.nodes.filter((n) => n.type === "step").map((n, i) => [n.id, i + 1]));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <StatusBadge status={a.status} t={t} />
        {a.reviewedBy && <span>{t("content.reviewedBy", { name: a.reviewedBy })}</span>}
      </div>
      {a.basis === "specification" && (
        <p role="note" className="rounded-card border border-warning/30 bg-warning/5 p-3 text-sm text-warning">{t("algorithms.basisSpec")}</p>
      )}
      <ol className="max-w-reading">
        {a.nodes.map((n, i) => {
          const isLast = i === a.nodes.length - 1;
          const kindLabel = n.type === "decision" ? t("algorithms.decision") : n.type === "end" ? t("algorithms.outcome") : t("algorithms.step", { n: stepNumbers.get(n.id) ?? 0 });
          return (
            <li key={n.id} id={`node-${n.id}`} className="scroll-mt-24">
              <div
                className={cn(
                  "rounded-card border bg-card p-4",
                  n.type === "decision" && "border-primary/40",
                  n.type === "end" && "border-secondary/40",
                  n.type === "step" && "border-border",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                    {n.type === "decision" ? <GitFork aria-hidden="true" className="size-3.5 text-primary" /> : n.type === "end" ? <Flag aria-hidden="true" className="size-3.5 text-secondary" /> : null}
                    {kindLabel}
                  </span>
                  {n.requirement && (
                    <Badge tone={n.requirement === "mandatory" ? "info" : "neutral"}>
                      {n.requirement === "mandatory" ? t("algorithms.mandatory") : n.requirement === "optional" ? t("algorithms.optional") : t("algorithms.conditional")}
                    </Badge>
                  )}
                  {n.referral && (
                    <Badge tone="guideline"><Send aria-hidden="true" />{t("algorithms.referral")}</Badge>
                  )}
                </div>
                <h3 className="mt-1 font-semibold">{n.title[locale]}</h3>
                <p className="mt-1 text-sm text-muted">{n.detail?.[locale] ?? t("algorithms.detailPending")}</p>
                {n.branches && (
                  <ul className="mt-3 space-y-1.5">
                    {n.branches.map((b, bi) => (
                      <li key={bi}>
                        <a href={`#node-${b.to}`} className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm hover:border-primary/40">
                          <CornerDownRight aria-hidden="true" className="size-4 text-primary" />
                          <span className="font-medium">{b.label[locale]}</span>
                          <span className="text-muted">{t("algorithms.goesTo", { target: titleOf(b.to) })}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {!isLast && (
                <div aria-hidden="true" className="flex h-8 items-center pl-6 text-border">
                  <ArrowDown className="size-5 text-muted/60" />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
