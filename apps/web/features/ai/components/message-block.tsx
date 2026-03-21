import { cn } from '@/lib/utils';
import { Logo } from '@/assets/app/images/logo';
import { ProvenancePill } from '@/components/health/provenance-pill';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ label: string; icon: string }>;
  artifactId?: string;
}

interface MessageBlockProps {
  message: ChatMessageData;
  onArtifactClick?: (id: string) => void;
}

export function MessageBlock({ message, onArtifactClick }: MessageBlockProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 px-4 py-4', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      {isUser ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
          U
        </div>
      ) : (
        <Logo className="size-8 shrink-0" />
      )}

      <div className={cn('flex max-w-[85%] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        {!isUser && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-accent-500 font-mono">
            OpenVitals AI
          </span>
        )}

        {/* Artifact card */}
        {!isUser && message.artifactId && (
          <button
            onClick={() => onArtifactClick?.(message.artifactId!)}
            className="flex w-full items-center gap-3 border border-accent-200 bg-accent-50 p-3.5 text-left transition-all hover:border-accent-300"
          >
            <div className="flex size-9 shrink-0 items-center justify-center bg-accent-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent-600">
                <path d="M9 17H7A5 5 0 017 7h2M15 7h2a5 5 0 010 10h-2M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-medium text-accent-800 font-body">Health Insight Generated</div>
              <div className="text-[11px] text-accent-500 font-mono">Click to view in panel &rarr;</div>
            </div>
          </button>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-4 py-3 font-body text-[14px] leading-[1.65] tracking-[0.005em]',
            isUser
              ? 'rounded-[16px_16px_4px_16px] bg-accent-500 text-white'
              : 'rounded-[4px_16px_16px_16px] border border-neutral-200 bg-white text-neutral-800'
          )}
        >
          {message.content}
        </div>

        {/* Provenance sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((s, i) => (
              <ProvenancePill key={i} label={s.label} icon={s.icon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
