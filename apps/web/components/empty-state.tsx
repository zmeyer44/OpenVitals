import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <span className="mb-4 text-4xl">{icon}</span>
      <h3 className="text-base font-semibold text-neutral-900 font-display">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-neutral-500 font-display">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
