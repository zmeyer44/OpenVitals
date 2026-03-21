import { Search } from "lucide-react";
import {
  BIOMARKERS,
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  type MarketingBiomarker,
} from "../data";
import { BiomarkerCard } from "../components/biomarker-card";

interface BiomarkerGridProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function filterBiomarkers(query: string): MarketingBiomarker[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return BIOMARKERS;
  return BIOMARKERS.filter(
    (b) =>
      b.name.toLowerCase().includes(lower) ||
      b.id.toLowerCase().includes(lower) ||
      b.category.toLowerCase().includes(lower) ||
      b.aliases.some((a) => a.toLowerCase().includes(lower)),
  );
}

function groupByCategory(biomarkers: MarketingBiomarker[]) {
  const map = new Map<string, MarketingBiomarker[]>();
  for (const b of biomarkers) {
    const existing = map.get(b.category) ?? [];
    existing.push(b);
    map.set(b.category, existing);
  }
  return map;
}

export function BiomarkerGrid({
  searchQuery,
  onSearchChange,
}: BiomarkerGridProps) {
  const filtered = filterBiomarkers(searchQuery);
  const byCategory = groupByCategory(filtered);
  const visibleCategories = CATEGORY_ORDER.filter((c) => byCategory.has(c));

  return (
    <div>
      {/* Search */}
      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 size-[15px] -translate-y-1/2 text-neutral-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search biomarkers, aliases, or categories..."
          className="w-full border border-neutral-200 bg-white py-3 pl-11 pr-4 font-mono text-[13px] text-neutral-900 placeholder:text-neutral-300 focus:border-neutral-900 focus:outline-none transition-all"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-[15px] font-medium text-neutral-900">
            No biomarkers match &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="mt-1 font-display text-[13px] text-neutral-400">
            Try a different search term or browse the categories.
          </p>
        </div>
      ) : (
        <div>
          {visibleCategories.map((cat, i) => {
            const config = CATEGORY_CONFIG[cat];
            const items = byCategory.get(cat);
            if (!config || !items) return null;
            const Icon = config.icon;

            return (
              <section
                key={cat}
                id={`category-${cat}`}
                className="scroll-mt-24 pb-14"
              >
                {/* Divider between sections */}
                {i > 0 && (
                  <div className="mb-10 border-t border-neutral-200" />
                )}

                {/* Section heading */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center border border-neutral-200 bg-neutral-50">
                    <Icon className="size-4 text-neutral-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-[15px] font-medium text-neutral-900 tracking-[-0.01em]">
                      {config.label}
                    </h2>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                      {items.length} biomarker{items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Card grid */}
                <div className="grid grid-cols-1 gap-px sm:grid-cols-2 border border-neutral-200">
                  {items.map((biomarker) => (
                    <BiomarkerCard key={biomarker.id} biomarker={biomarker} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { filterBiomarkers, groupByCategory };
