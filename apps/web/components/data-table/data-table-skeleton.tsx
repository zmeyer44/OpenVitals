import { Skeleton } from '@/components/ui/skeleton';

interface DataTableSkeletonProps {
  rows: number;
  columns: number;
  gridTemplateColumns: string;
  hasActionColumn?: boolean;
}

export function DataTableSkeleton({
  rows,
  columns,
  gridTemplateColumns,
  hasActionColumn,
}: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="grid items-center gap-3 border-b border-neutral-100 px-5 py-3.5 last:border-b-0"
          style={{ gridTemplateColumns }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 w-3/4" />
          ))}
          {hasActionColumn && <div />}
        </div>
      ))}
    </>
  );
}
