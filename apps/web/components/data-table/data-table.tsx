'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { type DataTableProps } from './types';
import { DataTableHeader } from './data-table-header';
import { DataTableRow } from './data-table-row';
import { DataTableSearch } from './data-table-search';
import { DataTableSkeleton } from './data-table-skeleton';
import { DataTableEmpty } from './data-table-empty';
import { DataTablePagination } from './data-table-pagination';

export function DataTable<T>({
  data,
  columns,
  rowConfig,
  loading,
  skeletonRows = 5,
  emptyState,
  search,
  pagination,
  className,
  showHeader = true,
  hasActionColumn,
  actionColumnWidth = 'auto',
}: DataTableProps<T>) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(
    new Set(),
  );

  const gridTemplateColumns = useMemo(() => {
    const cols = columns.map((c) => c.width ?? '1fr').join(' ');
    return hasActionColumn ? `${cols} ${actionColumnWidth}` : cols;
  }, [columns, hasActionColumn, actionColumnWidth]);

  const toggleExpand = (key: string | number) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isEmpty = !loading && data.length === 0;
  const showSkeleton = loading && data.length === 0;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-neutral-200 bg-white',
        className,
      )}
    >
      {search && (
        <DataTableSearch
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder}
        />
      )}

      {showHeader && (
        <DataTableHeader
          columns={columns}
          gridTemplateColumns={gridTemplateColumns}
          hasActionColumn={hasActionColumn}
        />
      )}

      {showSkeleton && (
        <DataTableSkeleton
          rows={skeletonRows}
          columns={columns.length}
          gridTemplateColumns={gridTemplateColumns}
          hasActionColumn={hasActionColumn}
        />
      )}

      {isEmpty && <DataTableEmpty>{emptyState}</DataTableEmpty>}

      {data.map((item, index) => {
        const key = rowConfig.getRowKey(item, index);
        return (
          <DataTableRow
            key={key}
            item={item}
            index={index}
            columns={columns}
            rowConfig={rowConfig}
            gridTemplateColumns={gridTemplateColumns}
            hasActionColumn={hasActionColumn}
            isExpanded={expandedKeys.has(key)}
            onToggleExpand={() => toggleExpand(key)}
            isLast={index === data.length - 1}
          />
        );
      })}

      {pagination && pagination.total > 0 && (
        <DataTablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
