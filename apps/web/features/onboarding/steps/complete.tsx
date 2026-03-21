'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface CompleteStepProps {
  completedSections: string[];
  totalSections: number;
  onComplete: () => void;
}

export function CompleteStep({ completedSections, totalSections, onComplete }: CompleteStepProps) {
  const pct = Math.round((completedSections.length / totalSections) * 100);

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-md text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
          className="mx-auto mb-8 flex size-16 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}
        >
          <Check className="size-7 text-white" strokeWidth={2.5} />
        </motion.div>

        <h1
          className="text-[28px] font-medium tracking-[-0.025em] text-neutral-900 leading-[1.2] font-display"
        >
          You&apos;re all set
        </h1>

        <p
          className="mt-3 text-[15px] leading-[1.65] text-neutral-500 font-body"
        >
          Your health profile is {pct}% complete. You can fill in the rest anytime from Settings.
        </p>

        {/* Completion bar */}
        <div className="mx-auto mt-6 max-w-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-neutral-400 font-mono">Profile completion</span>
            <span className="text-[11px] font-semibold text-accent-600 font-mono">{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent-500"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>

        {/* Completed sections */}
        {completedSections.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {completedSections.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-accent-50 border border-accent-200 px-2.5 py-1 text-[11px] font-medium text-accent-700 font-mono"
              >
                <Check className="size-2.5" /> {s}
              </span>
            ))}
          </div>
        )}

        {/* Next actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-10 space-y-3"
        >
          <button
            onClick={onComplete}
            className="block w-full bg-neutral-900 px-8 py-2.5 text-[14px] font-medium text-white hover:bg-neutral-800 transition-all active:scale-[0.98] font-body cursor-pointer"
          >
            Go to your dashboard
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
