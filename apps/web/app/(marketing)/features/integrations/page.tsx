import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/button';
import Image, { type StaticImageData } from 'next/image';
import {
  Watch,
  Activity,
  CircleGauge,
  CircleDot,
  Zap,
  Heart,
  Smartphone,
  TestTubes,
  FlaskConical,
  FileHeart,
  Hospital,
  Shield,
  RefreshCw,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Nav } from '@/features/marketing/landing/sections/nav';
import { Footer } from '@/features/marketing/landing/sections/footer';
import { Logo } from '@/assets/app/images/logo';

import whoopIcon from '@/assets/marketing/brand-logos/whoop-icon.jpeg';
import appleIcon from '@/assets/marketing/brand-logos/apple-icon.png';
import fitbitIcon from '@/assets/marketing/brand-logos/fitbit-icon.png';
import garminIcon from '@/assets/marketing/brand-logos/garmin-icon.jpeg';
import ouraIcon from '@/assets/marketing/brand-logos/oura-icon.jpeg';
import questIcon from '@/assets/marketing/brand-logos/quest-icon.png';
import labcorpIcon from '@/assets/marketing/brand-logos/labcorp-icon.png';
import epicIcon from '@/assets/marketing/brand-logos/epic-icon.png';
import cernerIcon from '@/assets/marketing/brand-logos/cerner-icon.png';

export const metadata: Metadata = {
  title: 'Integrations | OpenVitals',
  description:
    'Connect your wearables, health platforms, and lab services. Sync data from Whoop, Apple Watch, Fitbit, Garmin, Oura, Quest, LabCorp, and more.',
};

/* ── Provider catalog ── */

interface Provider {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
  brandIcon?: StaticImageData;
  color: string;
  dataTypes: string[];
}

const providers: Provider[] = [
  { id: 'whoop', name: 'Whoop', description: 'Strain tracking, recovery analysis, and sleep performance', category: 'Wearables', icon: Zap, brandIcon: whoopIcon, color: 'text-amber-600', dataTypes: ['Strain', 'Recovery', 'Sleep', 'HRV'] },
  { id: 'apple-watch', name: 'Apple Watch', description: 'Heart rate, activity, sleep, and ECG data', category: 'Wearables', icon: Watch, brandIcon: appleIcon, color: 'text-rose-600', dataTypes: ['Heart Rate', 'Steps', 'Sleep', 'ECG'] },
  { id: 'fitbit', name: 'Fitbit', description: 'Activity tracking, sleep analysis, and heart rate monitoring', category: 'Wearables', icon: Activity, brandIcon: fitbitIcon, color: 'text-teal-600', dataTypes: ['Steps', 'Sleep', 'Heart Rate', 'SpO2'] },
  { id: 'garmin', name: 'Garmin', description: 'GPS tracking, performance metrics, and health monitoring', category: 'Wearables', icon: CircleGauge, brandIcon: garminIcon, color: 'text-sky-600', dataTypes: ['GPS', 'Heart Rate', 'VO2 Max', 'Steps'] },
  { id: 'oura-ring', name: 'Oura Ring', description: 'Sleep tracking, readiness scores, and temperature trends', category: 'Wearables', icon: CircleDot, brandIcon: ouraIcon, color: 'text-violet-600', dataTypes: ['Sleep', 'HRV', 'Temperature', 'Readiness'] },
  { id: 'apple-health', name: 'Apple Health', description: 'Centralized health data from all your Apple devices', category: 'Platforms', icon: Heart, brandIcon: appleIcon, color: 'text-pink-600', dataTypes: ['Vitals', 'Activity', 'Nutrition', 'Sleep'] },
  { id: 'google-health-connect', name: 'Google Health Connect', description: 'Unified health data from Android apps and devices', category: 'Platforms', icon: Smartphone, color: 'text-emerald-600', dataTypes: ['Activity', 'Vitals', 'Sleep', 'Nutrition'] },
  { id: 'quest-diagnostics', name: 'Quest Diagnostics', description: 'Lab test results and diagnostic reports', category: 'Lab Services', icon: TestTubes, brandIcon: questIcon, color: 'text-orange-600', dataTypes: ['Blood Work', 'Metabolic', 'Lipid Panel'] },
  { id: 'labcorp', name: 'Labcorp', description: 'Laboratory testing results and health screening data', category: 'Lab Services', icon: FlaskConical, brandIcon: labcorpIcon, color: 'text-cyan-600', dataTypes: ['Blood Work', 'Urinalysis', 'Hormones'] },
  { id: 'epic-mychart', name: 'Epic MyChart', description: 'Medical records and visit summaries from Epic providers', category: 'Medical Records', icon: FileHeart, brandIcon: epicIcon, color: 'text-fuchsia-600', dataTypes: ['Records', 'Rx', 'Labs', 'Visits'] },
  { id: 'cerner', name: 'Cerner', description: 'Electronic health records and clinical data', category: 'Medical Records', icon: Hospital, brandIcon: cernerIcon, color: 'text-slate-600', dataTypes: ['Records', 'Labs', 'Imaging', 'Notes'] },
];

const steps = [
  { number: '01', title: 'Choose your source', description: 'Browse our integration catalog and pick from wearables, health platforms, lab services, or medical records systems.', icon: Activity },
  { number: '02', title: 'Authorize securely', description: 'Sign in through the provider\'s own OAuth flow. We never see or store your password — only a scoped access token.', icon: Shield },
  { number: '03', title: 'Sync automatically', description: 'Data flows in automatically. Sync on demand or let OpenVitals pull new observations on a schedule.', icon: RefreshCw },
  { number: '04', title: 'Track and analyze', description: 'View trends, compare metrics across sources, and get AI-powered insights — all from a single dashboard.', icon: BarChart3 },
];

