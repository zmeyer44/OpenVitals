'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogoWordmark } from '@/assets/app/images/logo';
import { trpc } from '@/lib/trpc/client';
import { useSession } from '@/lib/auth/client';
import { ProgressBar } from './components/progress-bar';
import { WelcomeStep } from './steps/welcome';
import { AboutYouStep, type AboutYouData } from './steps/about-you';
import { GoalsStep, type GoalsData } from './steps/goals';
import { MedicalHistoryStep, type MedicalHistoryData } from './steps/medical-history';
import { MedicationsStep, type MedicationsData } from './steps/medications';
import { FamilyHistoryStep, type FamilyHistoryData } from './steps/family-history';
import { LifestyleStep, type LifestyleData } from './steps/lifestyle';
import { UploadRecordsStep, type UploadRecordsData } from './steps/upload-records';
import { CompleteStep } from './steps/complete';

const STEP_NAMES = ['Welcome', 'About You', 'Goals', 'Medical History', 'Medications', 'Family History', 'Lifestyle', 'Upload Records', 'Complete'] as const;
const TOTAL_TRACKED_STEPS = 7; // steps 1–7 (not welcome/complete)
const ONBOARDING_COMPLETE = 9; // step index that marks onboarding done

interface OnboardingState {
  aboutYou: AboutYouData;
  goals: GoalsData;
  medicalHistory: MedicalHistoryData;
  medications: MedicationsData;
  familyHistory: FamilyHistoryData;
  lifestyle: LifestyleData;
  uploadRecords: UploadRecordsData;
}

