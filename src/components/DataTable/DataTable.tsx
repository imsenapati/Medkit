import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import type { ColumnDef, DataTableProps } from './DataTable.types';
import styles from './DataTable.module.css';

const ROW_HEIGHT = 41;

function getRowKey<T extends Record<string, unknown>>(
  row: T,
  index: number,
  rowKey?: keyof T | ((row: T) => string)
): string {
  if (!rowKey) return String((row as Record<string, unknown>).id ?? index);
  if (typeof rowKey === 'function') return rowKey(row);
  return String(row[rowKey]);
}

function getCellValue<T>(row: T, accessor: keyof T | ((row: T) => unknown)): unknown {
  if (typeof accessor === 'function') return accessor(row);
  return row[accessor];
}

/**
 * DataTable is a feature-rich table component supporting server-side pagination,
 * column sorting, row selection, loading skeletons, empty states, sticky headers,
 * and row virtualization for large datasets.
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pagination,
  sorting,
  selection,
  loading = false,
  emptyState,
  onRowClick,
  stickyHeader = false,
  virtualizeThreshold = 100,
  rowKey,
}: DataTableProps<T>) {
  const shouldVirtualize = data.length > virtualizeThreshold && !loading;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    if (!shouldVirtualize || !containerRef.current) return;
    const el = containerRef.current;
    setContainerHeight(el.clientHeight);

    const handleScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [shouldVirtualize]);

  // Virtualization calculations
  const virtualState = useMemo(() => {
    if (!shouldVirtualize) return null;
    const totalHeight = data.length * ROW_HEIGHT;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
    const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + 10;
    const endIndex = Math.min(data.length, startIndex + visibleCount);
    return { totalHeight, startIndex, endIndex, offsetY: startIndex * ROW_HEIGHT };
  }, [shouldVirtualize, data.length, scrollTop, containerHeight]);

  const visibleRows = virtualState
    ? data.slice(virtualState.startIndex, virtualState.endIndex)
    : data;

  const handleSort = useCallback(
    (col: ColumnDef<T>) => {
      if (!sorting || !col.sortable) return;
      const newDir =
        sorting.column === col.id && sorting.direction === 'asc' ? 'desc' : 'asc';
      sorting.onSort(col.id, newDir);
    },
    [sorting]
  );

  const isAllSelected = useMemo(() => {
    if (!selection || data.length === 0) return false;
    return data.every((row, i) =>
      selection.selected.includes(getRowKey(row, i, rowKey))
    );
  }, [selection, data, rowKey]);

  const handleSelectAll = useCallback(() => {
    if (!selection) return;
    if (isAllSelected) {
      selection.onSelectionChange([]);
    } else {
      selection.onSelectionChange(data.map((row, i) => getRowKey(row, i, rowKey)));
    }
  }, [selection, isAllSelected, data, rowKey]);

  const handleSelectRow = useCallback(
    (row: T, index: number) => {
      if (!selection) return;
      const key = getRowKey(row, index, rowKey);
      if (selection.mode === 'single') {
        selection.onSelectionChange(
          selection.selected.includes(key) ? [] : [key]
        );
      } else {
        selection.onSelectionChange(
          selection.selected.includes(key)
            ? selection.selected.filter((id) => id !== key)
            : [...selection.selected, key]
        );
      }
    },
    [selection, rowKey]
  );

  // Pagination calculations
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;

  const renderHeader = () => (
    <thead className={stickyHeader ? styles.theadSticky : styles.thead}>
      <tr>
        {selection && selection.mode === 'multiple' && (
          <th className={styles.checkboxTh}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isAllSelected}
              onChange={handleSelectAll}
              aria-label="Select all rows"
            />
          </th>
        )}
        {selection && selection.mode === 'single' && <th className={styles.checkboxTh} />}
        {columns.map((col) => {
          const isSorted = sorting?.column === col.id;
          const thClass = col.sortable ? styles.thSortable : styles.th;
          const align = col.align || 'left';

          return (
            <th
              key={col.id}
              className={thClass}
              style={{ width: col.width, textAlign: align }}
              onClick={() => col.sortable && handleSort(col)}
              aria-sort={
                isSorted
                  ? sorting!.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : col.sortable
                  ? 'none'
                  : undefined
              }
              role={col.sortable ? 'columnheader' : undefined}
            >
              <span className={styles.thContent}>
                {col.header}
                {col.sortable && (
                  <SortIcon
                    active={isSorted}
                    direction={isSorted ? sorting!.direction : undefined}
                  />
                )}
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );

  const renderLoadingSkeleton = () => (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={`skeleton-${i}`} className={styles.skeletonRow}>
          {selection && (
            <td className={styles.checkboxTd}>
              <div className={styles.skeleton} style={{ width: 16, height: 16 }} />
            </td>
          )}
          {columns.map((col) => (
            <td key={col.id} className={styles.td}>
              <div
                className={styles.skeleton}
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const renderEmptyState = () => (
    <tbody>
      <tr>
        <td
          className={styles.emptyState}
          colSpan={columns.length + (selection ? 1 : 0)}
        >
          {emptyState || 'No data available'}
        </td>
      </tr>
    </tbody>
  );

  const renderRow = (row: T, dataIndex: number) => {
    const key = getRowKey(row, dataIndex, rowKey);
    const isSelected = selection?.selected.includes(key) || false;
    const trClass = `${onRowClick ? styles.trClickable : styles.tr} ${isSelected ? styles.trSelected : ''}`;

    return (
      <tr
        key={key}
        className={trClass}
        onClick={() => {
          onRowClick?.(row);
        }}
        aria-selected={selection ? isSelected : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onRowClick(row);
          }
        }}
      >
        {selection && (
          <td className={styles.checkboxTd}>
            <input
              type={selection.mode === 'multiple' ? 'checkbox' : 'radio'}
              className={styles.checkbox}
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectRow(row, dataIndex);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select row ${key}`}
            />
          </td>
        )}
        {columns.map((col) => {
          const value = getCellValue(row, col.accessor);
          const align = col.align || 'left';
          const tdClass =
            align === 'center' ? styles.tdCenter : align === 'right' ? styles.tdRight : styles.td;

          return (
            <td key={col.id} className={tdClass} style={{ width: col.width }}>
              {col.cell ? col.cell(value, row) : String(value ?? '')}
            </td>
          );
        })}
      </tr>
    );
  };

  const renderBody = () => {
    if (loading) return renderLoadingSkeleton();
    if (data.length === 0) return renderEmptyState();

    if (shouldVirtualize && virtualState) {
      return (
        <tbody>
          {/* Spacer for items above the viewport */}
          {virtualState.offsetY > 0 && (
            <tr>
              <td
                style={{ height: virtualState.offsetY, padding: 0, border: 'none' }}
                colSpan={columns.length + (selection ? 1 : 0)}
              />
            </tr>
          )}
          {visibleRows.map((row, i) =>
            renderRow(row, virtualState.startIndex + i)
          )}
          {/* Spacer for items below the viewport */}
          {virtualState.endIndex < data.length && (
            <tr>
              <td
                style={{
                  height: (data.length - virtualState.endIndex) * ROW_HEIGHT,
                  padding: 0,
                  border: 'none',
                }}
                colSpan={columns.length + (selection ? 1 : 0)}
              />
            </tr>
          )}
        </tbody>
      );
    }

    return <tbody>{data.map((row, i) => renderRow(row, i))}</tbody>;
  };

  const renderPagination = () => {
    if (!pagination) return null;
    const { page, pageSize, total, onPageChange, onPageSizeChange } = pagination;
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);

    return (
      <div className={styles.pagination} role="navigation" aria-label="Table pagination">
        <div className={styles.paginationInfo}>
          <span>
            {startItem}-{endItem} of {total}
          </span>
          <label>
            Rows per page:{' '}
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.paginationControls}>
          <button
            className={styles.pageBtn}
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="First page"
          >
            &laquo;
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            &lsaquo;
          </button>
          <span style={{ padding: '0 8px', fontSize: 13, color: '#475569' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            &rsaquo;
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label="Last page"
          >
            &raquo;
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div
        ref={containerRef}
        className={shouldVirtualize ? styles.virtualContainer : styles.tableContainer}
        style={shouldVirtualize ? { height: 600, overflow: 'auto' } : undefined}
      >
        <table className={styles.table} role="grid" aria-label="Data table">
          {renderHeader()}
          {renderBody()}
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}

function SortIcon({ active, direction }: { active?: boolean; direction?: 'asc' | 'desc' }) {
  if (!active) {
    return (
      <svg className={styles.sortIcon} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1l4 5H4l4-5Zm0 14l-4-5h8l-4 5Z" />
      </svg>
    );
  }

  if (direction === 'asc') {
    return (
      <svg className={styles.sortIconActive} viewBox="0 0 16 16" fill="currentColor" aria-label="Sorted ascending">
        <path d="M8 1l4 5H4l4-5Z" />
      </svg>
    );
  }

  return (
    <svg className={styles.sortIconActive} viewBox="0 0 16 16" fill="currentColor" aria-label="Sorted descending">
      <path d="M8 15l-4-5h8l-4 5Z" />
    </svg>
  );
}
