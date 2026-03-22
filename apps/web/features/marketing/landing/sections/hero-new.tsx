import Link from "next/link";
import { cn } from "@/lib/utils";
import { GITHUB_URL } from "@/constants/app";
import { Logo } from "@/assets/app/images/logo";
import { Spark } from "../components/spark";
import { CornerCrossBadge } from "@/components/decorations/corner-cross";
import { Button } from "@/components/button";
import { DashBadge } from "@/components/decorations/dot-badge";

/* ------------------------------------------------------------------ */
/*  Floating data elements — animated "living dashboard"               */
/* ------------------------------------------------------------------ */

const tableRows = [
  { m: "LDL Cholesterol", v: "98", u: "mg/dL", s: "NORMAL", c: "#16A34A" },
  { m: "HbA1c", v: "5.9", u: "%", s: "BORDER", c: "#D97706" },
  { m: "Ferritin", v: "14", u: "ng/mL", s: "LOW", c: "#DC2626" },
];

function WindowChrome({ title }: { title?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 h-5 border-b border-neutral-100">
      <div className="size-[6px] rounded-full bg-neutral-300" />
      <div className="size-[6px] rounded-full bg-neutral-300" />
      <div className="size-[6px] rounded-full bg-neutral-300" />
      {title && (
        <>
          <span className="flex-1 text-center font-mono text-[8px] text-neutral-300">
            {title}
          </span>
          <div className="w-[30px]" />
        </>
      )}
    </div>
  );
}

