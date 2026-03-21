'use client';

import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { StepLayout } from '../components/step-layout';
import { StepButtons } from '../components/step-buttons';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface Allergy {
  name: string;
  reaction: string;
}

interface MedicationsData {
  medications: Medication[];
  allergies: Allergy[];
  noMedications: boolean;
  noAllergies: boolean;
}

interface MedicationsStepProps {
  data: MedicationsData;
  onChange: (data: MedicationsData) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  direction: 1 | -1;
}

const inputClass =
  'w-full border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-100 transition-all';

export function MedicationsStep({ data, onChange, onNext, onBack, onSkip, direction }: MedicationsStepProps) {
  const addMed = () => onChange({ ...data, medications: [...data.medications, { name: '', dosage: '', frequency: '' }], noMedications: false });
  const removeMed = (i: number) => onChange({ ...data, medications: data.medications.filter((_, idx) => idx !== i) });
  const updateMed = (i: number, field: keyof Medication, value: string) => {
    const meds = [...data.medications];
    meds[i] = { ...meds[i]!, [field]: value };
    onChange({ ...data, medications: meds });
  };

  const addAllergy = () => onChange({ ...data, allergies: [...data.allergies, { name: '', reaction: '' }], noAllergies: false });
  const removeAllergy = (i: number) => onChange({ ...data, allergies: data.allergies.filter((_, idx) => idx !== i) });
  const updateAllergy = (i: number, field: keyof Allergy, value: string) => {
    const algs = [...data.allergies];
    algs[i] = { ...algs[i]!, [field]: value };
    onChange({ ...data, allergies: algs });
  };

  return (
    <StepLayout
      stepKey="medications"
      direction={direction}
      title="Medications & allergies"
      subtitle="List what you're currently taking and any known allergies."
      why="Why? This helps us flag potential interactions and keep you safe."
      wide
      footer={
        <StepButtons onNext={onNext} onBack={onBack} onSkip={onSkip} showSkip />
      }
    >
      <div className="space-y-6">
        {/* Medications */}
        <div>
          <label className="block text-[13px] font-medium text-neutral-700 mb-2 font-body">
            Current medications
          </label>

          {!data.noMedications && data.medications.length > 0 && (
            <div className="space-y-2 mb-3">
              {data.medications.map((med, i) => (
                <div key={i} className="flex items-start gap-2 border border-neutral-200 bg-white p-3">
                  <div className="grid flex-1 grid-cols-3 gap-2">
                    <input type="text" value={med.name} onChange={(e) => updateMed(i, 'name', e.target.value)} className={inputClass} placeholder="Medication name" />
                    <input type="text" value={med.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} className={inputClass} placeholder="Dosage (e.g. 20mg)" />
                    <input type="text" value={med.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} className={inputClass} placeholder="Frequency" />
                  </div>
                  <button type="button" onClick={() => removeMed(i)} className="mt-1.5 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {!data.noMedications && (
              <button type="button" onClick={addMed} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-600 hover:text-accent-700 cursor-pointer font-body">
                <Plus className="size-3.5" /> Add medication
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange({ ...data, noMedications: !data.noMedications, medications: data.noMedications ? [] : data.medications })}
              className={cn(
                'text-[12px] transition-colors cursor-pointer',
                data.noMedications ? 'text-accent-600 font-medium' : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              {data.noMedications ? '✓ No current medications' : 'I don\'t take any medications'}
            </button>
          </div>
        </div>

        <div className="border-t border-neutral-200" />

        {/* Allergies */}
        <div>
          <label className="block text-[13px] font-medium text-neutral-700 mb-2 font-body">
            Known allergies
          </label>

          {!data.noAllergies && data.allergies.length > 0 && (
            <div className="space-y-2 mb-3">
              {data.allergies.map((alg, i) => (
                <div key={i} className="flex items-start gap-2 border border-neutral-200 bg-white p-3">
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <input type="text" value={alg.name} onChange={(e) => updateAllergy(i, 'name', e.target.value)} className={inputClass} placeholder="Allergen (e.g. Penicillin)" />
                    <input type="text" value={alg.reaction} onChange={(e) => updateAllergy(i, 'reaction', e.target.value)} className={inputClass} placeholder="Reaction (e.g. Rash)" />
                  </div>
                  <button type="button" onClick={() => removeAllergy(i)} className="mt-1.5 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {!data.noAllergies && (
              <button type="button" onClick={addAllergy} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-600 hover:text-accent-700 cursor-pointer font-body">
                <Plus className="size-3.5" /> Add allergy
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange({ ...data, noAllergies: !data.noAllergies, allergies: data.noAllergies ? [] : data.allergies })}
              className={cn(
                'text-[12px] transition-colors cursor-pointer',
                data.noAllergies ? 'text-accent-600 font-medium' : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              {data.noAllergies ? '✓ No known allergies (NKDA)' : 'I have no known allergies'}
            </button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}

export type { MedicationsData };
