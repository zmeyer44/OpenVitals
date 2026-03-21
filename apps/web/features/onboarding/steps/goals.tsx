'use client';

import { cn } from '@/lib/utils';
import { StepLayout } from '../components/step-layout';
import { StepButtons } from '../components/step-buttons';
import { Check } from 'lucide-react';

interface GoalsData {
  reasons: string[];
  priorities: string[];
  wearables: string[];
}

interface GoalsStepProps {
  data: GoalsData;
  onChange: (data: GoalsData) => void;
  onNext: () => void;
  onBack: () => void;
  direction: 1 | -1;
}

const reasons = [
  { id: 'understand_labs', label: 'Understand my lab results', icon: '◎' },
  { id: 'track_conditions', label: 'Manage a chronic condition', icon: '⊡' },
  { id: 'track_meds', label: 'Track medications & adherence', icon: '◉' },
  { id: 'share_providers', label: 'Share data with my doctors', icon: '⊞' },
  { id: 'preventive', label: 'Stay on top of preventive care', icon: '⊟' },
  { id: 'family_risk', label: 'Understand family health risks', icon: '↔' },
  { id: 'ai_insights', label: 'Get AI-powered health insights', icon: '◆' },
  { id: 'own_data', label: 'Own and control my health data', icon: '✓' },
  { id: 'fitness', label: 'Improve fitness & nutrition', icon: '↑' },
  { id: 'weight', label: 'Manage weight', icon: '⚖' },
];

const wearableOptions = [
  'Apple Watch', 'Fitbit', 'Oura Ring', 'Garmin', 'Whoop', 'CGM (Dexcom/Libre)', 'Withings', 'None',
];

function ChipToggle({ label, icon, selected, onClick }: { label: string; icon?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 border px-3.5 py-2.5 text-[13px] font-medium transition-all cursor-pointer text-left',
        selected
          ? 'border-accent-500 bg-accent-50 text-accent-700'
          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
      )}
    >
      {icon && (
        <span className="text-[14px] opacity-70 font-mono">{icon}</span>
      )}
      <span className="flex-1">{label}</span>
      {selected && <Check className="size-3.5 text-accent-500 shrink-0" />}
    </button>
  );
}

export function GoalsStep({ data, onChange, onNext, onBack, direction }: GoalsStepProps) {
  const toggleReason = (id: string) => {
    const next = data.reasons.includes(id)
      ? data.reasons.filter((r) => r !== id)
      : [...data.reasons, id];
    onChange({ ...data, reasons: next });
  };

  const toggleWearable = (w: string) => {
    const next = data.wearables.includes(w)
      ? data.wearables.filter((x) => x !== w)
      : [...data.wearables, w];
    onChange({ ...data, wearables: next });
  };

  return (
    <StepLayout
      stepKey="goals"
      direction={direction}
      title="What brings you to OpenVitals?"
      subtitle="Select everything that applies. This helps us customize your dashboard and recommendations."
      why="Why? We'll prioritize features and insights based on your goals."
      wide
      footer={
        <StepButtons
          onNext={onNext}
          onBack={onBack}
          nextDisabled={data.reasons.length === 0}
        />
      }
    >
      <div className="space-y-6">
        {/* Reasons */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {reasons.map((r) => (
            <ChipToggle
              key={r.id}
              label={r.label}
              icon={r.icon}
              selected={data.reasons.includes(r.id)}
              onClick={() => toggleReason(r.id)}
            />
          ))}
        </div>

        {/* Wearables */}
        <div>
          <label
            className="block text-[13px] font-medium text-neutral-700 mb-2 font-body"
          >
            Do you use any wearable devices? <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {wearableOptions.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => toggleWearable(w)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all cursor-pointer',
                  data.wearables.includes(w)
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
                )}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}

export type { GoalsData };
