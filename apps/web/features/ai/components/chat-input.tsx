'use client';

import { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isStreaming?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming = false,
  placeholder = 'Ask about your health data...',
  autoFocus = false,
  className,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) textareaRef.current.focus();
  }, [autoFocus]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim() && !isStreaming) {
      e.preventDefault();
      onSubmit();
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isStreaming) {
      onSubmit();
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('px-4 pb-4', className)}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 transition-all focus-within:border-accent-300 focus-within:ring-2 focus-within:ring-accent-100">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="max-h-[200px] min-h-[26px] flex-1 resize-none bg-transparent text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 focus:shadow-none! font-body"
          />
          {isStreaming ? (
            <button type="button" onClick={onStop} className="flex size-8 shrink-0 items-center justify-center bg-neutral-900 text-white transition-all hover:bg-neutral-800 active:scale-95">
              <Square className="size-3" fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex size-8 shrink-0 items-center justify-center text-white transition-all active:scale-95 disabled:opacity-30"
              style={{ background: value.trim() ? 'linear-gradient(135deg, #3162FF, #2750D9)' : '#D6DCFF' }}
            >
              <ArrowUp className="size-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[10px] text-neutral-400 font-mono">
          AI responses are grounded in your health records. Not medical advice.
        </p>
      </div>
    </form>
  );
}
