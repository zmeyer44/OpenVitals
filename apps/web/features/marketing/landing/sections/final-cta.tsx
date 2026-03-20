import Link from "next/link";
import { GITHUB_URL } from "@/constants/app";

export function FinalCta() {
  return (
    <section
      className="border-t border-neutral-200/50"
      style={{ backgroundColor: "#F5F4F1" }}
    >
      <div className="mx-auto max-w-[1120px] px-6 py-16">
        <h2 className="text-[clamp(1.6rem,3.5vw,2rem)] font-medium tracking-[-0.025em] text-neutral-900 font-display">
          Try OpenVitals now.
        </h2>
        <div className="mt-5 flex items-center gap-3">
          <Link
            href="/register"
            className="rounded-md bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-neutral-800 transition-colors font-body"
          >
            Get started for free
          </Link>
          <a
          target="_blank"
            href={GITHUB_URL}
            className="rounded-md px-4 py-2 text-[13px] font-medium text-neutral-600 hover:text-neutral-900 transition-colors font-body"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}
