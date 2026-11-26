import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SelfAssessment } from "@/components/cases/self-assessment";
import { ContentPage } from "@/components/clinical/content-page";
import { getCaseContent, listCaseSlugs } from "@/lib/content";
import { getLocale, getTranslator } from "@/lib/i18n/server";

type Props = PageProps<"/[locale]/clinical-cases/[slug]">;

export function generateStaticParams() {
  const slugs = listCaseSlugs().map((slug) => ({ slug }));
  // Cache Components needs at least one value per dynamic segment.
  return slugs.length > 0 ? slugs : [{ slug: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const { entry } = getCaseContent(slug, locale);
  const t = await getTranslator(locale);
  return entry?.title ? { title: `${entry.title} · ${t("cases.title")}` } : {};
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  if (!listCaseSlugs().includes(slug)) notFound();
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const lookup = getCaseContent(slug, locale);
  if (!lookup.entry && lookup.otherLocales.length === 0) notFound();
  const others = listCaseSlugs()
    .map((s) => ({ s, title: getCaseContent(s, locale).entry?.title }))
    .filter((c): c is { s: string; title: string } => Boolean(c.title));
  const href = (s: string) => `/${locale}/clinical-cases/${s}`;

  return (
    <ContentPage
      t={t}
      title={slug}
      eyebrow={{ href: `/${locale}/clinical-cases`, label: t("cases.title") }}
      lookup={lookup}
      pathFor={(l) => `/${l}/clinical-cases/${slug}`}
      outline={others.map((c) => ({ href: href(c.s), label: c.title }))}
      outlineTitle={t("cases.title")}
      activeHref={href(slug)}
      path={`/clinical-cases/${slug}`}
      notice={<p role="note" className="max-w-reading rounded-card border border-border bg-background-subtle p-3 text-sm text-muted">{t("cases.educationalNote")}</p>}
      extra={
        <>
          {lookup.entry?.caseMeta && <SelfAssessment questions={lookup.entry.caseMeta.questions} />}
          <p className="max-w-reading text-xs text-muted">{t("cases.discussionDeferred")}</p>
        </>
      }
    />
  );
}
