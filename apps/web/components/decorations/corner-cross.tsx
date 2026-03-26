import { cn } from "@/lib/utils";
import { ReactNode } from "react";
export function CornerCross({ className }: { className?: string }) {
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

type Location = "tl" | "tr" | "bl" | "br" | "*";

export function CornerEdge({
  location = "*",
  length = 6,
  width = 1.5,
  className,
}: {
  location?: Location;
  length?: number;
  width?: number;
  className?: string;
}) {
  if (location === "tl") {
    return (
      <>
        <span
          style={{
            height: width,
            width: length,
            position: "absolute",
            top: 0,
            left: 0,
          }}
          className={cn("bg-accent-500", className)}
        />
        <span
          style={{
            height: length,
            width: width,
            position: "absolute",
            top: 0,
            left: 0,
          }}
          className={cn("bg-accent-500", className)}
        />
      </>
    );
  }
  if (location === "tr") {
    return (
      <>
        <span
          style={{
            height: width,
            width: length,
            position: "absolute",
            top: 0,
            right: 0,
          }}
          className={cn("bg-accent-500", className)}
        />
        <span
          style={{
            height: length,
            width: width,
            position: "absolute",
            top: 0,
            right: 0,
          }}
          className={cn("bg-accent-500", className)}
        />
      </>
    );
  }
  if (location === "bl") {
    return (
      <>
        <span
          style={{
            height: width,
            width: length,
            position: "absolute",
            bottom: 0,
            left: 0,
          }}
          className={cn("bg-accent-500", className)}
        />
        <span
          style={{
            height: length,
            width: width,
            position: "absolute",
            bottom: 0,
            left: 0,
          }}
          className={cn("bg-accent-500", className)}
        />
      </>
    );
  }
  if (location === "br") {
    return (
      <>
        <span
          style={{
            height: width,
            width: length,
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
          className={cn("bg-accent-500", className)}
        />
        <span
          style={{
            height: length,
            width: width,
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
          className={cn("bg-accent-500", className)}
        />
      </>
    );
  }

  return (["tl", "tr", "bl", "br"] as const).map((s) => (
    <CornerEdge location={s} />
  ));
}
export function CornerCrosses({
  cornerCrossClassName,
}: {
  cornerCrossClassName?: string;
}) {
  return (
    <>
      <span className="border-accent-500/60 bg-accent-500/10 absolute inset-0 border border-dashed" />
      <CornerCross
        className={cn("top-[-2px] left-[-2px]", cornerCrossClassName)}
      />
      <CornerCross
        className={cn("top-[-2px] right-[-2px]", cornerCrossClassName)}
      />
      <CornerCross
        className={cn("bottom-[-2px] left-[-2px]", cornerCrossClassName)}
      />
      <CornerCross
        className={cn("bottom-[-2px] right-[-2px]", cornerCrossClassName)}
      />
    </>
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
