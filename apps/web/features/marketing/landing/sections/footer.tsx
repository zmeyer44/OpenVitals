import Link from 'next/link';
import { Logo } from '@/assets/app/images/logo';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200/50">
      <div className="mx-auto max-w-[1120px] px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 mb-4">
              <Logo className="size-5" />
              <span className="text-[12px] font-medium text-neutral-700" style={{ fontFamily: 'var(--font-display)' }}>OpenVitals</span>
            </div>
            <p className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-mono)' }}>Your data, your control.</p>
          </div>
          {[
            { title: 'Product', links: ['Labs', 'Medications', 'AI Chat', 'Sharing', 'Uploads'] },
            { title: 'Resources', links: ['Documentation', 'Plugin SDK', 'API Reference', 'Changelog'] },
            { title: 'Company', links: ['About', 'Open Source', 'GitHub', 'Blog'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
          ].map(col => (
            <div key={col.title}>
              <div className="text-[11px] font-medium text-neutral-800 mb-3" style={{ fontFamily: 'var(--font-body)' }}>{col.title}</div>
              <div className="space-y-2">
                {col.links.map(l => (
                  <div key={l} className="text-[12px] text-neutral-500 hover:text-neutral-700 cursor-pointer transition-colors" style={{ fontFamily: 'var(--font-body)' }}>{l}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-neutral-200/50 pt-6">
          <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-mono)' }}>© 2026 OpenVitals</span>
          <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-mono)' }}>v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
