import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  id: string;
  header: string | ReactNode;
  accessor: keyof T | ((row: T) => unknown);
  /** Custom cell renderer */
  cell?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Server-side pagination config */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  /** Sorting config */
  sorting?: {
    column: string;
    direction: 'asc' | 'desc';
    onSort: (column: string, direction: 'asc' | 'desc') => void;
  };
  /** Row selection config */
  selection?: {
    selected: string[];
    onSelectionChange: (ids: string[]) => void;
    mode: 'single' | 'multiple';
  };
  /** Show loading skeleton */
  loading?: boolean;
  /** Custom empty state */
  emptyState?: ReactNode;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Enable sticky header */
  stickyHeader?: boolean;
  /** Enable virtualization when rows exceed this count */
  virtualizeThreshold?: number;
  /** Key extractor for rows (defaults to 'id') */
  rowKey?: keyof T | ((row: T) => string);
}
