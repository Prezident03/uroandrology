import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/clinical/content-page";
import { SemenParameters } from "@/components/clinical/semen-parameters";
import { clinicalModules, getModule } from "@/lib/clinical/modules";
import { getSectionContent } from "@/lib/content";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import type { SectionId } from "@/types/clinical/module";

type Props = PageProps<"/[locale]/modules/[module]/[section]">;

export function generateStaticParams() {
  return clinicalModules.flatMap((m) => m.sections.map((section) => ({ module: m.id, section })));
}

async function resolve(params: Props["params"]) {
  const { module: moduleId, section } = await params;
  const m = getModule(moduleId);
  if (!m || !m.sections.includes(section as SectionId)) return null;
  return { m, section: section as SectionId };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const t = await getTranslator();
  return { title: `${t(`sections.${r.section}`)} · ${t(`modules.${r.m.id}.title`)}` };
}

export default async function SectionPage({ params }: Props) {
  const r = await resolve(params);
  if (!r) notFound();
  const { m, section } = r;
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const base = `/${locale}/modules/${m.id}`;
  const i = m.sections.indexOf(section);
  const link = (s: SectionId) => ({ href: `${base}/${s}`, label: t(`sections.${s}`) });
  const topics = m.topics?.find((g) => g.section === section)?.ids ?? [];

  return (
    <ContentPage
      t={t}
      title={t(`sections.${section}`)}
      eyebrow={{ href: base, label: t(`modules.${m.id}.title`) }}
      lookup={getSectionContent(m.id, section, locale)}
      pathFor={(l) => `/${l}/modules/${m.id}/${section}`}
      prev={i > 0 ? link(m.sections[i - 1]) : undefined}
      next={i < m.sections.length - 1 ? link(m.sections[i + 1]) : undefined}
      outline={m.sections.map(link)}
      outlineTitle={t("modules.sectionsTitle")}
      activeHref={`${base}/${section}`}
      extra={
        <>
          {m.id === "male-infertility" && section === "semen-analysis" && <SemenParameters t={t} />}
          {topics.length > 0 && (
            <section aria-labelledby="topics-heading" className="max-w-reading">
              <h2 id="topics-heading" className="mb-3 text-lg font-semibold">{t("content.topicsTitle")}</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {topics.map((topic) => (
                  <li key={topic}>
                    <Link href={`${base}/topics/${topic}`} className="flex min-h-12 items-center rounded-card border border-border bg-card px-4 text-sm font-medium hover:border-primary/40">
                      {t(`topics.${topic}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      }
    />
  );
}
