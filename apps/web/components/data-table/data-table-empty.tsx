import { type ReactNode } from 'react';

interface DataTableEmptyProps {
  children?: ReactNode;
}

export function DataTableEmpty({ children }: DataTableEmptyProps) {
  return (
    <div className="flex items-center justify-center px-5 py-12 text-sm text-neutral-400">
      {children ?? 'No results found.'}
    </div>
  );
}
