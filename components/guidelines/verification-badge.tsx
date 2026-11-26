import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CompiledReference } from "@/lib/content/schema";
import type { Translator } from "@/lib/i18n/translate";

export function VerificationBadge({ reference, t }: { reference: CompiledReference; t: Translator }) {
  return reference.verified ? (
    <Badge tone="success"><CheckCircle2 aria-hidden="true" />{t("guidelines.verifiedOn", { date: reference.lastVerified ?? "" })}</Badge>
  ) : (
    <Badge tone="warning"><AlertTriangle aria-hidden="true" />{t("guidelines.notVerified")}</Badge>
  );
}

/** "2021 · 6th edition", or a plain note when no edition year has been recorded yet. */
export function editionLine(r: CompiledReference, t: Translator) {
  const parts = [r.year, r.edition, r.chapter].filter(Boolean).join(" · ");
  return parts || t("guidelines.editionPending");
}
