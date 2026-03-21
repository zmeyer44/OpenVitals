"use client";

import type React from 'react';
import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/tooltip';
import {
  Button as ButtonPrimitive,
  buttonVariants,
} from '@/components/ui/button';

const iconButtonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          'bg-neutral-900 text-white hover:bg-neutral-800',
        outline:
          'border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700',
        secondary:
          'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        ghost:
          'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border-transparent',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90',
      },
      size: {
        xs: 'h-7 w-7 p-1',
        sm: 'h-8 w-8 gap-2',
        default: 'h-9 w-9 gap-2',
        lg: 'h-10 w-10 gap-2',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  },
);

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    text?: ReactNode | string;
    textWrapperClassName?: string;
    loading?: boolean;
    icon?: ReactNode;
    shortcut?: string;
    right?: ReactNode;
    disabledTooltip?: string | ReactNode;
    tooltip?: string | ReactNode;
    children?: never;
  };

function Button({
  className,
  variant,
  size,
  text,
  textWrapperClassName,
  loading,
  icon,
  shortcut,
  disabledTooltip,
  tooltip,
  right,
  ...props
}: ButtonProps) {
  const button = (
    <button
      type={props.onClick ? 'button' : 'submit'}
      className={cn(
        'group flex items-center justify-center whitespace-nowrap',
        buttonVariants({ variant, size }),
        (props.disabled || loading) &&
          'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : icon ? icon : null}
      {text && (
        <span
          className={cn(
            'min-w-0 truncate font-medium',
            textWrapperClassName,
          )}
        >
          {text}
        </span>
      )}
      {shortcut && (
        <kbd className="shrink-0 hidden border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-light text-neutral-400 md:inline-block">
          {shortcut}
        </kbd>
      )}
      {right}
    </button>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  if (props.disabled && disabledTooltip) {
    return (
      <Tooltip content={disabledTooltip}>
        <span className="cursor-not-allowed">{button}</span>
      </Tooltip>
    );
  }

  return button;
}

export type IconButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof iconButtonVariants> & {
    icon?: ReactNode;
    loading?: boolean;
    disabledTooltip?: string | ReactNode;
    tooltip?: string | ReactNode;
  };

function IconButton({
  className,
  variant,
  size,
  icon,
  loading,
  disabledTooltip,
  tooltip,
  ...props
}: IconButtonProps) {
  const button = (
    <button
      type={props.onClick ? 'button' : 'submit'}
      className={cn(
        iconButtonVariants({ variant, size }),
        (props.disabled || loading) &&
          'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : icon}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip
        content={tooltip}
        delayDuration={200}
        contentClassName="px-2 py-1"
      >
        {button}
      </Tooltip>
    );
  }

  if (props.disabled && disabledTooltip) {
    return (
      <Tooltip content={disabledTooltip}>
        <span className="cursor-not-allowed">{button}</span>
      </Tooltip>
    );
  }

  return button;
}

export {
  Button,
  IconButton,
  ButtonPrimitive,
  buttonVariants,
  iconButtonVariants,
};
