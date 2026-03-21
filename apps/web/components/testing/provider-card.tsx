"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  MapPin,
  ChevronDown,
  ChevronUp,
  Star,
  Navigation,
  Globe,
  Loader2,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useNearbyLabs } from "@/hooks/use-nearby-labs";

import questIcon from "@/assets/marketing/brand-logos/quest-icon.png";
import labcorpIcon from "@/assets/marketing/brand-logos/labcorp-icon.png";

const brandIcons: Record<string, string> = {
  quest: questIcon.src,
  labcorp: labcorpIcon.src,
};

const serviceTypeLabels: Record<string, string> = {
  national_lab: "National Laboratory Network",
  online_ordering: "Online Lab Ordering",
  franchise: "Franchise Locations",
  membership: "Membership Service",
};

interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    locationFinderUrl: string | null;
    supportsWalkIn: boolean | null;
    supportsInsurance: boolean | null;
    supportsDirectAccess: boolean | null;
    priceRange: string | null;
    serviceType: string | null;
    placeSearchQuery: string | null;
  };
  userLocation: { lat: number; lng: number } | null;
}

const featureBadges = [
  { key: "supportsWalkIn", label: "Walk-In" },
  { key: "supportsInsurance", label: "Insurance" },
  { key: "supportsDirectAccess", label: "Direct Access" },
] as const;

export function ProviderCard({ provider, userLocation }: ProviderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !!provider.placeSearchQuery && !!userLocation;

  const { places, isLoading, error } = useNearbyLabs(
    provider.placeSearchQuery,
    userLocation,
    expanded,
  );

  return (
    <div className="card-elevated overflow-hidden">
      {/* Main row */}
      <div className="flex items-start gap-3.5 p-4">
        <Avatar
          src={brandIcons[provider.id] ?? null}
          name={provider.name}
          className="size-14 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {provider.name}
              </h3>
              {provider.serviceType && (
                <p className="text-xs text-neutral-400">
                  {serviceTypeLabels[provider.serviceType] ??
                    provider.serviceType}
                </p>
              )}
            </div>
            {provider.priceRange && (
              <span className="shrink-0 text-sm font-medium text-neutral-500">
                {provider.priceRange}
              </span>
            )}
          </div>

          {/* Feature badges */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {featureBadges.map(({ key, label }) =>
              provider[key] ? (
                <span
                  key={key}
                  className="inline-flex items-center bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
                >
                  {label}
                </span>
              ) : null,
            )}
          </div>

          {provider.description && (
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 line-clamp-2">
              {provider.description}
            </p>
          )}

          {/* Action row */}
          <div className="mt-3 flex items-center gap-3">
            {canExpand && (
              <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5",
                  "bg-[var(--color-accent-500)] text-white text-xs font-medium",
                  "transition-colors hover:bg-[var(--color-accent-600)]",
                )}
              >
                <MapPin className="h-3 w-3" />
                {expanded ? "Hide" : "Show"} locations
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}

            {!canExpand && !provider.placeSearchQuery && (
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                <Globe className="h-3 w-3" />
                Online only
              </span>
            )}

            {provider.website && (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-700"
              >
                Visit Website
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Expanded locations */}
      {expanded && (
        <div className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-3">
          {isLoading && (
            <div className="flex items-center gap-2 py-3 text-xs text-neutral-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Finding nearby locations...
            </div>
          )}

          {error && (
            <p className="py-2 text-xs text-neutral-500">
              Could not load locations. Try again later.
            </p>
          )}

          {!isLoading && !error && places.length === 0 && (
            <p className="py-2 text-xs text-neutral-500">
              No locations found within 25 miles.
            </p>
          )}

          {!isLoading && places.length > 0 && (
            <div className="space-y-1">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                {places.length} location{places.length !== 1 ? "s" : ""} nearby
              </p>
              {places.map((place) => (
                <a
                  key={place.placeId}
                  href={`https://www.google.com/maps/place/?q=place_id:${place.placeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-2 py-2 transition-colors hover:bg-neutral-100"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-neutral-800">
                      {place.name}
                    </p>
                    <p className="truncate text-[11px] text-neutral-500">
                      {place.address}
                    </p>
                  </div>
                  {place.rating !== null && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-neutral-500">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {place.rating.toFixed(1)}
                    </span>
                  )}
                  <Navigation className="h-3 w-3 shrink-0 text-neutral-300" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
