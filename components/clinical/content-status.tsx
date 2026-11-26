import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Amber "requires review" callout used wherever approved content is not yet published. */
export function PendingReviewNotice({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div role="note" className={cn("flex gap-3 rounded-card border border-warning/30 bg-warning/5 p-4", className)}>
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
      <div className="min-w-0 text-sm">
        <p className="font-medium text-warning">{title}</p>
        {children && <div className="mt-1 text-muted">{children}</div>}
      </div>
    </div>
  );
}
