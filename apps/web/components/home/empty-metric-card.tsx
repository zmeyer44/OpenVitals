import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyMetricCardProps {
  metricCode: string;
  name: string;
  reason: string;
}

export function EmptyMetricCard({
  metricCode,
  name,
  reason,
}: EmptyMetricCardProps) {
  return (
    <Link
      href={`/labs/${metricCode}`}
      className={cn(
        "card flex flex-col gap-2 p-4 min-w-0 border-dashed",
        "hover:border-accent-200 transition-all cursor-pointer",
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="size-[6px] shrink-0 rounded-full bg-neutral-200" />
        <span className="text-[12px] font-medium tracking-[0.02em] text-neutral-400 font-display truncate uppercase">
          {name}
        </span>
      </div>
      <span className="text-[14px] font-medium text-neutral-300 font-display">
        No data yet
      </span>
      <span className="text-[10px] text-neutral-400 font-mono truncate">
        {reason}
      </span>
    </Link>
  );
}
