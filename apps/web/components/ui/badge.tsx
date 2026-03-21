import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-neutral-900 text-white',
        secondary: 'border-transparent bg-neutral-100 text-neutral-700',
        outline: 'border-neutral-200 text-neutral-700',
        normal: 'bg-[var(--color-health-normal-bg)] text-[var(--color-health-normal)] border-[var(--color-health-normal-border)]',
        warning: 'bg-[var(--color-health-warning-bg)] text-[var(--color-health-warning)] border-[var(--color-health-warning-border)]',
        critical: 'bg-[var(--color-health-critical-bg)] text-[var(--color-health-critical)] border-[var(--color-health-critical-border)]',
        info: 'bg-[var(--color-health-info-bg)] text-[var(--color-health-info)] border-[var(--color-health-info-border)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
