'use client';

import { StatusBadge } from '@/components/health/status-badge';
import { formatDate } from '@/lib/utils';

interface GreetingHeaderProps {
  firstName: string;
  summaryLine: string;
  abnormalCount: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function GreetingHeader({ firstName, summaryLine, abnormalCount }: GreetingHeaderProps) {
  const greeting = getGreeting();
  const displayName = firstName ? `, ${firstName}` : '';

  return (
    <div>
      <h1 className="font-display text-[28px] md:text-[34px] font-medium tracking-[-0.03em] text-neutral-900">
        {greeting}{displayName}
      </h1>
      <div className="mt-2 flex items-center gap-3">
        <p className="text-[14px] text-neutral-500 font-body">{summaryLine}</p>
        {abnormalCount > 0 && (
          <StatusBadge status="warning" label={`${abnormalCount} flagged`} />
        )}
      </div>
      <p className="mt-1 text-[11px] text-neutral-400 font-mono">{formatDate(new Date())}</p>
    </div>
  );
}
