import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { BookmarkButton } from "@/components/clinical/bookmark-button";
import { RecordRecent } from "@/components/clinical/record-recent";
import { editionLine, VerificationBadge } from "@/components/guidelines/verification-badge";
import { listReferences } from "@/lib/content";
import { referenceUsageLinks } from "@/lib/content/usage";
import { getLocale, getTranslator } from "@/lib/i18n/server";

type Props = PageProps<"/[locale]/guidelines/[key]">;

const find = (key: string) => listReferences().find((r) => r.key === key);

export function generateStaticParams() {
  const keys = listReferences().map((r) => ({ key: r.key }));
  // Cache Components needs at least one value per dynamic segment.
  return keys.length > 0 ? keys : [{ key: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const r = find(key);
  if (!r) return {};
  const t = await getTranslator();
  return { title: `${r.title} · ${t("guidelines.title")}` };
}

export default async function GuidelinePage({ params }: Props) {
  const { key } = await params;
  const r = find(key);
  if (!r) notFound();
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const usage = referenceUsageLinks(r.key, locale, t);
  const path = `/guidelines/${r.key}`;

  const rows: [string, string | undefined][] = [
    [t("guidelines.organization"), r.organization],
    [t("guidelines.edition"), editionLine(r, t)],
    [t("guidelines.recommendation"), r.recommendation],
    [t("content.strength"), r.strength],
    [t("content.evidence"), r.evidenceLevel],
    [t("guidelines.citationKey"), r.key],
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-3">
        <Link href={`/${locale}/guidelines`} className="no-print inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("guidelines.title")}
        </Link>
        <RecordRecent path={path} />
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{r.title}</h1>
          <BookmarkButton path={path} compact />
        </div>
        <VerificationBadge reference={r} t={t} />
      </header>

      {!r.verified && (
        <p role="note" className="rounded-card border border-warning/30 bg-warning/5 p-4 text-sm">{t("guidelines.unverifiedDetail")}</p>
      )}

      <dl className="divide-y divide-border rounded-card border border-border bg-card">
        {rows.filter(([, v]) => v).map(([label, v]) => (
          <div key={label} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[12rem_1fr]">
            <dt className="text-muted">{label}</dt>
            <dd className={label === t("guidelines.citationKey") ? "font-mono text-xs" : undefined}>{v}</dd>
          </div>
        ))}
        {r.url && (
          <div className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[12rem_1fr]">
            <dt className="text-muted">{t("guidelines.link")}</dt>
            <dd>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-primary hover:underline">
                {t("content.openSource")} <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
              </a>
            </dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="updates-heading" className="space-y-3">
        <h2 id="updates-heading" className="text-lg font-semibold">{t("guidelines.updatesTitle")}</h2>
        {r.updates && r.updates.length > 0 ? (
          <ol className="space-y-2 border-l border-border pl-4">
            {r.updates.map((u) => (
              <li key={`${u.date}-${u.note}`} className="text-sm">
                <time dateTime={u.date} className="font-mono text-xs text-muted">{u.date}</time>
                <p>{u.note}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted">{t("guidelines.noUpdatesDetail")}</p>
        )}
      </section>

      <section aria-labelledby="usage-heading" className="space-y-3">
        <h2 id="usage-heading" className="text-lg font-semibold">{t("guidelines.usedIn")}</h2>
        {usage.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {usage.map((u) => (
              <li key={u.href}>
                <Link href={u.href} className="flex min-h-12 flex-col justify-center rounded-card border border-border bg-card px-4 py-2 hover:border-primary/40">
                  <span className="text-sm font-medium">{u.label}</span>
                  {u.context && <span className="text-xs text-muted">{u.context}</span>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("guidelines.notUsed")}</p>
        )}
      </section>
    </div>
  );
}
