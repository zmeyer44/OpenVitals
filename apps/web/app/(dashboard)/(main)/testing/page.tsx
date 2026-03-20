"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { TitleActionHeader } from "@/components/title-action-header";
import { ProviderCard } from "@/components/testing/provider-card";
import { PanelCard } from "@/components/testing/panel-card";
import { RetestPlanner } from "@/components/testing/retest-planner";
import { useState, useCallback } from "react";
import { Search } from "lucide-react";

type Tab = "directory" | "panels" | "retest";

const tabs: { id: Tab; label: string }[] = [
  { id: "retest", label: "Retest Planner" },
  { id: "panels", label: "Panels" },
  { id: "directory", label: "Directory" },
];

export default function TestingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab") as Tab | null;
  const activeTab =
    tabParam && tabs.some((t) => t.id === tabParam) ? tabParam : "retest";

  const setTab = useCallback(
    (tab: Tab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  return (
    <div>
      <TitleActionHeader
        title="Testing"
        subtitle="Find labs, explore panels, and plan your next tests."
        under={
          <div className="pill-tabs mt-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={cn(
                  "pill-tab",
                  activeTab === tab.id && "pill-tab-active",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-5 animate-fade-in">
        {activeTab === "directory" && <DirectoryTab />}
        {activeTab === "panels" && <PanelsTab />}
        {activeTab === "retest" && <RetestPlanner />}
      </div>
    </div>
  );
}

function DirectoryTab() {
  const { data: providers, isLoading } =
    trpc.testing["providers.list"].useQuery();
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50"
          />
        ))}
      </div>
    );
  }

  const filtered = (providers ?? []).filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        {filtered.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-neutral-500 py-8">
          No providers match your search.
        </p>
      )}
    </div>
  );
}

function PanelsTab() {
  const { data: panels, isLoading } = trpc.testing["panels.list"].useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50"
          />
        ))}
      </div>
    );
  }

  const items = panels ?? [];

  // Group by category
  const categories = [...new Set(items.map((p) => p.category))];

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const catPanels = items.filter((p) => p.category === cat);
        return (
          <div key={cat}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {cat}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {catPanels.map((panel) => (
                <PanelCard key={panel.id} panel={panel} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
