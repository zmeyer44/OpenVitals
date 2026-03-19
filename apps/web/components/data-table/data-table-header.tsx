import { cn } from '@/lib/utils';
import { type DataTableColumn } from './types';

interface DataTableHeaderProps<T> {
  columns: DataTableColumn<T>[];
  gridTemplateColumns: string;
  hasActionColumn?: boolean;
}

export function DataTableHeader<T>({
  columns,
  gridTemplateColumns,
  hasActionColumn,
}: DataTableHeaderProps<T>) {
  return (
    <div
      className="grid items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-2.5"
      style={{ gridTemplateColumns }}
    >
      {columns.map((col) => (
        <div
          key={col.id}
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-400 font-mono',
            col.align === 'right' && 'text-right',
            col.align === 'center' && 'text-center',
            col.className,
            col.headerClassName,
          )}
        >
          {col.header}
        </div>
      ))}
      {hasActionColumn && <div />}
    </div>
  );
}
