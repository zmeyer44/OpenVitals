'use client';

import { useState, useCallback } from 'react';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@openvitals/common';
import { trpc } from '@/lib/trpc/client';
import { TitleActionHeader } from '@/components/title-action-header';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { StatusBadge } from '@/components/health/status-badge';
import { AnimatedEmptyState } from '@/components/animated-empty-state';
import { formatRelativeTime } from '@/lib/health-utils';
import { DOC_TYPE_LABELS, IMPORT_JOB_STATUS_MAP } from '@/lib/constants';
import { FileText, FileUp, FileScan, FileCheck, FileSearch, FileArchive, Trash2 } from 'lucide-react';

const emptyIcons = [FileText, FileUp, FileScan, FileCheck, FileSearch, FileArchive];

type ImportJob = {
  id: string;
  status: string;
  classifiedType: string | null;
  classificationConfidence: number | null;
  extractionCount: number | null;
  needsReview: boolean | null;
  errorMessage: string | null;
  createdAt: Date | null;
  parseCompletedAt: Date | null;
  completedAt: Date | null;
  fileName: string;
  mimeType: string;
  fileSize: number | null;
};

const importColumns: DataTableColumn<ImportJob>[] = [
  {
    id: 'file',
    header: 'File',
    width: '1.8fr',
    cell: (job) => (
      <div>
        <div className="text-sm font-medium text-neutral-900 font-body">{job.fileName}</div>
        <div className="mt-0.5 text-[11px] text-neutral-400 font-mono">
          {job.createdAt ? formatRelativeTime(job.createdAt) : '—'}
        </div>
      </div>
    ),
  },
  {
    id: 'docType',
    header: 'Document type',
    width: '1fr',
    cell: (job) => (
      <span className="text-xs text-neutral-600 font-mono">
        {DOC_TYPE_LABELS[job.classifiedType ?? ''] ?? job.classifiedType ?? '—'}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    width: '0.8fr',
    cell: (job) => {
      const s = IMPORT_JOB_STATUS_MAP[job.status] ?? IMPORT_JOB_STATUS_MAP.completed!;
      return <StatusBadge status={s.badge} label={s.label} />;
    },
  },
  {
    id: 'confidence',
    header: 'Confidence',
    width: '0.6fr',
    cell: (job) => (
      <span className="text-xs text-neutral-500 font-mono">
        {job.classificationConfidence != null ? job.classificationConfidence.toFixed(2) : '—'}
      </span>
    ),
  },
  {
    id: 'extracted',
    header: 'Extracted',
    width: '0.8fr',
    align: 'right',
    cell: (job) => (
      <span className="text-[13px] font-semibold text-accent-600 font-mono">
        {job.extractionCount != null ? `${job.extractionCount} records` : '— records'}
      </span>
    ),
  },
];

export default function UploadsPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: jobsData, isLoading: jobsLoading } = trpc.importJobs.list.useQuery({ limit: 20 }, {
    refetchInterval: (query) => {
      const items = query.state.data?.items;
      if (!items) return false;
      const activeStatuses = new Set(['pending', 'classifying', 'parsing', 'normalizing']);
      return items.some((job) => activeStatuses.has(job.status)) ? 3000 : false;
    },
  });
  const createImport = trpc.importJobs.create.useMutation();
  const deleteImport = trpc.importJobs.delete.useMutation({
    onSuccess: () => utils.importJobs.list.invalidate(),
  });
  const utils = trpc.useUtils();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) return `Unsupported file type: ${file.type}`;
    if (file.size > MAX_FILE_SIZE) return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 50MB)`;
    return null;
  }, []);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    setError('');
    for (const file of Array.from(newFiles)) {
      const err = validateFile(file);
      if (err) { setError(err); return; }
    }
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        // Upload to blob storage first
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
        const { blobPath, contentHash } = await res.json();

        // Create import job
        await createImport.mutateAsync({
          fileName: file.name,
          mimeType: file.type,
          blobPath,
          contentHash,
          fileSize: file.size,
        });
      }
      setFiles([]);
      utils.importJobs.list.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [files, createImport, utils]);

  const recentJobs = jobsData?.items ?? [];

  return (
    <div>
      <TitleActionHeader title="Upload Documents" subtitle="Upload lab reports, health records, or data exports to process and analyze." />

      {error && <div className="mt-7 mb-4 rounded-lg bg-[var(--color-health-critical-bg)] border border-[var(--color-health-critical-border)] p-3 text-sm text-[var(--color-health-critical)]">{error}</div>}

      <div
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={`mt-7 rounded-xl border-2 border-dashed bg-white p-12 text-center transition-colors ${dragActive ? 'border-accent-500 bg-accent-50' : 'border-neutral-300 hover:border-neutral-400'}`}
      >
        <p className="text-sm font-medium text-neutral-900 font-body">Drop files here</p>
        <p className="mt-1 text-sm text-neutral-500">or</p>
        <label className="mt-2 inline-block cursor-pointer rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          Browse files
          <input type="file" multiple accept={ALLOWED_MIME_TYPES.join(',')} onChange={(e) => handleFiles(e.target.files)} className="hidden" />
        </label>
        <p className="mt-2 text-[11px] text-neutral-400 font-mono">PDF, CSV, JPEG, PNG, JSON — up to 50MB</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-neutral-900 mb-2">Queued files</h2>
          <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white overflow-hidden">
            {files.map((file, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                  <p className="text-[11px] text-neutral-400 font-mono">{file.type} — {(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))} className="text-sm text-neutral-500 hover:text-red-600">Remove</button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 rounded-lg bg-accent-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-700 transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Recent imports */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-medium tracking-[-0.015em] text-neutral-900 font-display">
          Recent imports
        </h2>
        {recentJobs.length === 0 && !jobsLoading ? (
          <AnimatedEmptyState
            title="No imports yet"
            description="Upload a document above to start processing."
            cardIcon={({ index }) => emptyIcons[index % emptyIcons.length]!}
          />
        ) : (
          <DataTable<ImportJob>
            data={recentJobs}
            loading={jobsLoading}
            columns={importColumns}
            rowConfig={{
              getRowKey: (job) => job.id,
              getRowHref: (job) => `/uploads/${job.id}`,
              renderActions: (job) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteImport.mutate({ id: job.id });
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ),
            }}
            hasActionColumn
            actionColumnWidth="2rem"
          />
        )}
      </div>
    </div>
  );
}
