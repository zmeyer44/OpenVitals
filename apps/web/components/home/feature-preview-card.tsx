import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface FeaturePreviewCardProps {
  title: string;
  href: string;
  icon: LucideIcon;
  className?: string;
  children: React.ReactNode;
}

export function FeaturePreviewCard({ title, href, icon: Icon, className, children }: FeaturePreviewCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'block rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-accent-300 hover:shadow-[0_2px_12px_var(--color-accent-50)]',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-neutral-400" />
          <h3 className="text-[13px] font-semibold text-neutral-900 font-body">{title}</h3>
        </div>
        <ChevronRight className="size-4 text-neutral-300" />
      </div>
      <div className="mt-3">{children}</div>
    </Link>
  );
}
