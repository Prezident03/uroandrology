import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookmarkButton } from "@/components/clinical/bookmark-button";
import { RecordRecent } from "@/components/clinical/record-recent";
import { AnamnesisForm } from "@/components/forms/anamnesis-form";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { isTemplateId, templateIds } from "@/lib/validation/anamnesis";

type Props = PageProps<"/[locale]/assessment/[template]">;

export function generateStaticParams() {
  return templateIds.map((template) => ({ template }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { template } = await params;
  if (!isTemplateId(template)) return {};
  const t = await getTranslator();
  return { title: `${t(`assessment.templates.${template}`)} · ${t("assessment.title")}`, robots: { index: false } };
}

export default async function TemplatePage({ params }: Props) {
  const { template } = await params;
  if (!isTemplateId(template)) notFound();
  const locale = await getLocale();
  const t = await getTranslator(locale);
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="no-print space-y-3">
        <Link href={`/${locale}/assessment`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("assessment.title")}
        </Link>
        <RecordRecent path={`/assessment/${template}`} />
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t(`assessment.templates.${template}`)}</h1>
          <BookmarkButton path={`/assessment/${template}`} compact />
        </div>
      </header>
      <AnamnesisForm template={template} />
    </div>
  );
}
