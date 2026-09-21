"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { LOCATIONS, getLocation, HOURS } from "@/config/business";
import type { LocationId } from "@/config/business";
import type { FulfillmentMethod, Product } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

export function PickupDeliverySelector({
  product,
  value,
  onChange,
  locationId,
  onLocationChange,
}: {
  product: Product;
  value: FulfillmentMethod;
  onChange: (v: FulfillmentMethod) => void;
  locationId: LocationId;
  onLocationChange: (id: LocationId) => void;
}) {
  const { dict, locale } = useI18n();
  const fixed = product.locationId ? getLocation(product.locationId) : null;
  type Option = { id: FulfillmentMethod; label: string; note: string; icon: "store" | "truck"; enabled: boolean };
  const all: Option[] = [
    { id: "pickup", label: dict.product.pickup, note: dict.product.pickupFree, icon: "store", enabled: product.pickupEligible },
    { id: "delivery", label: dict.product.delivery, note: dict.product.deliveryNote, icon: "truck", enabled: product.deliveryEligible },
  ];
  const options = all.filter((o) => o.enabled);
  if (!options.length) return null;
  return (
    <fieldset>
      <legend className="text-sm font-bold">{dict.product.fulfillment}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o.id} className={cn("flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors", value === o.id ? "border-ink bg-surface" : "border-line hover:border-line-strong")}>
            <input type="radio" name="fulfillment" value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="mt-1 h-4 w-4 accent-ink" />
            <span className="flex-1">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon name={o.icon} size={16} /> {o.label}
              </span>
              <span className="mt-0.5 block text-xs text-ink-soft">{o.note}</span>
            </span>
          </label>
        ))}
      </div>
      {value === "pickup" ? (
        <div className="mt-2 rounded-md bg-canvas p-3 text-sm">
          {fixed ? (
            <p className="flex items-start gap-2">
              <Icon name="mapPin" size={16} className="mt-0.5 shrink-0 text-brand" />
              <span>
                <span className="font-semibold">{dict.product.pickupAt} {fixed.name[locale]}</span>
                <br />
                <span className="text-ink-soft">{fixed.address.street}, {fixed.address.city} · {HOURS.display[locale].days}, {HOURS.display[locale].time}</span>
              </span>
            </p>
          ) : (
            <>
              <label htmlFor="pickup-location" className="block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {dict.product.chooseLocation}
              </label>
              <select id="pickup-location" className="mt-1 h-11 w-full rounded-md border border-line bg-surface px-3 text-sm" value={locationId} onChange={(e) => onLocationChange(e.target.value as LocationId)}>
                {LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name[locale]} — {l.address.street}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      ) : null}
    </fieldset>
  );
}
