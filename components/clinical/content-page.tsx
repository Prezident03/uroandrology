import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PendingReviewNotice } from "@/components/clinical/content-status";
import { ContentBody } from "@/components/clinical/content-body";
import { ContentMeta, OtherLanguages } from "@/components/clinical/content-meta";
import { ReferenceList } from "@/components/clinical/reference-list";
import { getReferences, type ContentLookup } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import type { Translator } from "@/lib/i18n/translate";
import type { ReactNode } from "react";

export interface PageLink {
  href: string;
  label: string;
}

/** Shared layout for a section or topic page: meta bar, body, references, prev/next and outline. */
export function ContentPage({
  t,
  title,
  eyebrow,
  lookup,
  pathFor,
  extra,
  prev,
  next,
  outline,
  outlineTitle,
  activeHref,
  notice,
}: {
  t: Translator;
  title: string;
  eyebrow: PageLink;
  lookup: ContentLookup;
  pathFor: (l: Locale) => string;
  extra?: ReactNode;
  prev?: PageLink;
  next?: PageLink;
  outline: PageLink[];
  outlineTitle: string;
  activeHref: string;
  /** Fixed safety notice shown above the content, whatever its review status. */
  notice?: ReactNode;
}) {
  const { entry, otherLocales } = lookup;
  return (
    <div className="mx-auto flex max-w-7xl gap-10">
      <article className="min-w-0 flex-1 space-y-6">
        <header className="max-w-reading space-y-3">
          <Link href={eyebrow.href} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
            <ArrowLeft aria-hidden="true" className="size-4" />
            {eyebrow.label}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{entry?.title ?? title}</h1>
          {entry && <ContentMeta entry={entry} t={t} />}
        </header>

        {notice}

        {entry ? (
          <ContentBody html={entry.html} />
        ) : (
          <div className="max-w-reading space-y-3">
            <PendingReviewNotice title={t("status.pendingReview")}>{t("status.pendingReviewText")}</PendingReviewNotice>
            <OtherLanguages locales={otherLocales} pathFor={pathFor} t={t} />
          </div>
        )}

        {extra}

        {entry && <ReferenceList refs={getReferences(entry.references)} t={t} />}

        <nav aria-label={`${t("content.prev")} / ${t("content.next")}`} className="no-print flex max-w-reading flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          {prev ? (
            <Link href={prev.href} className="flex min-h-14 flex-col rounded-card border border-border px-4 py-2.5 hover:border-primary/40 sm:max-w-[48%]">
              <span className="text-xs text-muted">← {t("content.prev")}</span>
              <span className="text-sm font-medium">{prev.label}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={next.href} className="flex min-h-14 flex-col rounded-card border border-border px-4 py-2.5 text-right hover:border-primary/40 sm:ml-auto sm:max-w-[48%]">
              <span className="inline-flex items-center justify-end gap-1 text-xs text-muted">{t("content.next")} <ArrowRight aria-hidden="true" className="size-3" /></span>
              <span className="text-sm font-medium">{next.label}</span>
            </Link>
          )}
        </nav>
      </article>

      <aside className="no-print sticky top-24 hidden h-fit max-h-[calc(100dvh-8rem)] w-72 shrink-0 overflow-y-auto xl:block" aria-labelledby="outline-heading">
        <h2 id="outline-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{outlineTitle}</h2>
        <ol className="space-y-0.5 border-l border-border">
          {outline.map((o) => {
            const active = o.href === activeHref;
            return (
              <li key={o.href}>
                <Link
                  href={o.href}
                  aria-current={active ? "page" : undefined}
                  className={`-ml-px block border-l py-1.5 pl-4 text-sm ${active ? "border-primary text-primary" : "border-transparent text-muted hover:border-border hover:text-foreground"}`}
                >
                  {o.label}
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
