import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full border border-neutral-200 bg-white px-3 py-2 text-[13px]',
          'ring-offset-white placeholder:text-neutral-400',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-300 focus-visible:bg-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
