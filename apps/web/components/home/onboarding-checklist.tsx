'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Check, Circle, X, type LucideIcon } from 'lucide-react';

const STORAGE_KEY = 'openvitals:checklist-dismissed';

export interface ChecklistItem {
  label: string;
  href: string;
  completed: boolean;
  icon: LucideIcon;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
}

export function OnboardingChecklist({ items }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const completedCount = items.filter((i) => i.completed).length;
  const allComplete = completedCount === items.length;

  if (dismissed || allComplete) return null;

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  }

  const progressPercent = (completedCount / items.length) * 100;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-neutral-900 font-body">
            Get started
          </h2>
          <p className="mt-0.5 text-[13px] text-neutral-500 font-body">
            {completedCount} of {items.length} complete
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mt-3">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Checklist items */}
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            {item.completed ? (
              <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                <Check className="size-4 text-[var(--color-health-normal)]" />
                <span className="text-[13px] text-neutral-400 line-through font-body">
                  {item.label}
                </span>
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50"
              >
                <Circle className="size-4 text-neutral-300" />
                <span className="text-[13px] text-neutral-700 font-body">
                  {item.label}
                </span>
                <item.icon className="ml-auto size-3.5 text-neutral-400" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
