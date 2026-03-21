'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import { LayoutGridIcon, type LucideIcon } from 'lucide-react';

export type Icon = LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
export type IconType = Icon;

export function AnimatedEmptyState({
  title,
  description,
  cardContent = ({ icon: Icon }: { index: number; icon: IconType }) => (
    <>
      <div className="flex size-7 items-center justify-center border border-neutral-200 bg-white">
        <Icon className="size-4 text-neutral-400" />
      </div>
      <div className="h-2.5 w-28 min-w-0 bg-neutral-100" />
    </>
  ),
  cardIcon = () => LayoutGridIcon,
  addButton,
  learnMoreHref,
  learnMoreClassName,
  className,
}: {
  title: string;
  description?: string;
  cardContent?: ReactNode | (({ index, icon }: { index: number; icon: IconType }) => ReactNode);
  cardIcon?: ({ index }: { index: number }) => IconType;
  addButton?: ReactNode;
  learnMoreHref?: string;
  learnMoreClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 border border-neutral-200 bg-white px-4 py-10 md:min-h-[420px]',
        className,
      )}
    >
      <div className="h-36 w-full max-w-64 animate-fade-in overflow-hidden px-4 [mask-image:linear-gradient(transparent,black_10%,black_90%,transparent)]">
        <div
          style={{ '--scroll': '-50%' } as CSSProperties}
          className="flex animate-infinite-scroll-y flex-col [animation-duration:10s]"
        >
          {[...Array(6)].map((_, idx) => (
            <Card key={idx}>
              {typeof cardContent === 'function'
                ? cardContent({
                    index: idx,
                    icon: cardIcon({ index: idx }),
                  })
                : cardContent}
            </Card>
          ))}
        </div>
      </div>
      <div className="max-w-xs text-pretty text-center">
        <span className="text-lg font-medium text-neutral-900 font-display">{title}</span>
        {!!description && (
          <p className="mt-2 text-pretty text-sm text-neutral-500 font-display">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {addButton}
        {learnMoreHref && (
          <Link
            href={learnMoreHref}
            className={cn(
              'border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors',
              learnMoreClassName,
            )}
          >
            Learn more
          </Link>
        )}
      </div>
    </div>
  );
}

function Card({ children }: PropsWithChildren) {
  return (
    <div className="mt-4 flex items-center gap-3 border border-neutral-200 bg-white p-4">
      {children}
    </div>
  );
}
