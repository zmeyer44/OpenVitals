'use client';

import { Group, Panel, Separator } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      className={cn('flex h-full w-full', className)}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & { withHandle?: boolean }) {
  return (
    <Separator
      className={cn(
        'relative flex w-px items-center justify-center bg-neutral-200 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 hover:bg-accent-300 data-[resize-handle-active]:bg-accent-500 transition-colors',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-3 items-center justify-center border border-neutral-300 bg-white">
          <svg width="4" height="10" viewBox="0 0 4 10" fill="none">
            <circle cx="1" cy="2" r="0.75" fill="#999" />
            <circle cx="3" cy="2" r="0.75" fill="#999" />
            <circle cx="1" cy="5" r="0.75" fill="#999" />
            <circle cx="3" cy="5" r="0.75" fill="#999" />
            <circle cx="1" cy="8" r="0.75" fill="#999" />
            <circle cx="3" cy="8" r="0.75" fill="#999" />
          </svg>
        </div>
      )}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
