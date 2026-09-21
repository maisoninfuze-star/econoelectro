"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ClearFiltersButton({ label }: { label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Button variant="secondary" onClick={() => router.replace(pathname, { scroll: false })}>
      {label}
    </Button>
  );
}
