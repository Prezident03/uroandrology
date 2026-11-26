import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/clinical/content-page";
import { TestosteroneFertilityRule } from "@/components/clinical/safety-rule";
import { clinicalModules, getModule, testosteroneFertilityRulePages } from "@/lib/clinical/modules";
import { getTopicContent } from "@/lib/content";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import type { TopicId } from "@/types/clinical/module";

type Props = PageProps<"/[locale]/modules/[module]/topics/[topic]">;

export function generateStaticParams() {
  return clinicalModules.flatMap((m) =>
    (m.topics ?? []).flatMap((g) => g.ids.map((topic) => ({ module: m.id, topic }))),
  );
}

async function resolve(params: Props["params"]) {
  const { module: moduleId, topic } = await params;
  const m = getModule(moduleId);
  const group = m?.topics?.find((g) => g.ids.includes(topic as TopicId));
  if (!m || !group) return null;
  return { m, group, topic: topic as TopicId };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const t = await getTranslator();
  return { title: `${t(`topics.${r.topic}`)} · ${t(`modules.${r.m.id}.title`)}` };
}

export default async function TopicPage({ params }: Props) {
  const r = await resolve(params);
  if (!r) notFound();
  const { m, group, topic } = r;
  const locale = await getLocale();
  const t = await getTranslator(locale);
  const base = `/${locale}/modules/${m.id}`;
  const i = group.ids.indexOf(topic);
  const link = (id: TopicId) => ({ href: `${base}/topics/${id}`, label: t(`topics.${id}`) });

  return (
    <ContentPage
      t={t}
      title={t(`topics.${topic}`)}
      eyebrow={{ href: `${base}/${group.section}`, label: t(`sections.${group.section}`) }}
      lookup={getTopicContent(m.id, topic, locale)}
      pathFor={(l) => `/${l}/modules/${m.id}/topics/${topic}`}
      prev={i > 0 ? link(group.ids[i - 1]) : undefined}
      next={i < group.ids.length - 1 ? link(group.ids[i + 1]) : undefined}
      outline={group.ids.map(link)}
      outlineTitle={t("content.topicsTitle")}
      notice={testosteroneFertilityRulePages.has(`${m.id}/${topic}`) ? <TestosteroneFertilityRule t={t} /> : undefined}
      activeHref={`${base}/topics/${topic}`}
    />
  );
}
