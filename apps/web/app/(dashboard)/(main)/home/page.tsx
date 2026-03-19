'use client';

import { trpc } from '@/lib/trpc/client';
import { useSession } from '@/lib/auth/client';
import { GreetingHeader } from '@/components/home/greeting-header';
import { OnboardingChecklist, type ChecklistItem } from '@/components/home/onboarding-checklist';
import { FeaturePreviewCard } from '@/components/home/feature-preview-card';
import {
  LabsPreviewContent,
  MedicationsPreviewContent,
  TimelinePreviewContent,
  UploadsPreviewContent,
  AIChatPreviewContent,
} from '@/components/home/feature-cards';
import { TestTubes, Pill, Clock, Upload, MessageSquare, ArrowUpCircle, Stethoscope, FlaskConical, ListChecks } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();
  const observations = trpc.observations.list.useQuery({ limit: 200 });
  const medications = trpc.medications.list.useQuery({});
  const importJobs = trpc.importJobs.list.useQuery({ limit: 20 });

  const isLoading = observations.isLoading || medications.isLoading || importJobs.isLoading;

  if (isLoading) {
    return (
      <div>
        <div className="h-20 animate-pulse rounded-xl bg-neutral-50" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-44 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50 ${i === 0 ? 'lg:col-span-2' : ''}`}
            />
          ))}
        </div>
      </div>
    );
  }

  const obsItems = observations.data?.items ?? [];
  const medItems = medications.data?.items ?? [];
  const jobItems = importJobs.data?.items ?? [];

  // Derive first name
  const fullName = session?.user?.name ?? '';
  const firstName = fullName.split(/\s+/)[0] ?? '';

  // Derive abnormal count
  const abnormalCount = obsItems.filter((o) => o.isAbnormal).length;

  // Derive unique metric count
  const metricCodes = new Set(obsItems.map((o) => o.metricCode));

  // Summary line
  const summaryLine = obsItems.length > 0
    ? `${metricCodes.size} metrics tracked across ${obsItems.length} results`
    : 'Upload your first lab report to get started';

  // Timeline event count (grouped by import job)
  const jobIds = new Set<string>();
  for (const obs of obsItems) {
    jobIds.add(obs.importJobId ?? obs.id);
  }
  const eventCount = jobIds.size + medItems.length;

  // Latest event for timeline preview
  const latestObs = obsItems[0];
  const latestEvent = latestObs
    ? {
        title: `Lab Results — ${obsItems.length} observations`,
        status: abnormalCount > 0 ? ('warning' as const) : ('normal' as const),
        label: abnormalCount > 0 ? `${abnormalCount} flagged` : 'All normal',
      }
    : null;

  // Onboarding checklist items
  const checklistItems: ChecklistItem[] = [
    { label: 'Upload a lab report', href: '/uploads', completed: jobItems.length > 0, icon: Upload },
    { label: 'Add a medication', href: '/medications', completed: medItems.length > 0, icon: Pill },
    { label: 'Ask AI a question', href: '/ai', completed: false, icon: MessageSquare },
    { label: 'Review your biomarkers', href: '/biomarkers', completed: obsItems.length > 0, icon: ListChecks },
  ];

  return (
    <div className="stagger-children">
      <GreetingHeader
        firstName={firstName}
        summaryLine={summaryLine}
        abnormalCount={abnormalCount}
      />

      {/* Onboarding checklist */}
      <div className="mt-6">
        <OnboardingChecklist items={checklistItems} />
      </div>

      {/* Feature cards grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeaturePreviewCard
          title="Lab Results"
          href="/labs"
          icon={TestTubes}
          className="lg:col-span-2"
        >
          <LabsPreviewContent items={obsItems} />
        </FeaturePreviewCard>

        <FeaturePreviewCard title="Medications" href="/medications" icon={Pill}>
          <MedicationsPreviewContent items={medItems} />
        </FeaturePreviewCard>

        <FeaturePreviewCard title="Timeline" href="/timeline" icon={Clock}>
          <TimelinePreviewContent eventCount={eventCount} latestEvent={latestEvent} />
        </FeaturePreviewCard>

        <FeaturePreviewCard title="Uploads" href="/uploads" icon={Upload}>
          <UploadsPreviewContent items={jobItems} />
        </FeaturePreviewCard>

        <FeaturePreviewCard title="AI Chat" href="/ai" icon={MessageSquare}>
          <AIChatPreviewContent />
        </FeaturePreviewCard>
      </div>
    </div>
  );
}
