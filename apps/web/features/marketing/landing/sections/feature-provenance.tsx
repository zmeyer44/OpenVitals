import { DashBadge } from "@/components/decorations/dot-badge";

const tags = [
  { prefix: "SRC", label: "Quest Diagnostics PDF" },
  { prefix: "PSR", label: "lab-pdf-parser v2.1" },
  { prefix: "CNF", label: "0.94" },
  { prefix: "COD", label: "LOINC 13457-7" },
  { prefix: "STS", label: "User confirmed" },
];

export function Provenance() {
  return (
    <section className="bg-neutral-900">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        {/* ── Top: 3-column text ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-neutral-800 py-14 lg:py-20">
          {/* Col 1 — label + description */}
          <div className="pr-8 pb-8 md:pb-0">
            <DashBadge className="mb-6 text-neutral-300">Provenance</DashBadge>
            <p className="font-display text-[15px] text-neutral-400 leading-[1.6] max-w-[280px]">
              Every value in OpenVitals traces back to its source — with full
              transparency on how it was parsed, coded, and confirmed.
            </p>
          </div>

          {/* Col 2 — Source tracking */}
          <div className="border-t md:border-t-0 md:border-l border-neutral-800 md:pl-8 pt-8 md:pt-0 pr-8 pb-8 md:pb-0">
            <h3 className="font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-white mb-3">
              Source Tracking
            </h3>
            <p className="font-display text-[14px] text-neutral-500 leading-[1.6]">
              Click any observation and see the full chain: source PDF, parser
              version, LOINC code, confidence score. No black boxes.
            </p>
            <a
              href="/register"
              className="mt-4 inline-flex font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-white hover:text-accent-400 transition-colors"
            >
              Learn more about provenance →
            </a>
          </div>

          {/* Col 3 — Confidence scoring */}
          <div className="border-t md:border-t-0 md:border-l border-neutral-800 md:pl-8 pt-8 md:pt-0">
            <h3 className="font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-white mb-3">
              Confidence Scoring
            </h3>
            <p className="font-display text-[14px] text-neutral-500 leading-[1.6]">
              Every extraction comes with a confidence score. High confidence
              values flow automatically; uncertain values get flagged for your
              review.
            </p>
            <a
              href="/register"
              className="mt-4 inline-flex font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-white hover:text-accent-400 transition-colors"
            >
              Learn more about confidence →
            </a>
          </div>
        </div>

        {/* ── Bottom: large text + provenance chain ── */}
        <div className="py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-end">
          <h2 className="font-display text-[32px] md:text-[40px] font-medium tracking-[-0.03em] leading-[1.1] text-white">
            Never wonder where
            <br />a number came from.
          </h2>
          <div className="flex flex-wrap items-center gap-2.5">
            {tags.map((t, i) => (
              <div key={t.prefix} className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 border border-neutral-700 px-2.5 py-1.5 font-mono text-[10px]">
                  <span className="font-bold text-accent-400">{t.prefix}</span>
                  <span className="text-neutral-400">{t.label}</span>
                </span>
                {i < tags.length - 1 && (
                  <span className="text-neutral-600 font-mono text-[12px]">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
