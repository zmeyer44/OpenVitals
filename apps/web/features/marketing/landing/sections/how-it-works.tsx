import { cn } from "@/lib/utils";

const steps = [
  {
    num: "01",
    heading: "Upload anything",
    desc: "Drop a lab report PDF, CSV export, or connect a wearable. We accept results from Quest, LabCorp, hospital systems, and dozens more.",
  },
  {
    num: "02",
    heading: "Automatic parsing",
    desc: "AI classifies your document, extracts every value, normalizes units, and maps to standard medical codes — with confidence scores on every extraction.",
  },
  {
    num: "03",
    heading: "Track and understand",
    desc: "See trends over time, share specific slices with your doctor, and ask AI questions grounded in your actual records.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 md:px-8 py-12 md:py-16">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-accent-500 mb-8">
        HOW IT WORKS
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 border border-neutral-200 bg-white">
        {steps.map((s, i) => (
          <div
            key={s.num}
            className={cn(
              "p-5 md:p-6",
              i < steps.length - 1 &&
                "border-b md:border-b-0 md:border-r border-neutral-200",
            )}
          >
            <div className="font-display text-[48px] font-bold text-neutral-200 leading-none">
              {s.num}
            </div>
            <h3 className="mt-3 font-display text-[18px] font-bold tracking-[-0.02em] text-neutral-900">
              {s.heading}
            </h3>
            <p className="mt-2 font-body text-[14px] text-neutral-600 leading-relaxed">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