function FloatingElements() {
  return (
    <>
      <style>{`
        @keyframes heroFloatIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroSlideRight {
          from { opacity: 0; transform: translateX(-14px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroProgress {
          0% { width: 0%; }
          60% { width: 84%; }
          100% { width: 96%; }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes heroCheckIn {
          0% { opacity: 0; transform: scale(0.5); }
          60% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes heroToast {
          from { opacity: 0; transform: translateY(8px) translateX(8px); }
          to { opacity: 1; transform: translateY(0) translateX(0); }
        }
        @keyframes heroTagReveal {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes heroCursorMove {
          0%   { top: 80px;  left: 100px; opacity: 0; }
          8%   { top: 80px;  left: 100px; opacity: 1; }
          25%  { top: 230px; left: 180px; opacity: 1; }
          40%  { top: 230px; left: 180px; opacity: 1; }
          55%  { top: 80px;  left: 300px; opacity: 1; }
          70%  { top: 400px; left: 100px; opacity: 1; }
          85%  { top: 470px; left: 220px; opacity: 1; }
          100% { top: 470px; left: 220px; opacity: 0; }
        }
        @keyframes heroDrawLine {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
        .hero-card {
          opacity: 0;
          animation: heroFloatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-slide {
          opacity: 0;
          animation: heroSlideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-tag {
          opacity: 0;
          animation: heroTagReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-toast {
          opacity: 0;
          animation: heroToast 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-cursor {
          animation: heroCursorMove 8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>

      <div
        className="relative h-full w-full max-w-[500px] lg:max-w-none mx-auto"
        aria-hidden="true"
      >
        {/* ── Animated cursor ── */}
        <svg
          className="hero-cursor absolute z-50 pointer-events-none"
          width="16"
          height="20"
          viewBox="0 0 16 20"
          fill="none"
        >
          <path
            d="M1 1L1 15.5L4.5 12L8.5 19L11 17.5L7 11L12 10.5L1 1Z"
            fill="#141414"
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* ── Row 1: Upload card + Metric card ── */}
        <div
          className="hero-card absolute top-[20px] left-0 w-[230px] bg-white border border-neutral-200 rounded"
          style={{
            animationDelay: "0.2s",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <WindowChrome title="Import" />
          <div className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[10px] font-medium text-neutral-800 truncate">
                  quest_labs_mar2026.pdf
                </div>
                <div className="font-mono text-[8px] text-neutral-400 mt-0.5">
                  Lab report · Quest Diagnostics
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-[3px] px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.04em] border border-[#16A34A] text-[#16A34A]">
                <span
                  className="size-[4px] bg-[#16A34A]"
                  style={{
                    animation: "heroPulse 1.2s ease-in-out 3",
                    animationDelay: "0.8s",
                  }}
                />
                DONE
              </span>
            </div>
            <div className="mt-2.5 h-[3px] bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-[#16A34A]"
                style={{
                  animation:
                    "heroProgress 2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                  animationDelay: "0.6s",
                  width: "0%",
                }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="font-mono text-[8px] text-neutral-400">
                Confidence
              </span>
              <span className="font-mono text-[9px] font-bold text-neutral-700">
                0.96
              </span>
            </div>
          </div>
        </div>

        <div
          className="hero-card absolute top-[24px] left-[248px] w-[195px] bg-white border border-neutral-200 rounded"
          style={{
            animationDelay: "0.8s",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <WindowChrome />
          <div className="p-3">
            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-neutral-400">
              LDL Cholesterol
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="font-mono text-[24px] font-bold tracking-[-0.02em] text-neutral-900">
                98
              </span>
              <span className="font-mono text-[8px] text-neutral-400">
                mg/dL
              </span>
            </div>
            <div className="mt-1.5 flex items-end justify-between">
              <span className="font-mono text-[8px] font-bold text-[#16A34A]">
                ↓ 14
              </span>
              <svg width="56" height="16" viewBox="0 0 56 16">
                <polyline
                  points="0,3 14,5.5 28,7 42,10 56,13"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  strokeDasharray="200"
                  style={{
                    animation: "heroDrawLine 1.5s ease-out forwards",
                    animationDelay: "1.2s",
                    strokeDashoffset: 200,
                  }}
                />
                <rect
                  x="54"
                  y="11"
                  width="4"
                  height="4"
                  fill="#16A34A"
                  opacity="0"
                  style={{
                    animation: "heroCheckIn 0.3s ease-out forwards",
                    animationDelay: "2.5s",
                  }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Row 2: Lab results table + Toast ── */}
        <div
          className="hero-card absolute top-[170px] left-[20px] w-[330px] bg-white border border-neutral-200 rounded"
          style={{
            animationDelay: "1.2s",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <WindowChrome title="Parsed Results" />
          <div className="grid grid-cols-[1.4fr_1fr_0.7fr] gap-2 px-3 py-1.5 border-b border-neutral-200 bg-neutral-50/60">
            {["METRIC", "VALUE", "STATUS"].map((h) => (
              <div
                key={h}
                className="font-mono text-[7px] font-bold uppercase tracking-[0.08em] text-neutral-400"
              >
                {h}
              </div>
            ))}
          </div>
          {tableRows.map((r, i) => (
            <div
              key={r.m}
              className="hero-slide grid grid-cols-[1.4fr_1fr_0.7fr] items-center gap-2 px-3 py-1.5 border-b border-neutral-100 last:border-b-0"
              style={{ animationDelay: `${1.6 + i * 0.15}s` }}
            >
              <div className="font-display text-[9px] font-medium text-neutral-700">
                {r.m}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span
                  className="font-mono text-[9px] font-bold tabular-nums"
                  style={{ color: r.s === "NORMAL" ? "#141414" : r.c }}
                >
                  {r.v}
                </span>
                <span className="font-mono text-[7px] text-neutral-400">
                  {r.u}
                </span>
              </div>
              <span
                className="inline-flex w-fit items-center gap-[3px] px-1 py-0.5 font-mono text-[6px] font-bold uppercase tracking-[0.04em]"
                style={{ border: `1px solid ${r.c}`, color: r.c }}
              >
                <span className="size-[3px]" style={{ backgroundColor: r.c }} />
                {r.s}
              </span>
            </div>
          ))}
        </div>

        {/* Toast — beside the table */}
        <div
          className="hero-toast absolute top-[190px] left-[368px] bg-white border border-neutral-200 px-3 py-2 flex items-center gap-2 rounded"
          style={{
            animationDelay: "3.0s",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <span
            className="flex size-[14px] items-center justify-center bg-[#16A34A] text-white"
            style={{
              opacity: 0,
              animation:
                "heroCheckIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              animationDelay: "3.2s",
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="square"
              />
            </svg>
          </span>
          <div>
            <div className="font-mono text-[8px] font-bold text-neutral-900">
              18 records extracted
            </div>
            <div className="font-mono text-[7px] text-neutral-400">
              Quest Diagnostics · just now
            </div>
          </div>
        </div>

        {/* ── Row 3: AI Chat (bottom area) ── */}
        <div
          className="hero-card absolute top-[400px] left-[60px] w-[320px] bg-white border border-neutral-200 rounded"
          style={{
            animationDelay: "2.0s",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <WindowChrome title="AI Chat" />
          <div className="p-3 space-y-2.5">
            <div className="flex justify-end">
              <div className="bg-accent-500 px-2.5 py-1.5 font-display text-[9px] leading-[1.4] text-white max-w-[80%]">
                How are my lipids trending?
              </div>
            </div>
            <div>
              <div className="font-mono text-[7px] font-bold uppercase tracking-[0.08em] text-accent-500 mb-1">
                OPENVITALS AI
              </div>
              <div className="border border-neutral-200 px-2.5 py-2 font-display text-[9px] leading-[1.5] text-neutral-600">
                LDL improved to <strong className="text-neutral-900">98</strong>{" "}
                mg/dL — now in optimal range. Triglycerides at{" "}
                <strong className="text-neutral-900">162</strong>, slightly
                above threshold.
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {[
                  { prefix: "SRC", label: "6 observations" },
                  { prefix: "RNG", label: "Mar 25–26" },
                ].map((t) => (
                  <span
                    key={t.prefix}
                    className="inline-flex items-center gap-1 border border-neutral-200 px-1.5 py-0.5 font-mono text-[7px]"
                  >
                    <span className="font-bold text-accent-500">
                      {t.prefix}
                    </span>
                    <span className="text-neutral-400">{t.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Provenance chain (between table and chat) ── */}
        <div className="absolute top-[370px] left-[0px] flex items-center gap-1.5 rounded">
          {[
            { prefix: "SRC", label: "Quest PDF" },
            { prefix: "PSR", label: "v2.1" },
            { prefix: "CNF", label: "0.94" },
            { prefix: "COD", label: "LOINC" },
          ].map((t, i) => (
            <div key={t.prefix} className="flex items-center gap-1.5">
              <span
                className="hero-tag inline-flex items-center gap-1 border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[7px]"
                style={{ animationDelay: `${2.4 + i * 0.12}s` }}
              >
                <span className="font-bold text-accent-500">{t.prefix}</span>
                <span className="text-neutral-500">{t.label}</span>
              </span>
              {i < 3 && (
                <span
                  className="hero-tag text-neutral-300 font-mono text-[9px]"
                  style={{ animationDelay: `${2.46 + i * 0.12}s` }}
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Decorative crosses ── */}
        {[
          { pos: "top-[90px] left-[200px]", delay: "0.4s" },
          { pos: "top-[310px] left-[380px]", delay: "1.0s" },
          { pos: "top-[540px] left-[400px]", delay: "1.8s" },
          { pos: "top-[40px] left-[130px]", delay: "0.6s" },
          { pos: "top-[380px] left-[10px]", delay: "2.2s" },
          { pos: "top-[500px] left-[20px]", delay: "2.6s" },
        ].map((d, i) => (
          <span
            key={i}
            className={cn(
              "hero-tag absolute text-neutral-300/50 font-light select-none pointer-events-none text-[14px]",
              d.pos,
            )}
            style={{ animationDelay: d.delay }}
          >
            +
          </span>
        ))}

        {/* ── Decorative dots ── */}
        {[
          { pos: "top-[150px] left-[0px]", delay: "0.5s" },
          { pos: "top-[290px] left-[10px]", delay: "1.4s" },
          { pos: "top-[460px] left-[420px]", delay: "2.0s" },
          { pos: "top-[50px] left-[420px]", delay: "0.9s" },
          { pos: "top-[350px] left-[400px]", delay: "1.6s" },
        ].map((d, i) => (
          <div
            key={i}
            className={cn(
              "hero-tag absolute size-[4px] rounded-full bg-neutral-300/40 pointer-events-none",
              d.pos,
            )}
            style={{ animationDelay: d.delay }}
          />
        ))}
      </div>
    </>
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
        <Logo className="size-[80vh] animate-[spin_60s_linear_infinite]" />
      </div>
      <section className="relative mx-auto grid h-auto w-full max-w-[1400px] grid-cols-4 gap-x-4 lg:grid-cols-12 lg:gap-x-6 mt-6 my-20 bg-transparent px-4 first:mt-4 lg:mt-20 lg:px-9 first:lg:mt-10 lg:mb-30 lg:h-[calc(100dvh-160px)] lg:max-h-[725px] lg:min-h-[620px] xl:mb-22">
        {/* Left — text content */}
        <div className="z-10 col-span-4 flex flex-col justify-between lg:col-span-6 lg:max-w-none">
          <div className="flex flex-col gap-y-6 lg:gap-y-8">
            {/* Section label */}
            <DashBadge>Open Source</DashBadge>

            {/* Headline */}
            <h1 className="text-foreground font-normal text-[40px] leading-[100%] tracking-[-0.16rem] lg:tracking-[-0.18rem] lg:-ml-1 lg:text-6xl 2xl:text-7xl visible">
              Understand
              <br />
              Your Health Data
            </h1>

            {/* Sub-headline */}
            <p className="font-display text-[17px] md:text-[18px] text-neutral-500 leading-[1.55] lg:max-w-[420px]">
              The only open-source platform that parses, normalizes, and tracks
              health records from any lab, provider, or format.
            </p>

            {/* Body detail */}
            <p className="font-mono text-[13px] text-neutral-400 leading-[1.65] lg:max-w-[420px]">
              From lab PDFs to wearable exports — delegate parsing to AI with
              full provenance, confidence scoring, and insights grounded in your
              actual records.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
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
        </div>

        {/* Right — floating data elements */}
        <div className="mt-6 lg:mt-0 pointer-events-none relative h-full w-full overflow-hidden md:pointer-events-auto z-0 col-span-full aspect-[3/2] lg:aspect-auto lg:col-span-6 lg:w-[clamp(600px,54vw,1000px)] lg:max-w-none">
          <FloatingElements />
        </div>
      </section>
    </div>
  );
}
