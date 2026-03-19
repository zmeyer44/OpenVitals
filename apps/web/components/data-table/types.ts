import { type ReactNode } from 'react';

export interface DataTableColumn<T> {
  id: string;
  header: string | ReactNode;
  cell: (item: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableRowConfig<T> {
  getRowKey: (item: T, index: number) => string | number;
  getRowHref?: (item: T) => string | undefined;
  getRowTint?: (item: T) => string | undefined;
  renderExpanded?: (item: T) => ReactNode;
  renderActions?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowConfig: DataTableRowConfig<T>;
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: ReactNode;
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (p: number) => void;
  };
  className?: string;
  showHeader?: boolean;
  hasActionColumn?: boolean;
  actionColumnWidth?: string;
}
