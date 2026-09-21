"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function NotFoundContent() {
  const { dict, href } = useI18n();
  return (
    <div className="container-x py-20 text-center">
      <p className="text-eyebrow text-brand">404</p>
      <h1 className="text-h1 mt-3">{dict.errors.notFoundTitle}</h1>
      <p className="text-lead mx-auto mt-3 max-w-md text-ink-soft">{dict.errors.notFoundBody}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <LinkButton href={href("shop")} size="lg">
          {dict.nav.shop} <Icon name="arrowRight" size={18} />
        </LinkButton>
        <LinkButton href={href("home")} size="lg" variant="outline">
          {dict.errors.backHome}
        </LinkButton>
      </div>
    </div>
  );
}
