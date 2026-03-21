import Link from "next/link";
import { cn } from "@/lib/utils";
import { GITHUB_URL } from "@/constants/app";
import { Logo } from "@/assets/app/images/logo";
import { Spark } from "../components/spark";
import { CornerCrossBadge } from "@/components/decorations/corner-cross";
import { Button } from "@/components/button";
import { DashBadge } from "@/components/decorations/dot-badge";
/* ------------------------------------------------------------------ */
/*  Floating data elements for the right side of the hero             */
/* ------------------------------------------------------------------ */

const tableRows = [
  { m: "LDL Cholesterol", v: "98", u: "mg/dL", s: "NORMAL", c: "#16A34A" },
  { m: "HbA1c", v: "5.9", u: "%", s: "BORDER", c: "#D97706" },
  { m: "Ferritin", v: "14", u: "ng/mL", s: "LOW", c: "#DC2626" },
];

function WindowChrome() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-neutral-100">
      <div className="size-[6px] rounded-full bg-neutral-300" />
      <div className="size-[6px] rounded-full bg-neutral-300" />
      <div className="size-[6px] rounded-full bg-neutral-300" />
    </div>
  );
}

function FloatingElements() {
  return (
    <div className="relative h-full w-full overflow-x-clip" aria-hidden="true">
      {/* Card 1 — Metric summary */}
      <div
        className="absolute top-6 left-0 w-[210px] bg-white border border-neutral-200"
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <WindowChrome />
        <div className="p-3.5">
          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-400">
            LDL CHOLESTEROL
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-[26px] font-bold tracking-[-0.02em] text-neutral-900">
              98
            </span>
            <span className="font-mono text-[9px] text-neutral-400">mg/dL</span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <span className="font-mono text-[9px] font-bold text-[#16A34A]">
              ↓ 14
            </span>
            <Spark
              data={[142, 130, 118, 105, 98]}
              color="#16A34A"
              w={56}
              h={16}
            />
          </div>
        </div>
      </div>

      {/* Card 2 — Mini lab table */}
      <div
        className="absolute top-[170px] left-[100px] w-[340px] bg-white border border-neutral-200"
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <WindowChrome />
        {/* Table header */}
        <div className="grid grid-cols-[1.4fr_1fr_0.7fr] gap-2 px-3.5 py-1.5 border-b border-neutral-200 bg-neutral-50/60">
          {["METRIC", "VALUE", "STATUS"].map((h) => (
            <div
              key={h}
              className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-neutral-400"
            >
              {h}
            </div>
          ))}
        </div>
        {tableRows.map((r, i) => (
          <div
            key={r.m}
            className={cn(
              "grid grid-cols-[1.4fr_1fr_0.7fr] items-center gap-2 px-3.5 py-2",
              i < tableRows.length - 1 && "border-b border-neutral-100",
            )}
          >
            <div className="font-display text-[10px] font-medium text-neutral-700">
              {r.m}
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-mono text-[10px] font-bold tabular-nums text-neutral-800">
                {r.v}
              </span>
              <span className="font-mono text-[8px] text-neutral-400">
                {r.u}
              </span>
            </div>
            <span
              className="inline-flex w-fit items-center gap-[3px] px-1 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.04em]"
              style={{ border: `1px solid ${r.c}`, color: r.c }}
            >
              <span className="size-[4px]" style={{ backgroundColor: r.c }} />
              {r.s}
            </span>
          </div>
        ))}
      </div>

      {/* Provenance chain — bottom */}
      <div className="absolute bottom-[50px] left-[30px] flex items-center gap-1.5">
        {[
          { prefix: "SRC", label: "Quest PDF" },
          { prefix: "CNF", label: "0.94" },
          { prefix: "COD", label: "LOINC" },
        ].map((t, i) => (
          <div key={t.prefix} className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[8px]">
              <span className="font-bold text-accent-500">{t.prefix}</span>
              <span className="text-neutral-500">{t.label}</span>
            </span>
            {i < 2 && (
              <span className="text-neutral-300 font-mono text-[10px]">→</span>
            )}
          </div>
        ))}
      </div>

      {/* Decorative crosses */}
      {[
        "top-[80px] right-[20px]",
        "top-[280px] right-[50px]",
        "bottom-[90px] right-[10px]",
        "top-[20px] left-[180px]",
        "top-[320px] left-[60px]",
      ].map((pos, i) => (
        <span
          key={i}
          className={cn(
            "absolute text-neutral-300/60 font-light select-none pointer-events-none text-[16px]",
            pos,
          )}
        >
          +
        </span>
      ))}

      {/* Decorative dots */}
      {[
        "top-[130px] left-[-6px]",
        "top-[250px] left-[80px]",
        "bottom-[130px] right-[30px]",
        "top-[40px] right-[60px]",
      ].map((pos, i) => (
        <div
          key={i}
          className={cn(
            "absolute size-[5px] rounded-full bg-neutral-300/50 pointer-events-none",
            pos,
          )}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero section                                                       */
/* ------------------------------------------------------------------ */

export function Hero() {
  return (
    <div className="relative max-w-dvw overflow-x-clip">
      {/* Central watermark logo */}
      <div className="-z-0 absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
        <Logo className="size-[80vh]" />
      </div>
      <section className="mx-auto max-w-[1280px] px-6 md:px-10 min-h-[calc(100vh-4rem)] flex items-center py-16 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-6 items-center w-full">
          {/* Left — text content */}
          <div className="max-w-xl">
            {/* Section label */}

            <div className="flex items-center gap-2.5 mb-8">
              <DashBadge>Open Source</DashBadge>
            </div>

            {/* Headline */}
            <h1 className="text-foreground font-normal text-[40px] leading-[100%] tracking-[-0.16rem] lg:tracking-[-0.18rem] lg:-ml-1 lg:text-6xl 2xl:text-7xl visible">
              Understand
              <br />
              Your Health Data
            </h1>

            {/* Sub-headline */}
            <p className="mt-7 font-display text-[17px] md:text-[18px] text-neutral-500 leading-[1.55] max-w-[420px]">
              The only open-source platform that parses, normalizes, and tracks
              health records from any lab, provider, or format.
            </p>

            {/* Body detail */}
            <p className="mt-4 font-mono text-[13px] text-neutral-400 leading-[1.65] max-w-[420px]">
              From lab PDFs to wearable exports — delegate parsing to AI with
              full provenance, confidence scoring, and insights grounded in your
              actual records.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button
                  text="Start tracking for free"
                  variant="default"
                  size="lg"
                />
              </Link>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Button text="Star on GitHub →" variant="outline" size="lg" />
              </a>
            </div>
          </div>

          {/* Right — floating data elements */}
          <div className="relative hidden lg:block min-h-[520px]">
            <FloatingElements />
          </div>
        </div>
      </section>
    </div>
  );
}
