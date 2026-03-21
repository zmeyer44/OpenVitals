import { cn } from "@/lib/utils";

export type HealthStatus =
  | "normal"
  | "warning"
  | "critical"
  | "info"
  | "neutral";

interface StatusBadgeProps {
  status: HealthStatus;
  label: string;
  className?: string;
}

const statusStyles: Record<
  HealthStatus,
  { text: string; border: string; dot: string }
> = {
  normal: {
    text: "text-[var(--color-health-normal)]",
    border: "border-[var(--color-health-normal)]",
    dot: "bg-[var(--color-health-normal)]",
  },
  warning: {
    text: "text-[var(--color-health-warning)]",
    border: "border-[var(--color-health-warning)]",
    dot: "bg-[var(--color-health-warning)]",
  },
  critical: {
    text: "text-[var(--color-health-critical)]",
    border: "border-[var(--color-health-critical)]",
    dot: "bg-[var(--color-health-critical)]",
  },
  info: {
    text: "text-[var(--color-health-info)]",
    border: "border-[var(--color-health-info)]",
    dot: "bg-[var(--color-health-info)]",
  },
  neutral: {
    text: "text-neutral-600",
    border: "border-neutral-300",
    dot: "bg-neutral-400",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const s = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center min-w-0 gap-[4px] border px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.04em] truncate",
        s.text,
        s.border,
        className,
      )}
    >
      <span className={cn("size-[5px] shrink-0", s.dot)} />
      {label}
    </span>
  );
}
