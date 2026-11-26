import Link from "next/link";
import { AlertTriangle, FileWarning, Languages } from "lucide-react";
import type { CompiledEntry } from "@/lib/content/schema";
import type { Locale } from "@/lib/i18n/config";
import type { Translator } from "@/lib/i18n/translate";
import { StatusBadge } from "./status-badge";

/** Version, review and translation facts shown at the top of every content page. */
export function ContentMeta({ entry, t }: { entry: CompiledEntry; t: Translator }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
        <StatusBadge status={entry.status} t={t} />
        <span className="font-mono">
          {t("status.version")} {entry.version}
        </span>
        {entry.reviewedBy && (
          <span>
            {t("content.reviewedBy", { name: entry.reviewedBy })}
            {entry.reviewedAt && <>, {t("content.reviewedAt", { date: entry.reviewedAt })}</>}
          </span>
        )}
        {entry.translationVerifiedBy && <span>{t("content.translationBy", { name: entry.translationVerifiedBy })}</span>}
        {entry.reviewDue && (
          <span className={entry.overdue ? "text-warning" : undefined}>
            {entry.overdue ? t("content.overdue") : t("content.reviewDue", { date: entry.reviewDue })}
          </span>
        )}
      </div>
      {(entry.status === "draft" || entry.status === "in-review") && (
        <Banner icon={<FileWarning aria-hidden="true" className="size-5" />} text={t("content.draftBanner")} />
      )}
      {entry.status === "requires-review" && (
        <Banner icon={<AlertTriangle aria-hidden="true" className="size-5" />} text={t("content.requiresReviewBanner")} />
      )}
      {entry.translationBehind && (
        <Banner icon={<Languages aria-hidden="true" className="size-5" />} text={t("content.translationBehind")} />
      )}
    </div>
  );
}

function Banner({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <p role="note" className="flex items-start gap-3 rounded-card border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
      <span className="shrink-0">{icon}</span>
      <span>{text}</span>
    </p>
  );
}

export function OtherLanguages({ locales, pathFor, t }: { locales: Locale[]; pathFor: (l: Locale) => string; t: Translator }) {
  if (locales.length === 0) return null;
  return (
    <p className="text-sm text-muted">
      {t("content.otherLanguages")}{" "}
      {locales.map((l, i) => (
        <span key={l}>
          {i > 0 && ", "}
          <Link href={pathFor(l)} hrefLang={l} className="text-primary hover:underline">
            {t(`language.${l}`)}
          </Link>
        </span>
      ))}
    </p>
  );
}
