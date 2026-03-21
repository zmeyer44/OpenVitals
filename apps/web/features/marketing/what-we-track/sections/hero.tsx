import Link from "next/link";
import { Button } from "@/components/button";
import { TOTAL_COUNT } from "../data";

export function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 md:px-10 pt-20 md:pt-28 pb-14 md:pb-20">
      <div className="max-w-2xl">
        {/* Section label */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="size-[7px] rounded-full bg-accent-500" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-900">
            Biomarker Library
          </span>
        </div>

        <h1 className="font-display text-[36px] md:text-[52px] font-medium tracking-[-0.035em] leading-[1.05] text-neutral-900">
          {TOTAL_COUNT}+ biomarkers
          <br />
          tracked across every system
        </h1>

        <p className="mt-6 font-mono text-[14px] text-neutral-400 leading-[1.65] max-w-lg">
          From metabolic panels and hormone levels to wearable
          metrics and cardiac markers — OpenVitals tracks, trends,
          and contextualizes every biomarker that matters.
        </p>

        <div className="mt-10 flex items-center gap-3">
          <Link href="/register">
            <Button text="Get started" variant="default" size="lg" />
          </Link>
          <Link href="/">
            <Button text="Back to home →" variant="ghost" size="lg" />
          </Link>
        </div>
      </div>
    </section>
  );
}
