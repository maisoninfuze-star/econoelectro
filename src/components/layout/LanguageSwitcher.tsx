"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";
import { switchLocalePath } from "@/lib/i18n/routes";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className, variant = "compact" }: { className?: string; variant?: "compact" | "full" }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const other = locale === "fr" ? "en" : "fr";
  const target = switchLocalePath(pathname, other);
  const label = locale === "fr" ? "EN" : "FR";
  return (
    <Link
      href={target}
      hrefLang={other === "fr" ? "fr-CA" : "en-CA"}
      lang={other === "fr" ? "fr-CA" : "en-CA"}
      aria-label={`${dict.a11y.languageSwitcher}: ${dict.common.switchTo}`}
      title={dict.common.switchTo}
      className={cn(
        "inline-flex h-11 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold hover:bg-line/70",
        className,
      )}
      onClick={(e) => {
        // Preserve filters/search when switching language
        if (typeof window !== "undefined" && window.location.search) {
          e.preventDefault();
          router.push(target + window.location.search);
        }
      }}
    >
      <Icon name="globe" size={18} />
      <span>{variant === "full" ? dict.common.switchTo : label}</span>
    </Link>
  );
}
