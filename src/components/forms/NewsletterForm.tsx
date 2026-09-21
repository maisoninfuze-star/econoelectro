"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIES } from "@/config/site";
import { track } from "@/lib/analytics/events";

export function NewsletterForm({ variant = "section" }: { variant?: "section" | "inline" }) {
  const { dict, locale } = useI18n();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "unavailable">("idle");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const consent = fd.get("consent") === "on";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setFieldError(dict.newsletter.invalidEmail);
    if (!consent) return setFieldError(dict.newsletter.consentRequired);
    setFieldError(null);
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, category: fd.get("category"), consent, website: fd.get("website"), locale }) });
      if (res.status === 503) return setState("unavailable");
      if (!res.ok) throw new Error();
      setState("success");
      track("newsletter_submit", { category: fd.get("category") });
      form.reset();
    } catch {
      setState("error");
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className={variant === "section" ? "mx-auto w-full max-w-xl" : ""} aria-describedby="newsletter-privacy">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            {dict.newsletter.email}
          </label>
          <input id="newsletter-email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder={dict.newsletter.emailPlaceholder} aria-invalid={fieldError ? true : undefined} className="h-12 w-full rounded-md border border-line-strong bg-surface px-4 text-base text-ink outline-none focus:border-ink" />
        </div>
        <div>
          <label htmlFor="newsletter-category" className="sr-only">
            {dict.newsletter.category} ({dict.common.optional})
          </label>
          <select id="newsletter-category" name="category" className="h-12 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink sm:w-52">
            <option value="">{dict.newsletter.categoryAny}</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {dict.categories[c.id].name}
              </option>
            ))}
          </select>
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <Button type="submit" size="lg" disabled={state === "loading"} aria-busy={state === "loading"}>
          {dict.newsletter.submit}
        </Button>
      </div>
      <label className="mt-3 flex items-start gap-2.5 text-sm text-ink-soft">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 shrink-0 rounded accent-ink" />
        <span>{dict.newsletter.consent}</span>
      </label>
      <p id="newsletter-privacy" className="mt-2 text-xs text-ink-muted">
        {dict.newsletter.privacy}
      </p>
      <div aria-live="polite" className="mt-2 min-h-5 text-sm">
        {fieldError ? <p className="font-medium text-brand">{fieldError}</p> : null}
        {state === "success" ? (
          <p className="flex items-center gap-2 font-semibold text-success">
            <Icon name="check" size={18} /> {dict.newsletter.success}
          </p>
        ) : null}
        {state === "error" ? <p className="font-medium text-brand">{dict.newsletter.error}</p> : null}
        {state === "unavailable" ? <p className="font-medium text-warning">{dict.newsletter.unavailable}</p> : null}
      </div>
    </form>
  );
}