const initialState: OnboardingState = {
  aboutYou: { firstName: '', lastName: '', dob: '', sex: '', heightFeet: '', heightInches: '', weight: '', bloodType: '' },
  goals: { reasons: [], priorities: [], wearables: [] },
  medicalHistory: { conditions: [] },
  medications: { medications: [], allergies: [], noMedications: false, noAllergies: false },
  familyHistory: { history: {} },
  lifestyle: { smoking: '', alcohol: '', exerciseDays: '', exerciseType: [], diet: '', sleepHours: '', stressLevel: '' },
  uploadRecords: { files: [] },
};

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<number | null>(null); // null = loading
  const [direction, setDirection] = useState<1 | -1>(1);
  const [data, setData] = useState<OnboardingState>(initialState);
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const initialized = useRef(false);

  const { data: session } = useSession();
  const { data: prefs, isLoading } = trpc.preferences.get.useQuery();
  const updatePreferences = trpc.preferences.update.useMutation();

  // Initialize step from saved onboardingStep
  useEffect(() => {
    if (!isLoading && prefs && !initialized.current) {
      initialized.current = true;
      setStep(prefs.onboardingStep);
    }
  }, [isLoading, prefs]);

  // Prefill first/last name from session if still empty
  useEffect(() => {
    const name = session?.user?.name;
    if (!name) return;
    setData((prev) => {
      if (prev.aboutYou.firstName || prev.aboutYou.lastName) return prev;
      const parts = name.trim().split(/\s+/);
      const firstName = parts[0] ?? '';
      const lastName = parts.slice(1).join(' ');
      return { ...prev, aboutYou: { ...prev.aboutYou, firstName, lastName } };
    });
  }, [session?.user?.name]);

  const persistStep = useCallback((nextStep: number) => {
    updatePreferences.mutate({ onboardingStep: nextStep });
  }, [updatePreferences]);

  const persistAboutYou = useCallback((aboutYou: AboutYouData) => {
    const update: Record<string, string> = {};
    if (aboutYou.dob) update.dateOfBirth = aboutYou.dob;
    if (aboutYou.sex) update.biologicalSex = aboutYou.sex;
    if (aboutYou.bloodType) update.bloodType = aboutYou.bloodType;
    if (Object.keys(update).length > 0) {
      updatePreferences.mutate(update as any);
    }
  }, [updatePreferences]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => {
      const next = Math.min((s ?? 0) + 1, STEP_NAMES.length - 1);
      persistStep(next);
      return next;
    });
  }, [persistStep]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max((s ?? 0) - 1, 0));
  }, []);

  const skip = useCallback(() => {
    setSkippedSteps((prev) => new Set(prev).add(step ?? 0));
    goNext();
  }, [step, goNext]);

  const handleComplete = useCallback(() => {
    persistStep(ONBOARDING_COMPLETE);
    router.push('/home');
  }, [persistStep, router]);

  const completedSections = (() => {
    const sections: string[] = [];
    if (data.aboutYou.firstName) sections.push('About You');
    if (data.goals.reasons.length > 0) sections.push('Goals');
    if (data.medicalHistory.conditions.length > 0 || skippedSteps.has(3)) sections.push('Medical History');
    if (data.medications.medications.length > 0 || data.medications.noMedications || data.medications.noAllergies || skippedSteps.has(4)) sections.push('Medications');
    if (Object.keys(data.familyHistory.history).length > 0 || skippedSteps.has(5)) sections.push('Family History');
    if (data.lifestyle.smoking || skippedSteps.has(6)) sections.push('Lifestyle');
    if (data.uploadRecords.files.length > 0 || skippedSteps.has(7)) sections.push('Uploads');
    return sections;
  })();

  // Show nothing while loading saved step
  if (step === null) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#FAF9F7' }}>
      {/* Header */}
      {step > 0 && step < STEP_NAMES.length - 1 && (
        <div className="shrink-0">
          {/* Top bar */}
          <div className="flex h-12 items-center justify-between px-6">
            <LogoWordmark
              logoProps={{ className: "size-6" }}
              workmarkProps={{ className: "text-[14px]" }}
            />
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-neutral-400 font-mono">
                Step {step} of {TOTAL_TRACKED_STEPS}
              </span>
            </div>
          </div>
          {/* Progress */}
          <ProgressBar currentStep={step - 1} totalSteps={TOTAL_TRACKED_STEPS} />
        </div>
      )}

      {/* Steps */}
      {step === 0 && <WelcomeStep onNext={goNext} />}

      {step === 1 && (
        <AboutYouStep
          data={data.aboutYou}
          onChange={(d) => setData((prev) => ({ ...prev, aboutYou: d }))}
          onNext={() => {
            persistAboutYou(data.aboutYou);
            goNext();
          }}
          onBack={goBack}
          direction={direction}
        />
      )}

      {step === 2 && (
        <GoalsStep
          data={data.goals}
          onChange={(d) => setData((prev) => ({ ...prev, goals: d }))}
          onNext={goNext}
          onBack={goBack}
          direction={direction}
        />
      )}

      {step === 3 && (
        <MedicalHistoryStep
          data={data.medicalHistory}
          onChange={(d) => setData((prev) => ({ ...prev, medicalHistory: d }))}
          onNext={goNext}
          onBack={goBack}
          onSkip={skip}
          direction={direction}
        />
      )}

      {step === 4 && (
        <MedicationsStep
          data={data.medications}
          onChange={(d) => setData((prev) => ({ ...prev, medications: d }))}
          onNext={goNext}
          onBack={goBack}
          onSkip={skip}
          direction={direction}
        />
      )}

      {step === 5 && (
        <FamilyHistoryStep
          data={data.familyHistory}
          onChange={(d) => setData((prev) => ({ ...prev, familyHistory: d }))}
          onNext={goNext}
          onBack={goBack}
          onSkip={skip}
          direction={direction}
        />
      )}

      {step === 6 && (
        <LifestyleStep
          data={data.lifestyle}
          onChange={(d) => setData((prev) => ({ ...prev, lifestyle: d }))}
          onNext={goNext}
          onBack={goBack}
          onSkip={skip}
          direction={direction}
        />
      )}

      {step === 7 && (
        <UploadRecordsStep
          data={data.uploadRecords}
          onChange={(d) => setData((prev) => ({ ...prev, uploadRecords: d }))}
          onNext={goNext}
          onBack={goBack}
          onSkip={skip}
          direction={direction}
        />
      )}

      {step === 8 && (
        <CompleteStep
          completedSections={completedSections}
          totalSections={TOTAL_TRACKED_STEPS}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
