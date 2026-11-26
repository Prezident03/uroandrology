import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AlgorithmView } from "@/components/algorithms/algorithm-view";
import { BookmarkButton } from "@/components/clinical/bookmark-button";
import { RecordRecent } from "@/components/clinical/record-recent";
import { ReferenceList } from "@/components/clinical/reference-list";
import { getAlgorithm, getReferences, listAlgorithms } from "@/lib/content";
import { getLocale, getTranslator } from "@/lib/i18n/server";

type Props = PageProps<"/[locale]/algorithms/[slug]">;

export function generateStaticParams() {
  const ids = listAlgorithms().map((a) => ({ slug: a.id }));
  // Cache Components needs at least one value per dynamic segment.
  return ids.length > 0 ? ids : [{ slug: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getAlgorithm(slug);
  if (!a) return {};
  const locale = await getLocale();
  const t = await getTranslator(locale);
  return { title: `${a.title[locale]} · ${t("algorithms.title")}` };
}

export default async function AlgorithmPage({ params }: Props) {
  const { slug } = await params;
  const a = getAlgorithm(slug);
  if (!a) notFound();
  const locale = await getLocale();
  const t = await getTranslator(locale);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-3">
        <Link href={`/${locale}/algorithms`} className="no-print inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("algorithms.title")}
        </Link>
        <RecordRecent path={`/algorithms/${a.id}`} />
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{a.title[locale]}</h1>
          <BookmarkButton path={`/algorithms/${a.id}`} compact />
        </div>
      </header>
      <AlgorithmView algorithm={a} locale={locale} t={t} />
      <ReferenceList refs={getReferences(a.references)} t={t} />
    </div>
  );
}
