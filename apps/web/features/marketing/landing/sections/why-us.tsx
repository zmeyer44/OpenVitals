import {
  FlaskConical,
  ShieldCheck,
  Users,
  RefreshCw,
  Database,
  Globe,
} from "lucide-react";
import { DashBadge } from "@/components/decorations/dot-badge";

const useCases = [
  {
    icon: FlaskConical,
    title: "Lab Result Tracking",
    description:
      "Upload lab PDFs from Quest, LabCorp, or any provider. AI parses every value, normalizes units, and maps to standard codes — so you can track trends across years of results.",
  },
  {
    icon: ShieldCheck,
    title: "Provenance & Trust",
    description:
      "Every observation traces back to its source document, parser version, and confidence score. Click any value and see the full chain — no black boxes.",
  },
  {
    icon: Users,
    title: "Scoped Sharing",
    description:
      "Create time-limited, category-filtered shares for your doctors. Your cardiologist sees lipids and vitals. Your nutritionist sees diet-related labs. Nobody sees what they shouldn't.",
  },
  {
    icon: RefreshCw,
    title: "Wearable Integration",
    description:
      "Connect Whoop, Apple Watch, Oura, Garmin, and Fitbit. Recovery scores, HRV, sleep duration, and activity data flow in automatically alongside your lab work.",
  },
  {
    icon: Database,
    title: "Medication Correlation",
    description:
      "Track active medications and supplements alongside your labs. See how starting atorvastatin correlates with your LDL trend, or how vitamin D supplementation tracks against levels.",
  },
  {
    icon: Globe,
    title: "Self-Hosted & Open",
    description:
      "Run the entire platform on your own infrastructure. TypeScript end-to-end, Postgres, Drizzle, tRPC. Extend with custom parsers, views, and analyzers via the plugin SDK.",
  },
];

export function WhyUs() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 md:px-10 my-20 lg:my-30 pt-10 md:pt-20">
      <div className="border-t border-neutral-200 pt-4">
        <DashBadge>Use Cases</DashBadge>
      </div>

      <div className="mt-6 lg:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-x-6">
        <div className="lg:col-span-6">
          <h2 className="text-foreground font-normal text-[30px] leading-[100%] tracking-[-0.06rem] lg:text-[48px] lg:tracking-[-0.09rem] max-w-[550px] text-balance">
            Across every health domain
          </h2>
        </div>
        <div className="lg:col-span-5 lg:col-start-8 mt-4 lg:mt-0">
          <p className="text-pretty font-mono text-[16px] leading-[120%] tracking-[-0.02rem] lg:text-[18px] lg:tracking-[-0.0225rem] text-neutral-500">
            OpenVitals helps individuals and practitioners understand health
            data across the entire biomarker landscape.
          </p>
        </div>
      </div>

      <div className="mt-12 lg:mt-16 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {useCases.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex flex-col gap-y-4">
              <Icon className="size-6 text-accent-200" strokeWidth={1.5} />
              <h3 className="text-foreground font-normal text-[24px] leading-[100%] tracking-[-0.03rem] lg:text-[28px] lg:tracking-[-0.035rem]">
                {item.title}
              </h3>
              <p className="text-pretty font-mono text-[14px] leading-loose tracking-[-0.0175rem] lg:text-[16px] lg:tracking-[-0.02rem] text-neutral-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
