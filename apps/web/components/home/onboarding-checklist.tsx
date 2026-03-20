'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Check,
  Circle,
  Maximize2,
  X,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

const STORAGE_KEY = 'openvitals:checklist-dismissed';

export interface ChecklistItem {
  label: string;
  description: string;
  href: string;
  completed: boolean;
  icon: LucideIcon;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
}

/* ─── Compact card (inline on home page) ─────────────────────────────────── */

function CompactChecklist({
  items,
  onExpand,
  onDismiss,
}: {
  items: ChecklistItem[];
  onExpand: () => void;
  onDismiss: () => void;
}) {
  const completed = items.filter((i) => i.completed).length;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[15px] font-semibold text-neutral-900 font-body">
            Getting Started
          </h2>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-mono font-medium text-neutral-500 tabular-nums">
            {completed}/{items.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onExpand}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
            aria-label="Expand checklist"
          >
            <Maximize2 className="size-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
            aria-label="Dismiss checklist"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Items */}
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            {item.completed ? (
              <div className="flex items-center gap-3 px-5 py-2.5 border-t border-neutral-100">
                <div className="flex size-5 items-center justify-center rounded-md bg-accent-50">
                  <Check className="size-3 text-accent-600" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] text-accent-600 font-medium font-body">
                  {item.label}
                </span>
                <Check
                  className="ml-auto size-4 text-accent-500"
                  strokeWidth={2}
                />
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-3 px-5 py-2.5 border-t border-neutral-100 transition-colors hover:bg-neutral-50 group"
              >
                <div className="flex size-5 items-center justify-center rounded-md bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                  <item.icon className="size-3 text-neutral-500" />
                </div>
                <span className="text-[13px] text-neutral-700 font-body">
                  {item.label}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Expanded overlay panel ─────────────────────────────────────────────── */

function ExpandedChecklist({
  items,
  onClose,
}: {
  items: ChecklistItem[];
  onClose: () => void;
}) {
  const completed = items.filter((i) => i.completed).length;

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel — slides in from right */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[520px] bg-white shadow-xl overflow-y-auto animate-in slide-in-from-right duration-250">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {/* Hero header */}
        <div className="px-8 pt-12 pb-6 text-center border-b border-neutral-100">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent-50 ring-1 ring-accent-100">
            <Check className="size-6 text-accent-600" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 font-body">
            Getting Started
          </h2>
          <p className="mt-1.5 text-[14px] text-neutral-500 font-body max-w-xs mx-auto">
            Set up OpenVitals to get the most out of your health data — {completed} of {items.length} complete.
          </p>
        </div>

        {/* Items */}
        <div className="px-6 py-4 space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  'rounded-xl border p-5 transition-colors',
                  item.completed
                    ? 'border-accent-200 bg-accent-50/50'
                    : 'border-neutral-200 bg-white',
                )}
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-white border border-neutral-200 mb-3 shadow-xs">
                  <Icon
                    className={cn(
                      'size-4',
                      item.completed ? 'text-accent-600' : 'text-neutral-500',
                    )}
                  />
                </div>
                <h3
                  className={cn(
                    'text-[14px] font-semibold font-body',
                    item.completed ? 'text-accent-700' : 'text-neutral-900',
                  )}
                >
                  {item.label}
                </h3>
                <p
                  className={cn(
                    'text-[13px] mt-0.5 font-body',
                    item.completed ? 'text-accent-600' : 'text-neutral-500',
                  )}
                >
                  {item.description}
                </p>

                <div className="mt-3">
                  {item.completed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-100 px-2.5 py-1 text-[12px] font-medium text-accent-700">
                      <Check className="size-3.5" strokeWidth={2.5} />
                      Done
                    </span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-neutral-800 transition-colors"
                      >
                        Get started
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-neutral-100 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */

export function OnboardingChecklist({ items }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const completedCount = items.filter((i) => i.completed).length;
  const allComplete = completedCount === items.length;

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  }, []);

  const handleClose = useCallback(() => {
    setExpanded(false);
  }, []);

  if (dismissed || allComplete) return null;

  return (
    <>
      <CompactChecklist
        items={items}
        onExpand={() => setExpanded(true)}
        onDismiss={handleDismiss}
      />
      {expanded && <ExpandedChecklist items={items} onClose={handleClose} />}
    </>
  );
}
