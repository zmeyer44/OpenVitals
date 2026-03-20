"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Watch,
  Activity,
  CircleGauge,
  CircleDot,
  Zap,
  Heart,
  Smartphone,
  SquareActivity,
  TestTubes,
  FlaskConical,
  FileHeart,
  Hospital,
  Settings as SettingsIcon,
  RefreshCw,
  Unplug,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { TitleActionHeader } from "@/components/title-action-header";
import { getRelativeTime } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

type Category =
  | "wearables"
  | "health_platforms"
  | "lab_services"
  | "medical_records";

type FilterTab = "all" | "connected" | Category;

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  dataTypes: string[];
}

const categoryLabels: Record<Category, string> = {
  wearables: "Wearables",
  health_platforms: "Health Platforms",
  lab_services: "Lab Services",
  medical_records: "Medical Records",
};

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "connected", label: "Connected" },
  { key: "wearables", label: "Wearables" },
  { key: "health_platforms", label: "Health Platforms" },
  { key: "lab_services", label: "Lab Services" },
  { key: "medical_records", label: "Medical Records" },
];

// Providers that have a real backend implementation
const implementedProviders = new Set(["whoop"]);

const integrationCatalog: IntegrationDef[] = [
  {
    id: "apple-watch",
    name: "Apple Watch",
    description:
      "Heart rate, activity, sleep, and ECG data from your Apple Watch",
    category: "wearables",
    icon: Watch,
    color: "text-rose-600",
    iconBg: "bg-rose-50",
    dataTypes: ["Heart Rate", "Steps", "Sleep", "ECG"],
  },
  {
    id: "fitbit",
    name: "Fitbit",
    description:
      "Activity tracking, sleep analysis, and heart rate monitoring",
    category: "wearables",
    icon: Activity,
    color: "text-teal-600",
    iconBg: "bg-teal-50",
    dataTypes: ["Steps", "Sleep", "Heart Rate", "SpO2"],
  },
  {
    id: "garmin",
    name: "Garmin",
    description:
      "GPS tracking, performance metrics, and health monitoring",
    category: "wearables",
    icon: CircleGauge,
    color: "text-sky-600",
    iconBg: "bg-sky-50",
    dataTypes: ["GPS", "Heart Rate", "VO2 Max", "Steps"],
  },
  {
    id: "oura-ring",
    name: "Oura Ring",
    description:
      "Sleep tracking, readiness scores, and temperature trends",
    category: "wearables",
    icon: CircleDot,
    color: "text-violet-600",
    iconBg: "bg-violet-50",
    dataTypes: ["Sleep", "HRV", "Temperature", "Readiness"],
  },
  {
    id: "whoop",
    name: "Whoop",
    description:
      "Strain tracking, recovery analysis, and sleep performance",
    category: "wearables",
    icon: Zap,
    color: "text-amber-600",
    iconBg: "bg-amber-50",
    dataTypes: ["Strain", "Recovery", "Sleep", "HRV"],
  },
  {
    id: "samsung-galaxy-watch",
    name: "Samsung Galaxy Watch",
    description:
      "Health monitoring, body composition, and blood pressure tracking",
    category: "wearables",
    icon: Watch,
    color: "text-indigo-600",
    iconBg: "bg-indigo-50",
    dataTypes: ["Heart Rate", "Steps", "Body Comp", "BP"],
  },
  {
    id: "apple-health",
    name: "Apple Health",
    description:
      "Centralized health data from all your Apple devices and apps",
    category: "health_platforms",
    icon: Heart,
    color: "text-pink-600",
    iconBg: "bg-pink-50",
    dataTypes: ["Vitals", "Activity", "Nutrition", "Sleep"],
  },
  {
    id: "google-health-connect",
    name: "Google Health Connect",
    description: "Unified health data from Android apps and devices",
    category: "health_platforms",
    icon: Smartphone,
    color: "text-emerald-600",
    iconBg: "bg-emerald-50",
    dataTypes: ["Activity", "Vitals", "Sleep", "Nutrition"],
  },
  {
    id: "samsung-health",
    name: "Samsung Health",
    description:
      "Health and fitness data from Samsung ecosystem devices",
    category: "health_platforms",
    icon: SquareActivity,
    color: "text-blue-600",
    iconBg: "bg-blue-50",
    dataTypes: ["Steps", "Heart Rate", "Stress", "Sleep"],
  },
  {
    id: "quest-diagnostics",
    name: "Quest Diagnostics",
    description:
      "Lab test results and diagnostic reports from Quest locations",
    category: "lab_services",
    icon: TestTubes,
    color: "text-orange-600",
    iconBg: "bg-orange-50",
    dataTypes: ["Blood Work", "Metabolic", "Lipid Panel"],
  },
  {
    id: "labcorp",
    name: "Labcorp",
    description: "Laboratory testing results and health screening data",
    category: "lab_services",
    icon: FlaskConical,
    color: "text-cyan-600",
    iconBg: "bg-cyan-50",
    dataTypes: ["Blood Work", "Urinalysis", "Hormones"],
  },
  {
    id: "epic-mychart",
    name: "Epic MyChart",
    description:
      "Medical records, prescriptions, and visit summaries from Epic providers",
    category: "medical_records",
    icon: FileHeart,
    color: "text-fuchsia-600",
    iconBg: "bg-fuchsia-50",
    dataTypes: ["Records", "Rx", "Labs", "Visits"],
  },
  {
    id: "cerner",
    name: "Cerner",
    description:
      "Electronic health records and clinical data from Cerner systems",
    category: "medical_records",
    icon: Hospital,
    color: "text-slate-600",
    iconBg: "bg-slate-100",
    dataTypes: ["Records", "Labs", "Imaging", "Notes"],
  },
];

