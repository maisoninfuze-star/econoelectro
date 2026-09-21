"use client";

import { useEffect } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button, LinkButton } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { dict, href } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x py-20 text-center">
      <h1 className="text-h1">{dict.errors.genericTitle}</h1>
      <p className="text-lead mx-auto mt-3 max-w-md text-ink-soft">{dict.errors.genericBody}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Button size="lg" onClick={reset}>
          {dict.errors.tryAgain}
        </Button>
        <LinkButton href={href("home")} size="lg" variant="outline">
          {dict.errors.backHome}
        </LinkButton>
      </div>
    </div>
  );
}
