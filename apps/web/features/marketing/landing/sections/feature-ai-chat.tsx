import { cn } from "@/lib/utils";

const navItems = [
  { num: "01", label: "HEALTH CHAT", active: true },
  { num: "02", label: "SUMMARIES", active: false },
  { num: "03", label: "RECOMMENDATIONS", active: false },
];

export function AiChat() {
  return (
    <section className="border-t border-neutral-200">
      {/* Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ── Left side ── */}
        <div className="lg:ml-auto lg:max-w-[640px] w-full px-6 md:px-10 py-14 lg:py-20">
          {/* Section label */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="size-[7px] rounded-full bg-accent-500" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-900">
              AI
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-[32px] md:text-[40px] font-medium tracking-[-0.03em] leading-[1.1] text-neutral-900">
            AI that only speaks
            <br />
            from your records.
          </h2>

          {/* Body */}
          <p className="mt-5 font-mono text-[14px] text-neutral-400 leading-[1.65] max-w-[440px]">
            Ask questions about your health data and get
            answers grounded in your actual observations.
            Every response cites the data it used.
          </p>

          {/* ── Card ── */}
          <div className="mt-10 border border-neutral-200 bg-white">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
              <div className="size-[7px] rounded-full bg-accent-500" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                01 – Health Chat
              </span>
            </div>

            {/* Example query */}
            <div className="px-5 py-4 border-b border-neutral-100">
              <div className="border border-neutral-200 px-4 py-3">
                <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-400 mb-2">
                  EXAMPLE QUERY
                </div>
                <div className="font-display text-[14px] text-neutral-800 leading-[1.5]">
                  &ldquo;How have my lipid panel results changed over the last
                  year?&rdquo;
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-neutral-100">
                  {[
                    { prefix: "SRC", label: "6 observations" },
                    { prefix: "RNG", label: "Mar 2025–2026" },
                    { prefix: "LAB", label: "Quest + LabCorp" },
                  ].map((t) => (
                    <span
                      key={t.prefix}
                      className="inline-flex items-center gap-1 border border-neutral-200 px-1.5 py-0.5 font-mono text-[9px]"
                    >
                      <span className="font-bold text-accent-500">
                        {t.prefix}
                      </span>
                      <span className="text-neutral-500">{t.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card body */}
            <div className="px-5 py-5">
              <h3 className="font-display text-[18px] font-medium text-neutral-900">
                Grounded responses
              </h3>
              <p className="mt-2 font-display text-[14px] text-neutral-500 leading-[1.6]">
                Every AI answer cites specific observations, dates, and sources.
                No hallucinations — only facts from your verified health records.
              </p>
              <a
                href="/register"
                className="mt-5 inline-flex items-center bg-neutral-900 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-white hover:bg-neutral-800 transition-colors"
              >
                Learn more →
              </a>
            </div>
          </div>
        </div>

        {/* ── Right side ── */}
        <div className="relative lg:border-l border-neutral-200 bg-[#f2f2f0] overflow-hidden hidden lg:block">
          <div className="px-10 py-14">
            {/* Corner labels */}
            <div className="flex items-center justify-between mb-8">
              <div className="size-[7px] rounded-full bg-accent-500" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-400">
                Health Chat
              </span>
            </div>

            {/* Floating chat window */}
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
                  OpenVitals AI Chat
                </span>
                <div className="w-[38px]" />
              </div>

              {/* Chat messages */}
              <div className="p-5 space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-accent-500 px-4 py-2.5 font-display text-[12px] leading-relaxed text-white">
                    How have my lipid panel results changed over the last year?
                  </div>
                </div>

                {/* AI response */}
                <div>
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-accent-500 mb-1.5">
                    OPENVITALS AI
                  </div>
                  <div className="border border-neutral-200 px-4 py-3 font-display text-[12px] leading-[1.6] text-neutral-700">
                    Your lipid panel shows meaningful improvement. LDL dropped
                    from 142 to <strong>98 mg/dL</strong> — now within optimal
                    range. However, triglycerides trended up to{" "}
                    <strong>162 mg/dL</strong>, which is above the recommended
                    threshold of 150.
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      { prefix: "SRC", label: "6 lipid observations" },
                      { prefix: "RNG", label: "Mar 2025 – Mar 2026" },
                      { prefix: "LAB", label: "Quest + LabCorp" },
                    ].map((t) => (
                      <span
                        key={t.prefix}
                        className="inline-flex items-center gap-1 border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[8px]"
                      >
                        <span className="font-bold text-accent-500">
                          {t.prefix}
                        </span>
                        <span className="text-neutral-500">{t.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="border-t border-neutral-200 px-4 py-2.5 flex items-center gap-2">
                <div className="flex-1 border border-neutral-200 bg-neutral-50 px-3 py-1.5">
                  <span className="font-display text-[11px] text-neutral-400">
                    Ask about your health data...
                  </span>
                </div>
                <div className="flex size-7 items-center justify-center bg-accent-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            {[
              "top-[60px] right-[30px]",
              "top-[240px] right-[20px]",
              "bottom-[100px] left-[30px]",
            ].map((pos, i) => (
              <span
                key={i}
                className={cn(
                  "absolute text-neutral-300/50 font-light select-none pointer-events-none text-[16px]",
                  pos,
                )}
              >
                +
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom navigation strip ── */}
      <div className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5 md:gap-8">
            {navItems.map((item) => (
              <span
                key={item.num}
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.06em]",
                  item.active
                    ? "font-bold text-accent-500"
                    : "text-neutral-400",
                )}
              >
                {item.num} {item.label}
              </span>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-8">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-900">
              Health Chat
            </span>
            <span className="font-display text-[14px] text-neutral-500">
              Grounded responses
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
