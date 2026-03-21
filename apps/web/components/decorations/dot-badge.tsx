import { cn } from "@/lib/utils";
import { ReactNode } from "react";
export function DotBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="size-[7px] rounded-full bg-accent-500" />
      <span className="whitespace-nowrap text-foreground text-pretty font-mono text-[12px] leading-[100%] tracking-[-0.015rem] uppercase">
        {children}
      </span>
    </div>
  );
}
export function DashBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="h-[15px] w-[3px] bg-accent-500" />
      <span className="whitespace-nowrap text-inherit text-pretty font-mono text-[12px] leading-[100%] tracking-[-0.015rem] uppercase">
        {children}
      </span>
    </div>
  );
}
