"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Brand, SidebarNav } from "@/components/navigation/sidebar";
import { useI18n } from "@/lib/i18n/client";

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={t("nav.main")}
      className="no-print m-0 h-dvh max-h-none w-[min(320px,85vw)] max-w-none bg-transparent p-0 text-foreground backdrop:bg-black/60 lg:hidden"
    >
      <div className="flex h-full flex-col border-r border-border bg-background-subtle">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Brand collapsed={false} />
          <button type="button" onClick={onClose} aria-label={t("nav.closeMenu")}
            className="grid size-11 place-items-center rounded-lg text-muted hover:bg-card hover:text-foreground">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <SidebarNav collapsed={false} onNavigate={onClose} />
      </div>
    </dialog>
  );
}
