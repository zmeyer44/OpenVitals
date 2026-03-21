import Link from "next/link";
import { Button } from "@/components/button";
import { Logo } from "@/assets/app/images/logo";
import { TOTAL_COUNT } from "../data";

export function Cta() {
  return (
    <section className="px-6 md:px-10 py-14 lg:py-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="bg-neutral-900 px-8 md:px-12 py-12 md:py-16 max-w-md">
          {/* Card header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2.5">
              <div className="size-[7px] rounded-full bg-accent-500" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                Get Started
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
              Start Tracking
            </span>
          </div>

          <Logo className="size-8 text-white mb-6" />

          <h2 className="font-display text-[28px] md:text-[32px] font-medium tracking-[-0.03em] leading-[1.1] text-white">
            Start tracking your
            <br />
            {TOTAL_COUNT}+ biomarkers.
          </h2>

          <p className="mt-4 font-mono text-[13px] text-neutral-500 leading-[1.6]">
            Upload your lab results, connect your wearables, and
            see every biomarker on your personal health dashboard.
          </p>

          <Link href="/register">
            <Button text="Get started for free →" className="bg-white text-neutral-900 hover:bg-neutral-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}
