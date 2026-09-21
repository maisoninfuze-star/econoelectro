import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { HOURS, type StoreLocation } from "@/config/business";
import { Icon } from "@/components/ui/Icon";
import { LazyMap } from "./LazyMap";
import { TrackedLink } from "@/components/ui/TrackedLink";

export function LocationCard({ location, locale, withMap = true }: { location: StoreLocation; locale: Locale; withMap?: boolean }) {
  const dict = getDictionary(locale);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.mapsQuery)}`;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface" aria-labelledby={`loc-${location.id}`}>
      {withMap ? <LazyMap query={location.mapsQuery} title={dict.locations.mapTitle.replace("{name}", location.name[locale])} loadLabel={dict.locations.loadMap} privacyNote={dict.locations.mapPrivacy} /> : null}
      <div className="flex flex-1 flex-col p-5">
        <h3 id={`loc-${location.id}`} className="text-h3">
          {location.name[locale]}
        </h3>
        <address className="mt-3 space-y-2 text-sm not-italic text-ink-soft">
          <p className="flex items-start gap-2">
            <Icon name="mapPin" size={16} className="mt-0.5 shrink-0 text-brand" />
            <span>
              {location.address.street}
              <br />
              {location.address.city} ({location.address.province}) {location.address.postalCode}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Icon name="phone" size={16} className="shrink-0 text-brand" />
            <a href={`tel:${location.phoneE164}`} className="font-semibold text-ink underline-offset-4 hover:underline">
              {location.phone}
            </a>
          </p>
          <p className="flex items-start gap-2">
            <Icon name="clock" size={16} className="mt-0.5 shrink-0 text-brand" />
            <span>
              {HOURS.display[locale].days}
              <br />
              {HOURS.display[locale].time}
            </span>
          </p>
        </address>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <TrackedLink href={directions} event="click_directions" params={{ location: location.id }} variant="secondary" external ariaLabel={dict.a11y.directionsTo.replace("{name}", location.name[locale])}>
            <Icon name="mapPin" size={16} /> {dict.locations.directions}
          </TrackedLink>
          <TrackedLink href={`tel:${location.phoneE164}`} event="click_call" params={{ location: location.id, source: "location_card" }} variant="outline" ariaLabel={dict.a11y.callLocation.replace("{name}", location.name[locale]).replace("{phone}", location.phone)}>
            <Icon name="phone" size={16} /> {dict.locations.call}
          </TrackedLink>
        </div>
      </div>
    </article>
  );
}
