import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { DashBadge } from "@/components/decorations/dot-badge";

const meds = [
  {
    name: "Atorvastatin",
    dosage: "20mg · Once daily",
    purpose: "Cholesterol management",
    status: "ACTIVE",
    started: "Jan 2025",
    color: "#16A34A",
    linked: "LDL, HDL, Triglycerides",
  },
  {
    name: "Vitamin D3",
    dosage: "5000 IU · Once daily",
    purpose: "Vitamin D deficiency",
    status: "ACTIVE",
    started: "Mar 2026",
    color: "#16A34A",
    linked: "Vitamin D, Calcium",
  },
];

export function Medications() {
  return (
    <section className="border-t border-neutral-200">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-14 lg:py-20">
        {/* Header row */}
        <div className="flex items-start justify-between gap-8 mb-10">
          <div className="max-w-xl">
            <DashBadge className="mb-8">Medications</DashBadge>
            <h2 className="font-display text-[32px] md:text-[40px] font-medium tracking-[-0.03em] leading-[1.1] text-neutral-900">
              See how your medications
              <br />
              connect to your labs.
            </h2>
            <p className="mt-5 font-mono text-[14px] text-neutral-400 leading-[1.65] max-w-[440px]">
              Active medications, supplements, dosage, frequency, and daily
              adherence — all linked to your health timeline and lab results.
            </p>
          </div>
          <Link
            href="/register"
            className="hidden md:inline-flex shrink-0 mt-12"
          >
            <Button text="Learn more →" variant="default" />
          </Link>
        </div>

        {/* Medication cards — window style */}
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
              Active medications
            </span>
            <div className="w-[38px]" />
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1.2fr_1fr_1fr_0.6fr_0.8fr_0.6fr] gap-2 px-5 py-2 border-b border-neutral-200 bg-neutral-50/60">
            {[
              "MEDICATION",
              "DOSAGE",
              "PURPOSE",
              "STATUS",
              "LINKED LABS",
              "STARTED",
            ].map((h) => (
              <div
                key={h}
                className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-neutral-400"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {meds.map((m, i) => (
            <div
              key={m.name}
              className={cn(
                "grid grid-cols-[1.2fr_1fr_1fr_0.6fr_0.8fr_0.6fr] items-center gap-2 px-5 py-3.5",
                i < meds.length - 1 && "border-b border-neutral-100",
              )}
            >
              <div className="font-display text-[13px] font-medium text-neutral-900">
                {m.name}
              </div>
              <div className="font-mono text-[11px] text-neutral-600">
                {m.dosage}
              </div>
              <div className="font-display text-[12px] text-neutral-500">
                {m.purpose}
              </div>
              <span
                className="inline-flex w-fit items-center gap-[3px] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.04em]"
                style={{ border: `1px solid ${m.color}`, color: m.color }}
              >
                <span
                  className="size-[4px]"
                  style={{ backgroundColor: m.color }}
                />
                {m.status}
              </span>
              <div className="font-mono text-[10px] text-neutral-400">
                {m.linked}
              </div>
              <div className="font-mono text-[10px] font-bold text-neutral-600">
                {m.started}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <Link href="/register" className="mt-6 md:hidden inline-flex">
          <Button text="Learn more →" variant="default" />
        </Link>
      </div>
    </section>
  );
}
