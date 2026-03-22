import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { DashBadge } from "@/components/decorations/dot-badge";
import { FeatureExampleCard } from "../components/feature-example-card";

const navItems = [
  { num: "01", label: "HEALTH CHAT", active: true },
  { num: "02", label: "SUMMARIES", active: false },
  { num: "03", label: "RECOMMENDATIONS", active: false },
];

export function AiChat() {
  return (
    <section className="border-t border-neutral-200">
      <style>{`
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatSlideLeft {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes chatDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes chatTagPop {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes chatBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes chatTyping {
          from { width: 0; }
          to { width: 100%; }
        }
        .chat-msg { opacity: 0; animation: chatMsgIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .chat-user { opacity: 0; animation: chatSlideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .chat-tag { opacity: 0; animation: chatTagPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ── Left side ── */}
        <div className="lg:ml-auto lg:max-w-[640px] w-full px-6 md:px-10 py-14 lg:py-20">
          <DashBadge className="mb-8">AI</DashBadge>
          <h2 className="font-display text-[32px] md:text-[40px] font-medium tracking-[-0.03em] leading-[1.1] text-neutral-900">
            AI that only speaks
            <br />
            from your records.
          </h2>
          <p className="mt-5 font-mono text-[14px] text-neutral-400 leading-[1.65] max-w-[440px]">
            Ask questions about your health data and get answers grounded in
            your actual observations. Every response cites the data it used.
          </p>
          <FeatureExampleCard
            topLabel="01 – Health Chat"
            title="Grounded responses"
            description="Every AI answer cites specific observations, dates, and sources.
                No hallucinations — only facts from your verified health records."
          >
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
          </FeatureExampleCard>
        </div>

        {/* ── Right side — animated chat conversation ── */}
        <div className="relative lg:border-l border-neutral-200 bg-[#f2f2f0] overflow-hidden hidden lg:block">
          <div className="px-10 py-14">
            <div className="flex items-center justify-between mb-6">
              <div className="size-[7px] rounded-full bg-accent-500" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-400">
                Health Chat
              </span>
            </div>

            <div
              className="bg-white border border-neutral-200"
              style={{
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-neutral-100">
                <div className="size-[6px] rounded-full bg-neutral-300" />
                <div className="size-[6px] rounded-full bg-neutral-300" />
                <div className="size-[6px] rounded-full bg-neutral-300" />
                <span className="flex-1 text-center font-mono text-[10px] text-neutral-400">
                  OpenVitals AI Chat
                </span>
                <div className="w-[38px]" />
              </div>

              <div className="p-5 space-y-4">
                {/* User message 1 */}
                <div
                  className="chat-user flex justify-end"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="max-w-[80%] bg-accent-500 px-4 py-2.5 font-display text-[12px] leading-relaxed text-white">
                    How have my lipid panel results changed over the last year?
                  </div>
                </div>

                {/* Typing indicator — visible briefly */}
                <div
                  className="chat-msg flex items-center gap-1 px-2 py-2"
                  style={{ animationDelay: "0.9s" }}
                >
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-accent-500 mr-1">
                    AI
                  </div>
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      className="size-[5px] bg-accent-400"
                      style={{
                        animation: "chatDot 1.2s ease-in-out infinite",
                        animationDelay: `${1.0 + d * 0.15}s`,
                      }}
                    />
                  ))}
                </div>

                {/* AI response */}
                <div className="chat-msg" style={{ animationDelay: "1.8s" }}>
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
                      {
                        prefix: "SRC",
                        label: "6 lipid observations",
                        delay: "2.4s",
                      },
                      {
                        prefix: "RNG",
                        label: "Mar 2025 – Mar 2026",
                        delay: "2.55s",
                      },
                      {
                        prefix: "LAB",
                        label: "Quest + LabCorp",
                        delay: "2.7s",
                      },
                    ].map((t) => (
                      <span
                        key={t.prefix}
                        className="chat-tag inline-flex items-center gap-1 border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[8px]"
                        style={{ animationDelay: t.delay }}
                      >
                        <span className="font-bold text-accent-500">
                          {t.prefix}
                        </span>
                        <span className="text-neutral-500">{t.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* User message 2 — appears late */}
                <div
                  className="chat-user flex justify-end"
                  style={{ animationDelay: "3.2s" }}
                >
                  <div className="max-w-[80%] bg-accent-500 px-4 py-2.5 font-display text-[12px] leading-relaxed text-white">
                    Should I be concerned about triglycerides?
                  </div>
                </div>
              </div>

              {/* Input bar with blinking cursor */}
              <div className="border-t border-neutral-200 px-4 py-2.5 flex items-center gap-2">
                <div className="flex-1 border border-neutral-200 bg-neutral-50 px-3 py-1.5 flex items-center">
                  <span className="font-display text-[11px] text-neutral-400">
                    Ask about your health data
                  </span>
                  <span
                    className="ml-0.5 w-px h-3.5 bg-neutral-900"
                    style={{ animation: "chatBlink 1s step-end infinite" }}
                  />
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

            {["top-[50px] left-[30px]", "bottom-[60px] left-[20px]"].map(
              (pos, i) => (
                <span
                  key={i}
                  className={cn(
                    "absolute text-neutral-300/50 font-light select-none pointer-events-none text-[14px]",
                    pos,
                  )}
                >
                  +
                </span>
              ),
            )}
          </div>
        </div>
      </div>

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
