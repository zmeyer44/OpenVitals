'use client';

import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-900 group-[.toaster]:border-neutral-200',
          description: 'group-[.toast]:text-neutral-500',
          actionButton: 'group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50',
          cancelButton: 'group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500',
          success: 'group-[.toaster]:border-green-200 group-[.toaster]:bg-green-50',
          error: 'group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50',
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
