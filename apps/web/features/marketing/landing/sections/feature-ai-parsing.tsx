import { cn } from "@/lib/utils";
import { Spark } from "../components/spark";

/* ------------------------------------------------------------------ */
/*  Parsed results data                                                */
/* ------------------------------------------------------------------ */

const parsedRows = [
  { metric: "LDL Cholesterol", val: "98", unit: "mg/dL", ref: "0–100", st: "NORMAL", c: "#16A34A", trend: [142, 130, 118, 98] },
  { metric: "HDL Cholesterol", val: "58", unit: "mg/dL", ref: "> 40", st: "NORMAL", c: "#16A34A", trend: [52, 54, 56, 58] },
  { metric: "Triglycerides", val: "162", unit: "mg/dL", ref: "< 150", st: "BORDER", c: "#D97706", trend: [135, 142, 155, 162] },
  { metric: "HbA1c", val: "5.9", unit: "%", ref: "< 5.7", st: "BORDER", c: "#D97706", trend: [5.2, 5.4, 5.6, 5.9] },
  { metric: "Ferritin", val: "14", unit: "ng/mL", ref: "20–300", st: "LOW", c: "#DC2626", trend: [45, 32, 18, 14] },
  { metric: "Vitamin D", val: "22", unit: "ng/mL", ref: "30–100", st: "LOW", c: "#DC2626", trend: [42, 35, 28, 22] },
  { metric: "TSH", val: "2.1", unit: "mU/L", ref: "0.4–4.0", st: "NORMAL", c: "#16A34A", trend: [1.8, 1.9, 2.0, 2.1] },
  { metric: "Glucose", val: "92", unit: "mg/dL", ref: "70–100", st: "NORMAL", c: "#16A34A", trend: [88, 90, 91, 92] },
];

