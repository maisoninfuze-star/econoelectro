"use client";

import type { ReactNode } from "react";
import { buttonClasses } from "./Button";
import { track, type AnalyticsEvent } from "@/lib/analytics/events";

export function TrackedLink({ href, event, params, variant = "primary", size = "md", className, external, ariaLabel, children }: { href: string; event: AnalyticsEvent; params?: Record<string, unknown>; variant?: "primary" | "secondary" | "outline" | "ghost" | "dark"; size?: "sm" | "md" | "lg"; className?: string; external?: boolean; ariaLabel?: string; children: ReactNode }) {
  return (
    <a href={href} className={buttonClasses(variant, size, className)} onClick={() => track(event, params)} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
