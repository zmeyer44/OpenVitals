import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { DashBadge } from "@/components/decorations/dot-badge";

const shares = [
  { name: "Dr. Martinez", target: "dr.martinez@clinic.com", categories: ["LABS", "VITALS", "MEDS", "CONDITIONS"], level: "FULL", expiry: "30 DAYS", lastAccess: "2H AGO" },
  { name: "Nutrition consult", target: "Share link (copied)", categories: ["LABS·LIPIDS", "BODY COMP", "NUTRITION"], level: "TRENDS", expiry: "7 DAYS", lastAccess: "NOT YET" },
];

const navItems = [
  { num: "01", label: "DOCTOR SHARES", active: true },
  { num: "02", label: "SHARE LINKS", active: false },
  { num: "03", label: "EXPORT", active: false },
];

const accessLog = [
  { who: "Dr. Martinez", action: "Viewed lipid panel", when: "2h ago" },
  { who: "Dr. Martinez", action: "Downloaded lab report", when: "2h ago" },
  { who: "System", action: "Share link created", when: "5h ago" },
];

export function Sharing() {
  return (
    <section className="border-t border-neutral-200">
      <style>{`
        @keyframes shareRowIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shareBadgePop {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shareLogSlide {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes sharePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(49, 98, 255, 0.3); }
          50% { box-shadow: 0 0 0 4px rgba(49, 98, 255, 0); }
        }
        .share-row { opacity: 0; animation: shareRowIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .share-badge { opacity: 0; animation: shareBadgePop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .share-log { opacity: 0; animation: shareLogSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ── Left side — animated sharing visual ── */}
        <div className="relative lg:border-r border-neutral-200 bg-[#f2f2f0] overflow-hidden hidden lg:block">
          <div className="px-10 py-14">
            <DashBadge className="mb-6">Share Policies</DashBadge>

            {/* Share policies table */}
            <div
              className="bg-white border border-neutral-200 mb-5"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-neutral-100">
                <div className="size-[6px] rounded-full bg-neutral-300" />
                <div className="size-[6px] rounded-full bg-neutral-300" />
                <div className="size-[6px] rounded-full bg-neutral-300" />
                <span className="flex-1 text-center font-mono text-[10px] text-neutral-400">Active share policies</span>
                <div className="w-[38px]" />
              </div>
              <div className="grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr] gap-2 px-4 py-2 border-b border-neutral-200 bg-neutral-50/60">
                {["RECIPIENT", "CATEGORIES", "LEVEL", "EXPIRES"].map((h) => (
                  <div key={h} className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-neutral-400">{h}</div>
                ))}
              </div>
              {shares.map((s, i) => (
                <div
                  key={s.name}
                  className={cn("share-row grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr] items-start gap-2 px-4 py-3", i < shares.length - 1 && "border-b border-neutral-100")}
                  style={{ animationDelay: `${0.4 + i * 0.3}s` }}
                >
                  <div>
                    <div className="font-display text-[11px] font-medium text-neutral-800">{s.name}</div>
                    <div className="font-mono text-[8px] text-neutral-400 mt-0.5">{s.target}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.categories.map((c, ci) => (
                      <span
                        key={c}
                        className="share-badge border border-accent-200 px-1 py-0.5 font-mono text-[7px] font-bold text-accent-700"
                        style={{ animationDelay: `${0.6 + i * 0.3 + ci * 0.08}s` }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="font-mono text-[9px] font-bold text-neutral-700">{s.level}</div>
                  <div className="font-mono text-[9px] text-neutral-500">{s.expiry}</div>
                </div>
              ))}
            </div>

            {/* Access log — animated entries */}
            <div
              className="bg-white border border-neutral-200"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)" }}
            >
              <div className="px-3.5 py-2 border-b border-neutral-100 flex items-center justify-between">
                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-neutral-400">ACCESS LOG</span>
                <span
                  className="size-[6px] bg-[#16A34A]"
                  style={{ animation: "sharePulse 2s ease-in-out infinite" }}
                />
              </div>
              {accessLog.map((log, i) => (
                <div
                  key={i}
                  className={cn("share-log px-3.5 py-2 flex items-center justify-between", i < accessLog.length - 1 && "border-b border-neutral-100")}
                  style={{ animationDelay: `${1.6 + i * 0.2}s` }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[8px] font-bold text-neutral-700 shrink-0">{log.who}</span>
                    <span className="font-display text-[9px] text-neutral-500 truncate">{log.action}</span>
                  </div>
                  <span className="font-mono text-[8px] text-neutral-300 shrink-0 ml-2">{log.when}</span>
                </div>
              ))}
            </div>

            {["top-[50px] left-[30px]", "bottom-[40px] left-[20px]"].map((pos, i) => (
              <span key={i} className={cn("absolute text-neutral-300/50 font-light select-none pointer-events-none text-[14px]", pos)}>+</span>
            ))}
          </div>
        </div>

        {/* ── Right side — text ── */}
        <div className="lg:mr-auto lg:max-w-[640px] w-full px-6 md:px-10 py-14 lg:py-20">
          <DashBadge className="mb-8">Sharing</DashBadge>
          <h2 className="font-display text-[32px] md:text-[40px] font-medium tracking-[-0.03em] leading-[1.1] text-neutral-900">
            Share exactly what
            <br />
            your doctor needs.
          </h2>
          <p className="mt-5 font-mono text-[14px] text-neutral-400 leading-[1.65] max-w-[440px]">
            Create scoped shares by category, time range, and access level. Your
            cardiologist sees lipids and vitals. Nobody sees what they shouldn&apos;t.
          </p>

          <div className="mt-10 border border-neutral-200 bg-white">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
              <div className="size-[7px] rounded-full bg-accent-500" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">01 – Doctor Share</span>
            </div>
            <div className="px-5 py-4 border-b border-neutral-100">
              <div className="border border-neutral-200 px-4 py-3">
                <div className="font-display text-[13px] font-medium text-neutral-800">Dr. Martinez — Cardiology</div>
                <div className="font-mono text-[10px] text-neutral-400 mt-0.5">dr.martinez@clinic.com</div>
                <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
                  <div>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-400">CATEGORIES</div>
                    <div className="font-mono text-[11px] font-bold text-neutral-900 mt-0.5">4</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-400">ACCESS</div>
                    <div className="font-mono text-[11px] font-bold text-accent-600 mt-0.5">FULL</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-neutral-400">EXPIRES</div>
                    <div className="font-mono text-[11px] font-bold text-neutral-600 mt-0.5">30 days</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-5">
              <h3 className="font-display text-[18px] font-medium text-neutral-900">Scoped data access</h3>
              <p className="mt-2 font-display text-[14px] text-neutral-500 leading-[1.6]">
                Create time-limited shares filtered by category. Your cardiologist sees labs and vitals. Your nutritionist sees diet-related labs. Full audit trail on every access.
              </p>
              <Link href="/register">
                <Button text="Learn more →" variant="default" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5 md:gap-8">
            {navItems.map((item) => (
              <span key={item.num} className={cn("font-mono text-[11px] uppercase tracking-[0.06em]", item.active ? "font-bold text-accent-500" : "text-neutral-400")}>
                {item.num} {item.label}
              </span>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-8">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-900">Doctor Shares</span>
            <span className="font-display text-[14px] text-neutral-500">Scoped data access</span>
          </div>
        </div>
      </div>
    </section>
  );
}
