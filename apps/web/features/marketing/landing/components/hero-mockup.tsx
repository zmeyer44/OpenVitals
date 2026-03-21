import { cn } from "@/lib/utils";
import { Spark } from "./spark";

const cards = [
  { label: "LDL Cholesterol", val: "98", unit: "mg/dL", delta: "↓ 14", color: "#16A34A", d: [142, 130, 118, 98] },
  { label: "HbA1c", val: "5.9", unit: "%", delta: "↑ 0.3", color: "#D97706", d: [5.2, 5.4, 5.6, 5.9] },
  { label: "Ferritin", val: "14", unit: "ng/mL", delta: "↓ 8", color: "#DC2626", d: [45, 32, 18, 14] },
  { label: "Vitamin D", val: "22", unit: "ng/mL", delta: "↓ 6", color: "#DC2626", d: [42, 35, 28, 22] },
];

const cardBorders = [
  "border-r border-b border-neutral-200 md:border-b-0",
  "border-b border-neutral-200 md:border-b-0 md:border-r",
  "border-r border-neutral-200",
  "",
];

const rows = [
  { metric: "LDL Cholesterol", val: "98", unit: "mg/dL", range: "0–100", st: "normal" as const, trend: [142, 130, 125, 118, 112, 98] },
  { metric: "HDL Cholesterol", val: "58", unit: "mg/dL", range: "> 40", st: "normal" as const, trend: [52, 54, 55, 56, 57, 58] },
  { metric: "Triglycerides", val: "162", unit: "mg/dL", range: "< 150", st: "warning" as const, trend: [128, 135, 142, 148, 155, 162] },
  { metric: "HbA1c", val: "5.9", unit: "%", range: "< 5.7", st: "warning" as const, trend: [5.2, 5.3, 5.4, 5.5, 5.6, 5.9] },
  { metric: "Ferritin", val: "14", unit: "ng/mL", range: "20–300", st: "critical" as const, trend: [45, 38, 32, 25, 18, 14] },
];

const sc: Record<string, string> = { normal: "#16A34A", warning: "#D97706", critical: "#DC2626" };
const sl: Record<string, string> = { normal: "NORMAL", warning: "BORDER", critical: "LOW" };

export function HeroMockup() {
  return (
    <div className="bg-white">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {cards.map((c, i) => (
          <div key={c.label} className={cn("p-4", cardBorders[i])}>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
              {c.label}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-[24px] font-bold tracking-[-0.02em] text-neutral-900">
                {c.val}
              </span>
              <span className="font-mono text-[10px] text-neutral-400">
                {c.unit}
              </span>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span
                className="font-mono text-[10px] font-bold"
                style={{ color: c.color }}
              >
                {c.delta}
              </span>
              <Spark data={c.d} color={c.color} w={60} h={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Heavy divider */}
      <div className="border-t-2 border-neutral-900" />

      {/* Table header */}
      <div className="hidden md:grid grid-cols-[1.6fr_0.9fr_1fr_0.7fr_0.8fr] gap-2 border-b-2 border-neutral-900 bg-neutral-50 px-4 py-2">
        {["METRIC", "VALUE", "REFERENCE", "STATUS", "TREND"].map((h) => (
          <div
            key={h}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Table rows */}
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Mobile header */}
          <div className="grid grid-cols-[1.6fr_0.9fr_1fr_0.7fr_0.8fr] gap-2 border-b-2 border-neutral-900 bg-neutral-50 px-4 py-2 md:hidden">
            {["METRIC", "VALUE", "REFERENCE", "STATUS", "TREND"].map((h) => (
              <div
                key={h}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400"
              >
                {h}
              </div>
            ))}
          </div>
          {rows.map((r, i) => (
            <div
              key={r.metric}
              className={cn(
                "grid grid-cols-[1.6fr_0.9fr_1fr_0.7fr_0.8fr] items-center gap-2 px-4 py-3",
                i < rows.length - 1 && "border-b border-neutral-200",
              )}
            >
              <div className="font-body text-[12px] font-medium text-neutral-800">
                {r.metric}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span
                  className="font-mono text-[13px] font-bold tabular-nums"
                  style={{
                    color: r.st === "normal" ? "#141414" : sc[r.st],
                  }}
                >
                  {r.val}
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  {r.unit}
                </span>
              </div>
              <div className="font-mono text-[10px] text-neutral-400">
                {r.range}
              </div>
              <span
                className="inline-flex w-fit items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em]"
                style={{
                  border: `1px solid ${sc[r.st]}`,
                  color: sc[r.st],
                }}
              >
                <span
                  className="size-[5px]"
                  style={{ backgroundColor: sc[r.st] }}
                />
                {sl[r.st]}
              </span>
              <div className="flex justify-end">
                <Spark data={r.trend} color={sc[r.st]!} w={60} h={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
