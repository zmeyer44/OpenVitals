import Link from 'next/link';
import { cn } from '@/lib/utils';
import { type DataTableColumn, type DataTableRowConfig } from './types';

interface DataTableRowProps<T> {
  item: T;
  index: number;
  columns: DataTableColumn<T>[];
  rowConfig: DataTableRowConfig<T>;
  gridTemplateColumns: string;
  hasActionColumn?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isLast?: boolean;
}

export function DataTableRow<T>({
  item,
  index,
  columns,
  rowConfig,
  gridTemplateColumns,
  hasActionColumn,
  isExpanded,
  onToggleExpand,
  isLast,
}: DataTableRowProps<T>) {
  const href = rowConfig.getRowHref?.(item);
  const tint = rowConfig.getRowTint?.(item);
  const isExpandable = !!rowConfig.renderExpanded;

  const rowClassName = cn(
    'grid items-center gap-3 px-5 py-3.5 transition-colors hover:bg-neutral-50 cursor-pointer',
    !isLast && !isExpanded && 'border-b border-neutral-100',
    isExpanded && 'border-b border-neutral-100',
    tint,
  );

  const handleClick = () => {
    if (isExpandable) {
      onToggleExpand?.();
    } else if (rowConfig.onRowClick) {
      rowConfig.onRowClick(item);
    }
  };

  const cells = (
    <>
      {columns.map((col) => (
        <div
          key={col.id}
          className={cn(
            col.align === 'right' && 'text-right',
            col.align === 'center' && 'text-center',
            col.className,
            col.cellClassName,
          )}
        >
          {col.cell(item, index)}
        </div>
      ))}
      {hasActionColumn && (
        <div className="flex justify-end">
          {rowConfig.renderActions && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {rowConfig.renderActions(item)}
            </div>
          )}
        </div>
      )}
    </>
  );

  const content = href ? (
    <Link
      href={href}
      className={cn('group grid', rowClassName)}
      style={{ gridTemplateColumns }}
    >
      {cells}
    </Link>
  ) : (
    <div
      className={cn('group grid', rowClassName)}
      style={{ gridTemplateColumns }}
      onClick={handleClick}
      role={isExpandable || rowConfig.onRowClick ? 'button' : undefined}
    >
      {cells}
    </div>
  );

  return (
    <>
      {content}
      {isExpanded && rowConfig.renderExpanded && (
        <div
          className={cn(
            'bg-neutral-50/50 border-b border-neutral-100 px-5 py-4',
            isLast && 'border-b-0',
          )}
        >
          {rowConfig.renderExpanded(item)}
        </div>
      )}
    </>
  );
}
