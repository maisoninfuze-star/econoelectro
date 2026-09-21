"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics/events";

const field = "mt-1 h-12 w-full rounded-md border border-line-strong bg-surface px-3 text-base text-ink outline-none focus:border-ink aria-[invalid=true]:border-brand";

export function ContactForm({ initialProduct = "" }: { initialProduct?: string }) {
  const { dict, locale } = useI18n();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "unavailable">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;
    const errs: Record<string, string> = {};
    if (!data.name?.trim()) errs.name = `${dict.contact.name} (${dict.common.required})`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email ?? "")) errs.email = dict.newsletter.invalidEmail;
    if (!data.message?.trim()) errs.message = `${dict.contact.message} (${dict.common.required})`;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, locale }) });
      if (res.status === 503) return setState("unavailable");
      if (!res.ok) throw new Error();
      setState("success");
      track("contact_submit", { subject: data.subject });
      form.reset();
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <p role="status" className="mt-4 flex items-start gap-2 rounded-md bg-success-soft p-4 text-sm font-semibold text-success">
        <Icon name="check" size={18} className="mt-0.5 shrink-0" /> {dict.contact.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          {dict.contact.name} <span className="text-brand">*</span>
          <input name="name" type="text" required autoComplete="name" aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "err-name" : undefined} className={field} />
          {errors.name ? <span id="err-name" className="mt-1 block text-xs font-medium text-brand">{errors.name}</span> : null}
        </label>
        <label className="block text-sm font-semibold">
          {dict.contact.email} <span className="text-brand">*</span>
          <input name="email" type="email" required autoComplete="email" inputMode="email" aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "err-email" : undefined} className={field} />
          {errors.email ? <span id="err-email" className="mt-1 block text-xs font-medium text-brand">{errors.email}</span> : null}
        </label>
        <label className="block text-sm font-semibold">
          {dict.contact.phone} <span className="font-normal text-ink-soft">({dict.common.optional})</span>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" className={field} />
        </label>
        <label className="block text-sm font-semibold">
          {dict.contact.subject}
          <select name="subject" className={field} defaultValue={initialProduct ? "product" : "other"}>
            {Object.entries(dict.contact.subjects).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm font-semibold">
        {dict.contact.product} <span className="font-normal text-ink-soft">({dict.common.optional})</span>
        <input name="product" type="text" defaultValue={initialProduct} className={field} />
      </label>
      <label className="block text-sm font-semibold">
        {dict.contact.message} <span className="text-brand">*</span>
        <textarea name="message" required rows={5} aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? "err-message" : undefined} className="mt-1 w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base text-ink outline-none focus:border-ink aria-[invalid=true]:border-brand" />
        {errors.message ? <span id="err-message" className="mt-1 block text-xs font-medium text-brand">{errors.message}</span> : null}
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <p className="text-xs text-ink-muted">{dict.contact.privacy}</p>
      <div aria-live="polite">
        {state === "error" ? <p className="mb-3 text-sm font-medium text-brand">{dict.contact.error}</p> : null}
        {state === "unavailable" ? <p className="mb-3 text-sm font-medium text-warning">{dict.contact.unavailable}</p> : null}
      </div>
      <Button type="submit" size="lg" disabled={state === "loading"} aria-busy={state === "loading"}>
        {state === "loading" ? dict.common.sending : dict.contact.submit}
      </Button>
    </form>
  );
}
