'use client';

import { motion } from 'motion/react';
import { Logo } from '@/assets/app/images/logo';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-md text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #fbf9f9, #faf9f7)' }}
        >
          <Logo className="size-7 text-accent-500" />
        </motion.div>

        <h1
          className="text-[28px] font-medium tracking-[-0.025em] text-neutral-900 leading-[1.2] font-display"
        >
          Let&apos;s set up your
          <br />
          health profile
        </h1>

        <p
          className="mt-4 text-[15px] leading-[1.65] text-neutral-500 font-body"
        >
          We&apos;ll ask a few questions to personalize your experience. Most steps are optional — you can always come back later.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 inline-flex items-center gap-2 text-[11px] text-neutral-400 font-mono"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          About 3–5 minutes
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-10"
        >
          <button
            onClick={onNext}
            className="bg-neutral-900 px-8 py-2.5 text-[14px] font-medium text-white hover:bg-neutral-800 transition-all active:scale-[0.98] cursor-pointer font-body"
          >
            Get started
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
