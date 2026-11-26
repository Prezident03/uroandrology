import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/clinical/status-badge";
import { PageHeader } from "@/components/common/page-header";
import { clinicalModules } from "@/lib/clinical/modules";
import { getStatus } from "@/lib/content";
import { locales } from "@/lib/i18n/config";
import { getLocale, getTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("content.statusTitle"), robots: { index: false } };
}

export default async function ContentStatusPage() {
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const items = clinicalModules.flatMap((m) => [
    ...m.sections.map((s) => ({ kind: "section" as const, m, slug: s, label: t(`sections.${s}`), href: `/${locale}/modules/${m.id}/${s}` })),
    ...(m.topics ?? []).flatMap((g) =>
      g.ids.map((id) => ({ kind: "topic" as const, m, slug: id, label: `↳ ${t(`topics.${id}`)}`, href: `/${locale}/modules/${m.id}/topics/${id}` })),
    ),
  ]);
  const done = items.filter((i) => getStatus(i.kind, i.m.id, i.slug, locale) === "approved").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={t("content.statusTitle")} description={t("content.statusIntro")} />
      <p className="text-sm text-muted">{t("content.statusSummary", { done, total: items.length })}</p>
      {clinicalModules.map((m) => (
        <section key={m.id} aria-labelledby={`st-${m.id}`} className="rounded-card border border-border bg-card">
          <h2 id={`st-${m.id}`} className="border-b border-border px-4 py-3 font-semibold">{t(`modules.${m.id}.title`)}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-2 font-medium">{t("content.statusSection")}</th>
                  {locales.map((l) => (
                    <th key={l} scope="col" className="px-4 py-2 font-medium uppercase">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.filter((i) => i.m.id === m.id).map((i) => (
                  <tr key={`${i.kind}:${i.slug}`} className="border-t border-border">
                    <th scope="row" className="px-4 py-2 text-left font-normal">
                      <Link href={i.href} className="hover:text-primary">{i.label}</Link>
                    </th>
                    {locales.map((l) => {
                      const s = getStatus(i.kind, m.id, i.slug, l);
                      return (
                        <td key={l} className="px-4 py-2">
                          {s ? <StatusBadge status={s} t={t} /> : <span className="text-xs text-muted">{t("content.statusMissing")}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
