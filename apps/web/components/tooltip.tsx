'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { type ReactNode, useState } from 'react';

export interface TooltipProps
  extends Omit<TooltipPrimitive.TooltipContentProps, 'content'> {
  content:
    | ReactNode
    | string
    | ((props: { setOpen: (open: boolean) => void }) => ReactNode);
  contentClassName?: string;
  disabled?: boolean;
  disableHoverableContent?: TooltipPrimitive.TooltipProps['disableHoverableContent'];
  delayDuration?: TooltipPrimitive.TooltipProps['delayDuration'];
}

export function Tooltip({
  children,
  content,
  contentClassName,
  disabled,
  side = 'top',
  disableHoverableContent,
  delayDuration = 0,
  ...rest
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipPrimitive.Root
      open={disabled ? false : open}
      onOpenChange={setOpen}
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <TooltipPrimitive.Trigger
        asChild
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={8}
          side={side}
          className="animate-scale-in pointer-events-auto z-[99] items-center overflow-hidden border border-neutral-200 bg-white"
          collisionPadding={0}
          {...rest}
        >
          {typeof content === 'string' ? (
            <span
              className={cn(
                'block max-w-xs text-pretty px-3 py-1.5 text-center text-sm text-neutral-700',
                contentClassName,
              )}
            >
              {content}
            </span>
          ) : typeof content === 'function' ? (
            content({ setOpen })
          ) : (
            content
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export function InfoTooltip(props: Omit<TooltipProps, 'children'>) {
  return (
    <Tooltip {...props}>
      <HelpCircle className="h-4 w-4 text-muted-foreground" />
    </Tooltip>
  );
}
