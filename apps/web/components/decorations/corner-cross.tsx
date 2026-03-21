import { cn } from "@/lib/utils";
import { ReactNode } from "react";
export function CornerCross({ className }: { className: string }) {
  return (
    <svg
      width="5"
      height="5"
      viewBox="0 0 5 5"
      className={cn("fill-accent-500/60 absolute", className)}
    >
      <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z" />
    </svg>
  );
}

export function CornerCrossBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-accent-500 text-sm/6 relative px-1.5 text-left font-normal",
        className,
      )}
    >
      <span className="border-accent-500/60 bg-accent-500/10 absolute inset-0 border border-dashed" />
      <CornerCross className="top-[-2px] left-[-2px]" />
      <CornerCross className="top-[-2px] right-[-2px]" />
      <CornerCross className="bottom-[-2px] left-[-2px]" />
      <CornerCross className="right-[-2px] bottom-[-2px]" />
      <span className="relative">{children}</span>
    </div>
  );
}
