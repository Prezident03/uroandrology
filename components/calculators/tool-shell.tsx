import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import type { ReactNode } from "react";
import { ReferenceList } from "@/components/clinical/reference-list";
import type { CompiledReference } from "@/lib/content/schema";
import type { Translator } from "@/lib/i18n/translate";

/** Common frame for every clinical tool: how it works, limitations, sources, and the not-a-diagnosis notice. */
export function ToolShell({
  t,
  locale,
  title,
  description,
  status,
  how,
  limitations,
  refs,
  children,
  aside,
}: {
  t: Translator;
  locale: string;
  title: string;
  description: string;
  status?: ReactNode;
  how?: string;
  limitations?: string;
  refs?: CompiledReference[];
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-3">
        <Link href={`/${locale}/tools`} className="no-print inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("tools.title")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="text-muted">{description}</p>
        {status}
      </header>

      <p role="note" className="flex gap-3 rounded-card border border-primary/30 bg-primary/5 p-3 text-sm">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        {t("tools.notDiagnosis")}
      </p>

      {children}
      {aside}

      {(how || limitations) && (
        <div className="grid gap-4 md:grid-cols-2">
          {how && (
            <section className="rounded-card border border-border bg-card p-5">
              <h2 className="font-semibold">{t("tools.howCalculated")}</h2>
              <p className="mt-2 text-sm text-muted">{how}</p>
            </section>
          )}
          {limitations && (
            <section className="rounded-card border border-border bg-card p-5">
              <h2 className="font-semibold">{t("tools.limitations")}</h2>
              <p className="mt-2 text-sm text-muted">{limitations}</p>
            </section>
          )}
        </div>
      )}

      {refs && <ReferenceList refs={refs} t={t} headingId="tool-references" />}
    </div>
  );
}
