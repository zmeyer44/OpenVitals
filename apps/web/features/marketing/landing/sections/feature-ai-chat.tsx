import Link from 'next/link';
import { Logo } from '@/assets/app/images/logo';

export function FeatureAiChat() {
  return (
    <section className="border-t border-neutral-200/50">
      <div className="mx-auto max-w-[1120px] px-6 py-20">
        {/* Live AI chat UI over placeholder background */}
        <div className="relative mx-auto max-w-[750px] rounded-xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(145deg, #DDD8CE 0%, #E2DDD3 50%, #D8D5CB 100%)' }} />
          <div className="relative z-10 p-5 md:p-6">
            {/* Chat UI */}
            <div className="rounded-lg border border-neutral-200/80 bg-white overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex justify-end">
                  <div className="max-w-[70%] rounded-[12px_12px_4px_12px] bg-accent-500 px-3 py-2 text-[11px] leading-relaxed text-white" style={{ fontFamily: 'var(--font-body)' }}>
                    How have my lipid panel results changed over the last year?
                  </div>
                </div>
                <div className="flex gap-2">
                  <Logo className="size-5 shrink-0 text-accent-600" />
                  <div className="space-y-1.5">
                    <span className="text-[7px] font-semibold uppercase tracking-[0.06em] text-accent-500" style={{ fontFamily: 'var(--font-mono)' }}>OpenVitals AI</span>
                    <div className="rounded-[4px_12px_12px_12px] border border-neutral-200 bg-white px-3 py-2 text-[11px] leading-[1.6] text-neutral-700" style={{ fontFamily: 'var(--font-body)' }}>
                      Your lipid panel shows meaningful improvement. LDL dropped from 142 to <strong>98 mg/dL</strong> — now within optimal range. However, triglycerides trended up to <strong>162 mg/dL</strong>.
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['◎ 6 observations', '◷ Mar 2025–2026', '⟐ Quest + LabCorp'].map(p => (
                        <span key={p} className="rounded bg-secondary-50 border border-secondary-200 px-1.5 py-0.5 text-[7px] text-neutral-500" style={{ fontFamily: 'var(--font-mono)' }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Input */}
              <div className="border-t border-neutral-100 px-3 py-2 flex items-center gap-2">
                <div className="flex-1 rounded-lg bg-neutral-50 px-3 py-1.5">
                  <span className="text-[10px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>Ask about your health data...</span>
                </div>
                <div className="flex size-6 items-center justify-center rounded-md" style={{ background: 'linear-gradient(135deg, #3162FF, #2750D9)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h2 className="text-[24px] font-medium tracking-[-0.02em] text-neutral-900 leading-[1.25]" style={{ fontFamily: 'var(--font-display)' }}>
              AI that only speaks from your records
            </h2>
            <p className="mt-3 text-[14px] leading-[1.7] text-neutral-500" style={{ fontFamily: 'var(--font-body)' }}>
              Ask questions about your health data and get answers grounded in your actual observations. Every response cites the data it used.
            </p>
            <Link href="/register" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent-600 hover:text-accent-700 transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
              Learn about AI chat →
            </Link>
          </div>
          <div>
            <h2 className="text-[24px] font-medium tracking-[-0.02em] text-neutral-900 leading-[1.25]" style={{ fontFamily: 'var(--font-display)' }}>
              Works across all your sources
            </h2>
            <p className="mt-3 text-[14px] leading-[1.7] text-neutral-500" style={{ fontFamily: 'var(--font-body)' }}>
              AI context bundles pull observations from Quest, LabCorp, manual entries, and wearable exports. One unified view across all your health data.
            </p>
            <Link href="/register" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent-600 hover:text-accent-700 transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
              Learn about context bundling →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
