"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { locales, localeCookie, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** Same page in another language: swaps the first path segment. */
export function localizedPath(pathname: string, target: Locale) {
  const parts = pathname.split("/");
  parts[1] = target;
  return parts.join("/") || `/${target}`;
}

function remember(target: Locale) {
  document.cookie = `${localeCookie}=${target}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher({ className, variant = "compact" }: { className?: string; variant?: "compact" | "full" }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  return (
    <div role="group" aria-label={t("language.label")} className={cn("flex items-center gap-1", className)}>
      {variant === "compact" && <Languages aria-hidden="true" className="mr-1 hidden size-4 text-muted sm:block" />}
      {locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={localizedPath(pathname, l)}
            hrefLang={l}
            lang={l}
            onClick={() => remember(l)}
            aria-current={active ? "true" : undefined}
            title={t(`language.${l}`)}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-2.5 text-xs font-semibold uppercase transition-colors",
              variant === "full" && "h-11 px-4 normal-case text-sm font-medium",
              active ? "bg-primary/10 text-primary" : "text-muted hover:bg-card hover:text-foreground",
            )}
          >
            {variant === "full" ? t(`language.${l}`) : l}
          </Link>
        );
      })}
    </div>
  );
}
