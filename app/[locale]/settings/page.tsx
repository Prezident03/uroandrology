import type { Metadata } from "next";
import { ClearLocalData } from "@/components/common/clear-data";
import { PageHeader } from "@/components/common/page-header";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("settings.title") };
}

export default async function SettingsPage() {
  const t = await getTranslator();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t("settings.title")} />
      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-semibold">{t("settings.languageTitle")}</h2>
          <p className="text-sm text-muted">{t("settings.languageText")}</p>
          <LanguageSwitcher variant="full" className="flex-wrap" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-semibold">{t("settings.dataTitle")}</h2>
          <p className="text-sm text-muted">{t("settings.dataText")}</p>
          <ClearLocalData />
        </CardContent>
      </Card>
    </div>
  );
}
