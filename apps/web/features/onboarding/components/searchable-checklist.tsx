'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search, Check } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  category?: string;
}

interface SearchableChecklistProps {
  items: ChecklistItem[];
  selected: string[];
  onToggle: (id: string) => void;
  placeholder?: string;
  maxHeight?: string;
}

export function SearchableChecklist({
  items,
  selected,
  onToggle,
  placeholder = 'Search...',
  maxHeight = '320px',
}: SearchableChecklistProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    for (const item of filtered) {
      const cat = item.category ?? 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-neutral-200 bg-white py-2 pl-9 pr-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100 font-body"
        />
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <div className="mb-2 text-[11px] text-accent-600 font-medium font-mono">
          {selected.length} selected
        </div>
      )}

      {/* List */}
      <div className="overflow-y-auto border border-neutral-200" style={{ maxHeight }}>
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category}>
            <div className="sticky top-0 z-10 bg-neutral-50 px-3 py-1.5">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-400 font-mono"
              >
                {category}
              </span>
            </div>
            {categoryItems.map((item) => {
              const isSelected = selected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer',
                    isSelected ? 'bg-accent-50' : 'hover:bg-neutral-50'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center border transition-colors',
                      isSelected
                        ? 'border-accent-500 bg-accent-500'
                        : 'border-neutral-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="size-2.5 text-white" />}
                  </div>
                  <span
                    className={cn(
                      'text-[13px]',
                      isSelected ? 'text-neutral-900 font-medium' : 'text-neutral-700'
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <div className="px-3 py-6 text-center text-[13px] text-neutral-400 font-body">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
