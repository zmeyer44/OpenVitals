'use client';

import { Logo } from '@/assets/app/images/logo';
import { ChatInput } from './chat-input';

interface InitialViewProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onSuggestionClick: (suggestion: string) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const suggestions = [
  'How have my lipid results changed this year?',
  'Summarize my most recent lab results',
  'Are any of my medications interacting?',
  'What trends should I discuss with my doctor?',
];

export function InitialView({ input, onInputChange, onSubmit, onSuggestionClick }: InitialViewProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <Logo className="mx-auto mb-5 size-14" />
          <h1 className="text-[28px] font-medium tracking-[-0.025em] text-neutral-900 font-display">
            {getGreeting()}
          </h1>
          <p className="mt-2 text-[15px] text-neutral-500 font-body">
            Ask me anything about your health records.
          </p>
        </div>

        <ChatInput value={input} onChange={onInputChange} onSubmit={onSubmit} autoFocus className="px-0 pb-0" />

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestionClick(s)}
              className="border border-neutral-200 bg-white px-3.5 py-2 text-[12px] text-neutral-600 transition-all hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700 active:scale-[0.98] font-body"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
