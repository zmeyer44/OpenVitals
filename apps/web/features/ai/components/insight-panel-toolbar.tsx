'use client';

import { X, Download, Share2, FileText } from 'lucide-react';

interface InsightPanelToolbarProps {
  title: string;
  isReady: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function InsightPanelToolbar({ title, isReady, onClose, onDownload, onShare }: InsightPanelToolbarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="size-4 shrink-0 text-accent-500" />
        <span className="truncate text-[13px] font-medium text-neutral-800 font-body">
          {title}
        </span>
        <span className="shrink-0 bg-accent-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-accent-600 font-mono">
          Insight
        </span>
      </div>
      <div className="flex items-center gap-1">
        {isReady && (
          <>
            {onDownload && (
              <button onClick={onDownload} className="flex size-8 items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
                <Download className="size-3.5" />
              </button>
            )}
            {onShare && (
              <button onClick={onShare} className="flex size-8 items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
                <Share2 className="size-3.5" />
              </button>
            )}
            <div className="mx-1 h-4 w-px bg-neutral-200" />
          </>
        )}
        <button onClick={onClose} className="flex size-8 items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
