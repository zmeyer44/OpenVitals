"use client";

import { cn } from "@/lib/utils";
import { ExternalLink, MapPin } from "lucide-react";

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
  };
}

const featureBadges = [
  { key: "supportsWalkIn", label: "Walk-In" },
  { key: "supportsInsurance", label: "Insurance" },
  { key: "supportsDirectAccess", label: "Direct Access" },
] as const;

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className="card-elevated flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900">
          {provider.name}
        </h3>
        {provider.priceRange && (
          <span className="shrink-0 text-sm font-medium text-neutral-500">
            {provider.priceRange}
          </span>
        )}
      </div>

      {provider.description && (
        <p className="text-xs leading-relaxed text-neutral-500 line-clamp-2">
          {provider.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {featureBadges.map(({ key, label }) =>
          provider[key] ? (
            <span
              key={key}
              className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
            >
              {label}
            </span>
          ) : null,
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-1">
        {provider.locationFinderUrl && (
          <a
            href={provider.locationFinderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
              "bg-[var(--color-accent-500)] text-white text-xs font-medium",
              "transition-colors hover:bg-[var(--color-accent-600)]",
            )}
          >
            <MapPin className="h-3 w-3" />
            Find Locations
          </a>
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
  );
}
