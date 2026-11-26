import { Badge } from "@/components/ui/badge";
import type { ContentStatusValue } from "@/lib/content/schema";
import type { Translator } from "@/lib/i18n/translate";

const tone = {
  approved: "success",
  "requires-review": "warning",
  "in-review": "info",
  draft: "neutral",
} as const;

export function statusLabel(t: Translator, status?: ContentStatusValue) {
  switch (status) {
    case "approved":
      return t("content.statusApproved");
    case "requires-review":
      return t("content.statusRequiresReview");
    case "in-review":
      return t("content.statusInReview");
    case "draft":
      return t("content.statusDraft");
    default:
      return t("status.pendingReview");
  }
}

export function StatusBadge({ status, t, className }: { status?: ContentStatusValue; t: Translator; className?: string }) {
  return (
    <Badge tone={status ? tone[status] : "warning"} className={className}>
      {statusLabel(t, status)}
    </Badge>
  );
}
