import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { DashBadge } from "@/components/decorations/dot-badge";
import { Spark } from "../components/spark";

const meds = [
  { name: "Atorvastatin", dosage: "20mg · Once daily", purpose: "Cholesterol management", status: "ACTIVE", started: "Jan 2025", color: "#16A34A", linked: "LDL, HDL, Triglycerides" },
  { name: "Vitamin D3", dosage: "5000 IU · Once daily", purpose: "Vitamin D deficiency", status: "ACTIVE", started: "Mar 2026", color: "#16A34A", linked: "Vitamin D, Calcium" },
];

const correlations = [
  { med: "Atorvastatin", metric: "LDL Cholesterol", before: "142", after: "98", unit: "mg/dL", change: "↓ 31%", color: "#16A34A", trend: [142, 135, 128, 118, 112, 98] },
  { med: "Atorvastatin", metric: "HDL Cholesterol", before: "48", after: "58", unit: "mg/dL", change: "↑ 21%", color: "#16A34A", trend: [48, 50, 52, 54, 56, 58] },
  { med: "Vitamin D3", metric: "Vitamin D", before: "14", after: "22", unit: "ng/mL", change: "↑ 57%", color: "#D97706", trend: [14, 15, 17, 19, 20, 22] },
];

export function Medications() {
  return (
    <section className="border-t border-neutral-200">
      <style>{`
        @keyframes medSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes medDrawLine {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes medCountIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes medConnector {
          from { width: 0; }
          to { width: 100%; }
        }
        .med-row { opacity: 0; animation: medSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .med-count { opacity: 0; animation: medCountIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-14 lg:py-20">
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
          <Link href="/register" className="hidden md:inline-flex shrink-0 mt-12">
            <Button text="Learn more →" variant="default" />
          </Link>
        </div>

        {/* Medication table */}
        <div
          className="bg-white border border-neutral-200"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-neutral-100">
            <div className="size-[6px] rounded-full bg-neutral-300" />
            <div className="size-[6px] rounded-full bg-neutral-300" />
            <div className="size-[6px] rounded-full bg-neutral-300" />
            <span className="flex-1 text-center font-mono text-[10px] text-neutral-400">Active medications</span>
            <div className="w-[38px]" />
          </div>
          <div className="grid grid-cols-[1.2fr_1fr_1fr_0.6fr_0.8fr_0.6fr] gap-2 px-5 py-2 border-b border-neutral-200 bg-neutral-50/60">
            {["MEDICATION", "DOSAGE", "PURPOSE", "STATUS", "LINKED LABS", "STARTED"].map((h) => (
              <div key={h} className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-neutral-400">{h}</div>
            ))}
          </div>
          {meds.map((m, i) => (
            <div
              key={m.name}
              className={cn("med-row grid grid-cols-[1.2fr_1fr_1fr_0.6fr_0.8fr_0.6fr] items-center gap-2 px-5 py-3.5", i < meds.length - 1 && "border-b border-neutral-100")}
              style={{ animationDelay: `${0.3 + i * 0.2}s` }}
            >
              <div className="font-display text-[13px] font-medium text-neutral-900">{m.name}</div>
              <div className="font-mono text-[11px] text-neutral-600">{m.dosage}</div>
              <div className="font-display text-[12px] text-neutral-500">{m.purpose}</div>
              <span className="inline-flex w-fit items-center gap-[3px] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.04em]" style={{ border: `1px solid ${m.color}`, color: m.color }}>
                <span className="size-[4px]" style={{ backgroundColor: m.color }} />
                {m.status}
              </span>
              <div className="font-mono text-[10px] text-neutral-400">{m.linked}</div>
              <div className="font-mono text-[10px] font-bold text-neutral-600">{m.started}</div>
            </div>
          ))}
        </div>

        {/* Lab correlation cards — animated */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-px border border-neutral-200">
          {correlations.map((cor, i) => (
            <div
              key={cor.metric}
              className={cn("med-row bg-white p-5", i < correlations.length - 1 && "border-b md:border-b-0 md:border-r border-neutral-200")}
              style={{ animationDelay: `${1.0 + i * 0.25}s` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-neutral-400">{cor.metric}</span>
                <span className="font-mono text-[8px] text-neutral-300">{cor.med}</span>
              </div>
              {/* Value change */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-mono text-[10px] text-neutral-400 line-through">{cor.before}</span>
                <span className="font-mono text-[8px] text-neutral-300">→</span>
                <span className="font-mono text-[18px] font-bold text-neutral-900">{cor.after}</span>
                <span className="font-mono text-[8px] text-neutral-400">{cor.unit}</span>
              </div>
              {/* Trend sparkline */}
              <div className="flex items-end justify-between">
                <span
                  className="med-count font-mono text-[10px] font-bold"
                  style={{ color: cor.color, animationDelay: `${1.4 + i * 0.25}s` }}
                >
                  {cor.change}
                </span>
                <Spark data={cor.trend} color={cor.color} w={80} h={20} />
              </div>
              {/* Connection line */}
              <div className="mt-3 h-px bg-neutral-100 overflow-hidden">
                <div
                  className="h-full"
                  style={{ backgroundColor: cor.color, opacity: 0.3, animation: "medConnector 1s ease-out forwards", animationDelay: `${1.2 + i * 0.25}s`, width: 0 }}
                />
              </div>
              <div className="mt-2 font-mono text-[7px] text-neutral-300 uppercase tracking-[0.06em]">
                Since starting {cor.med.toLowerCase()}
              </div>
            </div>
          ))}
        </div>

        <Link href="/register" className="mt-6 md:hidden inline-flex">
          <Button text="Learn more →" variant="default" />
        </Link>
      </div>
    </section>
  );
}
