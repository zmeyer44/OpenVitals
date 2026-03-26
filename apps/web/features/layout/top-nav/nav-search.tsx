"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import {
  Search,
  TestTubes,
  Pill,
  HeartPulse,
  LayoutDashboard,
  Clock,
  Upload,
  MessageSquare,
  FileText,
  Settings,
  ListChecks,
  Microscope,
  GitCompareArrows,
  Cable,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CornerEdge } from "@/components/decorations/corner-cross";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: LucideIcon;
  category: "metric" | "medication" | "condition" | "page";
}

const PAGES: SearchResult[] = [
  {
    id: "p-home",
    title: "Home",
    href: "/home",
    icon: LayoutDashboard,
    category: "page",
  },
  {
    id: "p-labs",
    title: "Lab Results",
    href: "/labs",
    icon: TestTubes,
    category: "page",
  },
  {
    id: "p-medications",
    title: "Medications",
    href: "/medications",
    icon: Pill,
    category: "page",
  },
  {
    id: "p-conditions",
    title: "Conditions",
    href: "/conditions",
    icon: HeartPulse,
    category: "page",
  },
  {
    id: "p-timeline",
    title: "Timeline",
    href: "/timeline",
    icon: Clock,
    category: "page",
  },
  {
    id: "p-uploads",
    title: "Uploads",
    href: "/uploads",
    icon: Upload,
    category: "page",
  },
  {
    id: "p-biomarkers",
    title: "Biomarkers",
    href: "/biomarkers",
    icon: ListChecks,
    category: "page",
  },
  {
    id: "p-testing",
    title: "Testing & Retest Planner",
    href: "/testing",
    icon: Microscope,
    category: "page",
  },
  {
    id: "p-reports",
    title: "Health Reports",
    href: "/reports",
    icon: FileText,
    category: "page",
  },
  {
    id: "p-encounters",
    title: "Encounters",
    href: "/encounters",
    icon: Stethoscope,
    category: "page",
  },
  {
    id: "p-correlations",
    title: "Correlations",
    href: "/correlations",
    icon: GitCompareArrows,
    category: "page",
  },
  {
    id: "p-ai",
    title: "AI Chat",
    href: "/ai",
    icon: MessageSquare,
    category: "page",
  },
  {
    id: "p-integrations",
    title: "Integrations",
    href: "/integrations",
    icon: Cable,
    category: "page",
  },
  {
    id: "p-settings",
    title: "Settings",
    href: "/settings",
    icon: Settings,
    category: "page",
  },
];