function ProviderCard({ provider }: { provider: Provider }) {
  const Icon = provider.icon;
  const hasBrandIcon = !!provider.brandIcon;
  return (
    <div className="border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-900">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200">
          {hasBrandIcon ? (
            <Image src={provider.brandIcon!} alt={provider.name} className="h-full w-full object-cover" width={36} height={36} />
          ) : (
            <Icon className={`h-[18px] w-[18px] ${provider.color}`} />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-[14px] font-medium text-neutral-900">{provider.name}</h3>
          <p className="font-display text-[12px] text-neutral-500 mt-0.5 line-clamp-1">{provider.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-3">
        {provider.dataTypes.map((type) => (
          <span key={type} className="border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-neutral-500">
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Page ── */

export default function FeaturesIntegrationsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-[1280px] px-6 md:px-10 pt-20 md:pt-28 pb-14 md:pb-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="size-[7px] rounded-full bg-accent-500" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-900">
              Integrations
            </span>
          </div>
          <h1 className="font-display text-[36px] md:text-[52px] font-medium tracking-[-0.035em] leading-[1.05] text-neutral-900">
            Connect your devices.
            <br />
            Unify your health data.
          </h1>
          <p className="mt-6 font-mono text-[14px] text-neutral-400 leading-[1.65] max-w-lg">
            OpenVitals integrates with the wearables, health platforms,
            lab services, and medical records systems you already use.
            One dashboard for all your health data.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <Link href="/register">
              <Button text="Get started for free" variant="default" size="lg" />
            </Link>
            <Link href="/">
              <Button text="Back to home →" variant="ghost" size="lg" />
            </Link>
          </div>
        </div>
      </section>

      {/* Provider grid */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-14 lg:py-20">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="size-[7px] rounded-full bg-accent-500" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-900">
              Supported Integrations
            </span>
          </div>
          <h2 className="font-display text-[32px] md:text-[40px] font-medium tracking-[-0.03em] leading-[1.1] text-neutral-900">
            11 providers and counting
          </h2>
          <p className="mt-4 font-mono text-[14px] text-neutral-400 leading-[1.65] max-w-lg">
            From wrist-worn wearables to hospital EHR systems —
            connect the sources that matter to you.
          </p>

          {(['Wearables', 'Platforms', 'Lab Services', 'Medical Records'] as const).map((cat) => {
            const catProviders = providers.filter((p) => p.category === cat);
            if (catProviders.length === 0) return null;
            return (
              <div key={cat} className="mt-8 first:mt-10">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 mb-3">{cat}</div>
                <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3 border border-neutral-200">
                  {catProviders.map((p) => (
                    <ProviderCard key={p.id} provider={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-900">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-neutral-800 py-14 lg:py-20">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={cn(
                    "pb-8 md:pb-0",
                    i > 0 && "border-t md:border-t-0 md:border-l border-neutral-800 pt-8 md:pt-0 md:pl-8",
                    i < steps.length - 1 && "md:pr-8",
                  )}
                >
                  <div className="font-mono text-[11px] font-bold text-accent-400 mb-3">{step.number}</div>
                  <div className="size-8 border border-neutral-700 flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 text-neutral-400" />
                  </div>
                  <h3 className="font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-white mb-2">{step.title}</h3>
                  <p className="font-display text-[14px] text-neutral-500 leading-[1.6]">{step.description}</p>
                </div>
              );
            })}
          </div>
          <div className="py-14 lg:py-20">
            <h2 className="font-display text-[32px] md:text-[44px] font-medium tracking-[-0.03em] leading-[1.1] text-white max-w-2xl">
              Connected in under a minute.
              <br />
              No API keys. No CSV exports.
            </h2>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-14 lg:py-20">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="size-[7px] rounded-full bg-accent-500" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-900">
              Security
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 border border-neutral-200 bg-white">
            {[
              { title: 'OAuth 2.0 everywhere', desc: 'We use industry-standard OAuth flows. Your provider credentials never touch our servers — only scoped tokens with minimum required permissions.' },
              { title: 'Encrypted at rest', desc: 'All access tokens are encrypted with AES-256-GCM before storage. Even if our database were breached, tokens remain unreadable.' },
              { title: 'Revoke anytime', desc: 'Disconnect an integration with one click. We immediately delete the token and stop all syncing. Your data on the provider side is never modified.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className={cn(
                  "p-5",
                  i < 2 && "border-b md:border-b-0 md:border-r border-neutral-200",
                )}
              >
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-accent-500 mb-2">Security</div>
                <h4 className="font-display text-[15px] font-medium text-neutral-900 tracking-[-0.01em] leading-snug">
                  {item.title}
                </h4>
                <p className="mt-2 font-display text-[13px] leading-[1.6] text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 py-14 lg:py-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="bg-neutral-900 px-8 md:px-12 py-12 md:py-16 max-w-md">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2.5">
                <div className="size-[7px] rounded-full bg-accent-500" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                  Get Started
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                Connect Now
              </span>
            </div>
            <Logo className="size-8 text-white mb-6" />
            <h2 className="font-display text-[28px] md:text-[32px] font-medium tracking-[-0.03em] leading-[1.1] text-white">
              Ready to connect your
              <br />
              health data?
            </h2>
            <Link href="/register">
              <Button text="Get started for free →" className="bg-white text-neutral-900 hover:bg-neutral-100" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
