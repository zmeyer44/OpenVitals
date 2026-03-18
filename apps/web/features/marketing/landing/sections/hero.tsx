"use client";
import Link from "next/link";
import { Button } from "@/components/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 pt-16 md:pt-20">
      <div className="max-w-2xl">
        <h1
          className="text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.15] tracking-[-0.025em] text-neutral-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Built to make your health data{" "}
          <em className="text-accent-600" style={{ fontStyle: "italic" }}>
            extraordinarily
          </em>{" "}
          clear, OpenVitals is the best way to understand your records.
        </h1>
      </div>
      <div className="mt-7 flex items-center gap-3">
        <Link href="/register">
          <Button variant="default" text="Get started for free" />
        </Link>
        <Link href="https://github.com/openvitals/openvitals">
          <Button variant="ghost" text="View on GitHub →" />
        </Link>
      </div>
    </section>
  );
}
