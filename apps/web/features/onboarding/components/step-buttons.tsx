'use client';

import { cn } from '@/lib/utils';

interface StepButtonsProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
}

export function StepButtons({
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continue',
  nextDisabled = false,
  showBack = true,
  showSkip = false,
}: StepButtonsProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div>
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer font-body"
          >
            ← Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer font-body"
          >
            Skip for now
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={cn(
            'px-5 py-2 text-[13px] font-medium transition-all active:scale-[0.98] cursor-pointer',
            nextDisabled
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              : 'bg-neutral-900 text-white hover:bg-neutral-800'
          )}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
