import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { editionLine, VerificationBadge } from "@/components/guidelines/verification-badge";
import { listReferences } from "@/lib/content";
import { organizationSchema } from "@/lib/content/schema";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("guidelines.title") };
}

export default async function GuidelinesPage() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const refs = listReferences();
  const verified = refs.filter((r) => r.verified).length;
  const groups = organizationSchema.options
    .map((org) => ({ org, items: refs.filter((r) => r.organization === org).sort((a, b) => a.title.localeCompare(b.title)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader title={t("guidelines.title")} description={t("guidelines.intro")} />

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          [t("guidelines.total"), refs.length],
          [t("guidelines.verifiedCount"), verified],
          [t("guidelines.unverifiedCount"), refs.length - verified],
        ].map(([label, n]) => (
          <div key={label} className="rounded-card border border-border bg-card p-4">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold">{n}</dd>
          </div>
        ))}
      </dl>

      <p role="note" className="rounded-card border border-warning/30 bg-warning/5 p-4 text-sm">{t("guidelines.verificationNote")}</p>

      {groups.length === 0 ? (
        <p className="text-sm text-muted">{t("guidelines.empty")}</p>
      ) : (
        groups.map((g) => (
          <section key={g.org} aria-labelledby={`org-${g.org}`} className="space-y-3">
            <h2 id={`org-${g.org}`} className="text-lg font-semibold">
              {g.org === "Other" ? t("guidelines.otherOrg") : g.org}
            </h2>
            <ul className="space-y-3">
              {g.items.map((r) => (
                <li key={r.key}>
                  <Link href={`/${locale}/guidelines/${r.key}`} className="group block rounded-card border border-border bg-card p-4 hover:border-primary/40">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium">{r.title}</p>
                        <p className="mt-0.5 text-xs text-muted">{editionLine(r, t)}</p>
                      </div>
                      <VerificationBadge reference={r} t={t} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <History aria-hidden="true" className="size-3.5" />
                        {r.updates?.[0] ? t("guidelines.lastUpdate", { date: r.updates[0].date }) : t("guidelines.noUpdates")}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        {t("guidelines.details")} <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