const navItems = [
  { num: "01", label: "LAB REPORTS", active: true },
  { num: "02", label: "WEARABLES", active: false },
  { num: "03", label: "ENCOUNTER NOTES", active: false },
];

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function Ingestion() {
  return (
    <section className="border-t border-neutral-200">
      {/* Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ── Left side ── */}
        <div className="lg:ml-auto lg:max-w-[640px] w-full px-6 md:px-10 py-14 lg:py-20">
          {/* Section label */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="size-[7px] rounded-full bg-accent-500" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-900">
              Ingestion
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-[32px] md:text-[40px] font-medium tracking-[-0.03em] leading-[1.1] text-neutral-900">
            Drop your lab report.
            <br />
            See what it means in seconds.
          </h2>

          {/* Body */}
          <p className="mt-5 font-mono text-[14px] text-neutral-400 leading-[1.65] max-w-[440px]">
            The pipeline classifies, extracts, normalizes,
            and maps to standard codes. You review anything
            that&apos;s uncertain.
          </p>

          {/* ── Card ── */}
          <div className="mt-10 border border-neutral-200 bg-white">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
              <div className="size-[7px] rounded-full bg-accent-500" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                01 – Lab Report
              </span>
            </div>

            {/* File status */}
            <div className="px-5 py-4 border-b border-neutral-100">
              <div className="border border-neutral-200 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-[13px] font-medium text-neutral-800 truncate">
                      quest_labs_mar2026.pdf
                    </div>
                    <div className="font-mono text-[10px] text-neutral-400 mt-0.5">
                      Lab report · Quest Diagnostics
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-[3px] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] border border-[#16A34A] text-[#16A34A] shrink-0">
                    <span className="size-[4px] bg-[#16A34A]" />
                    DONE
                  </span>
                </div>
                {/* Metrics row */}
                <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
                  <div>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                      CONFIDENCE
                    </div>
                    <div className="font-mono text-[16px] font-bold text-neutral-900 mt-0.5">
                      0.96
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                      RECORDS
                    </div>
                    <div className="font-mono text-[16px] font-bold text-accent-600 mt-0.5">
                      18
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                      PARSER
                    </div>
                    <div className="font-mono text-[11px] font-bold text-neutral-600 mt-1.5">
                      lab-pdf v2.1
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card body */}
            <div className="px-5 py-5">
              <h3 className="font-display text-[18px] font-medium text-neutral-900">
                AI-powered parsing
              </h3>
              <p className="mt-2 font-display text-[14px] text-neutral-500 leading-[1.6]">
                Upload any lab report PDF. AI classifies the document,
                extracts every value, normalizes units, and maps to
                standard medical codes — with confidence scores on
                every extraction.
              </p>
              <a
                href="/register"
                className="mt-5 inline-flex items-center bg-neutral-900 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-white hover:bg-neutral-800 transition-colors"
              >
                Learn more →
              </a>
            </div>
          </div>
        </div>

        {/* ── Right side ── */}
        <div className="relative lg:border-l border-neutral-200 bg-[#f2f2f0] overflow-hidden hidden lg:block">
          <div className="px-10 py-14">
            {/* Corner labels */}
            <div className="flex items-center justify-between mb-8">
              <div className="size-[7px] rounded-full bg-accent-500" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-400">
                Lab Report
              </span>
            </div>

            {/* Floating window — parsed results */}
            <div
              className="bg-white border border-neutral-200"
              style={{
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-neutral-100">
                <div className="size-[6px] rounded-full bg-neutral-300" />
                <div className="size-[6px] rounded-full bg-neutral-300" />
                <div className="size-[6px] rounded-full bg-neutral-300" />
                <span className="flex-1 text-center font-mono text-[10px] text-neutral-400">
                  quest_labs_mar2026.pdf — parsed results
                </span>
                {/* Spacer to balance dots */}
                <div className="w-[38px]" />
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.6fr_0.5fr] gap-2 px-4 py-2 border-b border-neutral-200 bg-neutral-50/60">
                {["METRIC", "VALUE", "REFERENCE", "STATUS", "TREND"].map(
                  (h) => (
                    <div
                      key={h}
                      className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-neutral-400"
                    >
                      {h}
                    </div>
                  ),
                )}
              </div>

              {/* Rows */}
              {parsedRows.map((r, i) => (
                <div
                  key={r.metric}
                  className={cn(
                    "grid grid-cols-[1.5fr_1fr_0.8fr_0.6fr_0.5fr] items-center gap-2 px-4 py-2",
                    i < parsedRows.length - 1 && "border-b border-neutral-100",
                  )}
                >
                  <div className="font-display text-[10px] font-medium text-neutral-700 truncate">
                    {r.metric}
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className="font-mono text-[10px] font-bold tabular-nums"
                      style={{
                        color: r.st === "NORMAL" ? "#141414" : r.c,
                      }}
                    >
                      {r.val}
                    </span>
                    <span className="font-mono text-[8px] text-neutral-400">
                      {r.unit}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-neutral-400">
                    {r.ref}
                  </div>
                  <span
                    className="inline-flex w-fit items-center gap-[3px] px-1 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.04em]"
                    style={{ border: `1px solid ${r.c}`, color: r.c }}
                  >
                    <span
                      className="size-[4px]"
                      style={{ backgroundColor: r.c }}
                    />
                    {r.st}
                  </span>
                  <div className="flex justify-end">
                    <Spark data={r.trend} color={r.c} w={40} h={12} />
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative elements */}
            {[
              "top-[60px] right-[30px]",
              "top-[200px] right-[20px]",
              "bottom-[80px] right-[50px]",
              "bottom-[160px] left-[30px]",
            ].map((pos, i) => (
              <span
                key={i}
                className={cn(
                  "absolute text-neutral-300/50 font-light select-none pointer-events-none text-[16px]",
                  pos,
                )}
              >
                +
              </span>
            ))}
            {[
              "top-[130px] right-[60px]",
              "bottom-[120px] left-[50px]",
            ].map((pos, i) => (
              <div
                key={i}
                className={cn(
                  "absolute size-[5px] rounded-full bg-neutral-300/40 pointer-events-none",
                  pos,
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom navigation strip ── */}
      <div className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5 md:gap-8">
            {navItems.map((item) => (
              <span
                key={item.num}
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.06em]",
                  item.active
                    ? "font-bold text-accent-500"
                    : "text-neutral-400",
                )}
              >
                {item.num} {item.label}
              </span>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-8">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-900">
              Lab Report
            </span>
            <span className="font-display text-[14px] text-neutral-500">
              AI-powered parsing
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