export function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch data for search
  const metrics = trpc.metrics.list.useQuery(undefined, { enabled: open });
  const medications = trpc.medications.list.useQuery({}, { enabled: open });
  const conditions = trpc.conditions.list.useQuery(undefined, {
    enabled: open,
  });
  const encounters = trpc.encounters.list.useQuery(undefined, {
    enabled: open,
  });

  // Build search results
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return PAGES.slice(0, 6);

    const q = query.toLowerCase().trim();
    const matched: SearchResult[] = [];

    // Search metrics
    for (const m of metrics.data ?? []) {
      const name = m.name?.toLowerCase() ?? "";
      const code = m.id?.toLowerCase() ?? "";
      if (name.includes(q) || code.includes(q)) {
        matched.push({
          id: `m-${m.id}`,
          title: m.name,
          subtitle: m.category ?? undefined,
          href: `/labs/${m.id}`,
          icon: TestTubes,
          category: "metric",
        });
      }
    }

    // Search medications
    for (const med of medications.data?.items ?? []) {
      if (med.name.toLowerCase().includes(q)) {
        matched.push({
          id: `med-${med.id}`,
          title: med.name,
          subtitle: med.dosage ?? undefined,
          href: "/medications",
          icon: Pill,
          category: "medication",
        });
      }
    }

    // Search conditions
    for (const cond of conditions.data ?? []) {
      if (cond.name.toLowerCase().includes(q)) {
        matched.push({
          id: `cond-${cond.id}`,
          title: cond.name,
          subtitle: cond.status ?? undefined,
          href: "/conditions",
          icon: HeartPulse,
          category: "condition",
        });
      }
    }

    // Search encounters
    for (const enc of encounters.data ?? []) {
      const type = enc.type?.toLowerCase() ?? "";
      const complaint = enc.chiefComplaint?.toLowerCase() ?? "";
      const provider = enc.provider?.toLowerCase() ?? "";
      if (type.includes(q) || complaint.includes(q) || provider.includes(q)) {
        matched.push({
          id: `enc-${enc.id}`,
          title: `${enc.type.replace(/_/g, " ")}${enc.chiefComplaint ? ` — ${enc.chiefComplaint}` : ""}`,
          subtitle: enc.provider ?? undefined,
          href: "/encounters",
          icon: Stethoscope,
          category: "page",
        });
      }
    }

    // Search pages
    for (const page of PAGES) {
      if (page.title.toLowerCase().includes(q)) {
        matched.push(page);
      }
    }

    return matched.slice(0, 10);
  }, [query, metrics.data, medications.data, conditions.data, encounters.data]);

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const result = results[selectedIndex];
        if (result) {
          router.push(result.href);
          setOpen(false);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [results, selectedIndex, router],
  );

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  const categoryLabels: Record<string, string> = {
    metric: "Biomarkers",
    medication: "Medications",
    condition: "Conditions",
    page: "Pages",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex xl:hidden items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium transition-colors",
          "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50",
        )}
      >
        <Search className="h-3.5 w-3.5" />
      </button>
      {/* Trigger button */}
      <div className="hidden xl:flex items-center">
        <button
          onClick={() => setOpen(true)}
          className="relative flex items-center cursor-pointer"
        >
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <div className="w-44 pl-8 h-9 pr-3 py-1.5 text-[13px] bg-neutral-100 border border-neutral-200 text-neutral-400 flex items-center justify-between rounded-sm">
            <span>Search...</span>
            <kbd className="text-[10px] font-mono text-neutral-400 border border-neutral-200 bg-white px-1.5 py-0.5">
              {"\u2318"}K
            </kbd>
          </div>
        </button>
      </div>

      {/* Command palette overlay */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-900/40"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative flex justify-center pt-[20vh]">
            <div
              ref={panelRef}
              className="w-full max-w-lg bg-white border border-neutral-200 overflow-hidden"
              style={{ animation: "fadeInUp 150ms ease" }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
                <Search className="size-4 text-neutral-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search biomarkers, medications, pages..."
                  className="flex-1 text-[14px] text-neutral-900 placeholder:text-neutral-400 bg-transparent outline-none focus:shadow-none! font-body"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <kbd
                  onClick={() => setOpen(false)}
                  className="text-[10px] font-mono text-neutral-400 border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 cursor-pointer hover:bg-neutral-100"
                >
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto py-2">
                {results.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[13px] text-neutral-400 font-body">
                      No results found
                    </p>
                  </div>
                ) : (
                  results.map((result, index) => {
                    const Icon = result.icon;
                    const isSelected = index === selectedIndex;

                    return (
                      <button
                        key={result.id}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer",
                          isSelected ? "bg-accent-50" : "hover:bg-neutral-50",
                        )}
                        onClick={() => {
                          router.push(result.href);
                          setOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div
                          className={cn(
                            "relative flex items-center justify-center size-7 shrink-0",
                            isSelected ? "bg-accent-100" : "bg-neutral-100",
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-3.5",
                              isSelected
                                ? "text-accent-600"
                                : "text-neutral-400",
                            )}
                          />
                          {!!isSelected && <CornerEdge />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className={cn(
                              "text-[13px] font-medium font-body block truncate",
                              isSelected
                                ? "text-accent-700"
                                : "text-neutral-800",
                            )}
                          >
                            {result.title}
                          </span>
                          {result.subtitle && (
                            <span className="text-[10px] font-mono text-neutral-400 capitalize">
                              {result.subtitle.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {categoryLabels[result.category] ?? result.category}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-neutral-100 flex items-center gap-4">
                <span className="text-[10px] font-mono text-neutral-400">
                  <kbd className="border border-neutral-200 bg-neutral-50 px-1 py-0.5 mr-1">
                    {"↑↓"}
                  </kbd>
                  navigate
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  <kbd className="border border-neutral-200 bg-neutral-50 px-1 py-0.5 mr-1">
                    {"↵"}
                  </kbd>
                  select
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