function IntegrationCard({
  integration,
  connection,
  onSync,
  onDisconnect,
  isSyncing,
}: {
  integration: IntegrationDef;
  connection?: { provider: string; lastSyncAt: Date | null; lastSyncError: string | null };
  onSync: (provider: string) => void;
  onDisconnect: (provider: string) => void;
  isSyncing: boolean;
}) {
  const Icon = integration.icon;
  const isImplemented = implementedProviders.has(integration.id);
  const isConnected = !!connection;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const cardBody = (
    <div className="p-4 flex-1">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${integration.iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`h-5 w-5 ${integration.color}`} />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold text-neutral-900">
            {integration.name}
          </h3>
          <p className="text-[13px] text-neutral-500 mt-0.5 line-clamp-2">
            {integration.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {integration.dataTypes.map((type) => (
          <span
            key={type}
            className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-neutral-600"
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="card-elevated flex flex-col">
      {isConnected ? (
        <Link href={`/integrations/${integration.id}`} className="flex-1 hover:bg-neutral-50/50 transition-colors rounded-t-xl">
          {cardBody}
        </Link>
      ) : (
        cardBody
      )}

      <div className="border-t border-neutral-200 px-4 py-3">
        {isConnected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSyncing ? (
                <Loader2 className="h-3 w-3 animate-spin text-accent-600" />
              ) : (
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
              )}
              <span className="text-[12px] text-neutral-500">
                {isSyncing
                  ? "Syncing..."
                  : connection.lastSyncAt
                    ? `Synced ${getRelativeTime(connection.lastSyncAt.toISOString())}`
                    : "Connected"}
              </span>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 bottom-full mb-1 w-36 rounded-lg bg-white shadow-lg border border-neutral-200 py-1 z-10">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onSync(integration.id);
                    }}
                    disabled={isSyncing}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Sync Now
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDisconnect(integration.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Unplug className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : isImplemented ? (
          <button
            onClick={() => {
              window.location.href = `/api/integrations/${integration.id}/connect`;
            }}
            className="w-full rounded-lg bg-accent-600 text-white text-[13px] font-medium py-1.5 hover:bg-accent-700 transition-colors cursor-pointer"
          >
            Connect
          </button>
        ) : (
          <button
            disabled
            className="w-full rounded-lg bg-neutral-100 text-neutral-400 text-[13px] font-medium py-1.5 cursor-not-allowed"
          >
            Coming Soon
          </button>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const connectionsQuery = trpc.integrations.list.useQuery();
  const syncMutation = trpc.integrations.sync.useMutation();
  const disconnectMutation = trpc.integrations.disconnect.useMutation();

  // Show success toast when returning from OAuth
  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected) {
      toast.success(`${connected} connected successfully`);
      // Clean up URL
      window.history.replaceState({}, "", "/integrations");
      connectionsQuery.refetch();
    }
    const error = searchParams.get("error");
    if (error) {
      toast.error(`Connection failed: ${error}`);
      window.history.replaceState({}, "", "/integrations");
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectionMap = new Map(
    (connectionsQuery.data?.items ?? []).map((c) => [c.provider, c]),
  );

  const connectedCount = connectionMap.size;

  function handleSync(provider: string) {
    setSyncingProvider(provider);
    syncMutation.mutate(
      { provider },
      {
        onSuccess: (data) => {
          if (data.error) {
            toast.error(`Sync failed: ${data.error}`);
          } else {
            toast.success(
              `Synced ${data.count} observation${data.count !== 1 ? "s" : ""} from ${provider}`,
            );
          }
          connectionsQuery.refetch();
        },
        onError: (err) => {
          toast.error(`Sync failed: ${err.message}`);
        },
        onSettled: () => {
          setSyncingProvider(null);
        },
      },
    );
  }

  function handleDisconnect(provider: string) {
    if (!confirm(`Disconnect ${provider}? You can reconnect later.`)) return;

    disconnectMutation.mutate(
      { provider },
      {
        onSuccess: () => {
          toast.success(`${provider} disconnected`);
          connectionsQuery.refetch();
        },
        onError: (err) => {
          toast.error(`Failed to disconnect: ${err.message}`);
        },
      },
    );
  }

  const filtered = integrationCatalog.filter((i) => {
    if (activeTab === "all") return true;
    if (activeTab === "connected") return connectionMap.has(i.id);
    return i.category === activeTab;
  });

  // Split into active (implemented) and coming soon, with connected first
  const activeIntegrations = filtered
    .filter((i) => implementedProviders.has(i.id))
    .sort((a, b) => {
      const aConnected = connectionMap.has(a.id);
      const bConnected = connectionMap.has(b.id);
      if (aConnected === bConnected) return 0;
      return aConnected ? -1 : 1;
    });

  const comingSoonIntegrations = filtered.filter(
    (i) => !implementedProviders.has(i.id),
  );

  return (
    <div>
      <TitleActionHeader
        title="Integrations"
        subtitle="Connect your devices, health platforms, and medical services"
      />

      <div className="mt-4 overflow-x-auto scrollbar-none -mx-3 px-3">
        <div className="pill-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pill-tab ${activeTab === tab.key ? "pill-tab-active" : ""}`}
            >
              {tab.label}
              {tab.key === "connected" && (
                <span className="ml-1.5 text-[11px] text-neutral-400">
                  {connectedCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeIntegrations.length > 0 && (
        <div
          className="stagger-children mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          key={`active-${activeTab}`}
        >
          {activeIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              connection={connectionMap.get(integration.id)}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
              isSyncing={syncingProvider === integration.id}
            />
          ))}
        </div>
      )}

      {comingSoonIntegrations.length > 0 && activeTab !== "connected" && (
        <>
          <h2 className="mt-10 mb-4 text-[13px] font-medium text-neutral-400 uppercase tracking-wider">
            Coming Soon
          </h2>
          <div
            className="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            key={`soon-${activeTab}`}
          >
            {comingSoonIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                connection={undefined}
                onSync={handleSync}
                onDisconnect={handleDisconnect}
                isSyncing={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
