import { cn } from '@/lib/utils';

interface ProvenancePillProps {
  label: string;
  icon: string;
  className?: string;
}

export function ProvenancePill({ label, icon, className }: ProvenancePillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] whitespace-nowrap border px-2.5 py-1 font-mono text-[10px] tracking-[0.02em] text-neutral-600',
        'bg-neutral-50 border-neutral-200',
        className
      )}
    >
      <span className="text-xs leading-none">{icon}</span>
      {label}
    </span>
  );
}
