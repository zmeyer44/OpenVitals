'use client';

import { StepLayout } from '../components/step-layout';
import { StepButtons } from '../components/step-buttons';

interface AboutYouData {
  firstName: string;
  lastName: string;
  dob: string;
  sex: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  bloodType: string;
}

interface AboutYouStepProps {
  data: AboutYouData;
  onChange: (data: AboutYouData) => void;
  onNext: () => void;
  onBack: () => void;
  direction: 1 | -1;
}

const inputClass =
  'w-full border border-neutral-200 bg-white px-3 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100 transition-all';
const labelClass = 'block text-[13px] font-medium text-neutral-700 mb-1.5';
const selectClass =
  'w-full border border-neutral-200 bg-white px-3 py-2.5 text-[14px] text-neutral-900 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100 transition-all appearance-none cursor-pointer';

export function AboutYouStep({ data, onChange, onNext, onBack, direction }: AboutYouStepProps) {
  const update = (field: keyof AboutYouData, value: string) => onChange({ ...data, [field]: value });
  const canContinue = data.firstName.trim() && data.lastName.trim() && data.dob;

  return (
    <StepLayout
      stepKey="about-you"
      direction={direction}
      title="About you"
      subtitle="Basic information that helps us personalize reference ranges and health insights."
      why="Why? Your age and biological sex determine clinical baselines for lab results."
      footer={
        <StepButtons
          onNext={onNext}
          onBack={onBack}
          nextDisabled={!canContinue}
        />
      }
    >
      <div className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First name</label>
            <input type="text" value={data.firstName} onChange={(e) => update('firstName', e.target.value)} className={inputClass} placeholder="First" />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input type="text" value={data.lastName} onChange={(e) => update('lastName', e.target.value)} className={inputClass} placeholder="Last" />
          </div>
        </div>

        {/* DOB */}
        <div>
          <label className={labelClass}>Date of birth</label>
          <input type="date" value={data.dob} onChange={(e) => update('dob', e.target.value)} className={inputClass} />
        </div>

        {/* Biological sex */}
        <div>
          <label className={labelClass}>Biological sex</label>
          <div className="grid grid-cols-3 gap-2">
            {['Male', 'Female', 'Intersex'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => update('sex', s.toLowerCase())}
                className={`border px-3 py-2.5 text-[13px] font-medium transition-all cursor-pointer ${
                  data.sex === s.toLowerCase()
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Height + Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Height</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type="number" value={data.heightFeet} onChange={(e) => update('heightFeet', e.target.value)} className={inputClass + ' pr-8'} placeholder="5" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 font-mono">ft</span>
              </div>
              <div className="relative flex-1">
                <input type="number" value={data.heightInches} onChange={(e) => update('heightInches', e.target.value)} className={inputClass + ' pr-8'} placeholder="10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 font-mono">in</span>
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Weight</label>
            <div className="relative">
              <input type="number" value={data.weight} onChange={(e) => update('weight', e.target.value)} className={inputClass + ' pr-8'} placeholder="160" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 font-mono">lbs</span>
            </div>
          </div>
        </div>

        {/* Blood type */}
        <div>
          <label className={labelClass}>
            Blood type <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => update('bloodType', data.bloodType === bt ? '' : bt)}
                className={`border px-2 py-2 text-[12px] font-semibold transition-all cursor-pointer ${
                  data.bloodType === bt
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
                }`}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}

export type { AboutYouData };
