"use client";
import Link from "next/link";
import { GITHUB_URL } from "@/constants/app";
import { Button } from "@/components/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 pt-16 md:pt-20">
      <div className="max-w-2xl">
        {/* <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.15] tracking-[-0.025em] text-neutral-900 font-display">
          Built to make your health data{" "}
          <em className="text-accent-600" style={{ fontStyle: "italic" }}>
            extraordinarily
          </em>{" "}
          clear, OpenVitals is the best way to understand your records.
        </h1> */}
        <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.15] tracking-[-0.025em] text-neutral-900 font-display">
          Understand your health data<br />
          <em className="text-accent-600" style={{ fontStyle: "italic" }}>
           from any lab, provider, or format.
          </em>
        </h1>
      </div>
      <div className="mt-7 flex items-center gap-3">
        <Link href="/register">
          <Button variant="default" text="Start tracking for free" />
        </Link>
        <Link href={GITHUB_URL}>
          <Button variant="ghost" text="Star us on GitHub →" />
        </Link>
      </div>
    </section>
  );
}
