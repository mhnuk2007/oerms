// components/ui/table-shell.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Minus } from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  width?: string;
}

export interface TableShellProps<T> {
  title?: string;
  description?: string;
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  onSearch?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string, direction: Exclude<SortDirection, null>) => void;
  actionsSlot?: React.ReactNode;
}

const PageButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <Button variant="secondary" size="sm" {...props}>
    {children}
  </Button>
);

export function TableShell<T>({
  title,
  description,
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  searchPlaceholder = 'Search…',
  total,
  page = 0,
  pageSize = 10,
  onSearch,
  onPageChange,
  onPageSizeChange,
  sortKey,
  sortDirection = null,
  onSortChange,
  actionsSlot
}: TableShellProps<T>) {
  const totalPages = total !== undefined ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  const handleSort = (key: string) => {
    if (!onSortChange) return;
    const nextDirection: SortDirection =
      sortKey === key ? (sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc') : 'asc';
    if (nextDirection) {
      onSortChange(key, nextDirection);
    }
  };

  const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => {
    if (!active || !direction) return <Minus className="h-3.5 w-3.5 text-slate-300" />;
    return direction === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-slate-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-slate-600" />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {onSearch && (
            <Input
              placeholder={searchPlaceholder}
              className="w-full sm:w-64"
              onChange={(e) => onSearch(e.target.value)}
            />
          )}
          {actionsSlot}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-800">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {columns.map((col) => {
                  const isActive = sortKey === col.key;
                  return (
                    <th
                      key={col.key as string}
                      className={`px-4 py-3 text-left font-semibold text-slate-700 ${col.width || ''}`}
                    >
                      <div
                        className={`flex items-center gap-1 ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                        onClick={() => col.sortable && handleSort(col.key as string)}
                      >
                        <span>{col.label}</span>
                        {col.sortable && <SortIcon active={isActive} direction={sortDirection} />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      {columns.map((col) => (
                        <td key={col.key as string} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data.length === 0
                  ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-300 dark:text-slate-300">
                        {emptyMessage}
                      </td>
                    </tr>
                    )
                  : (
                    data.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/70">
                        {columns.map((col) => (
                          <td
                            key={col.key as string}
                            className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                          >
                            {col.render ? col.render(row) : (row as any)[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))
                    )
              }
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4">
          <div className="text-sm text-slate-600">
            {total !== undefined ? `Showing ${data.length} of ${total}` : `Showing ${data.length} items`}
          </div>
          <div className="flex items-center gap-2">
            {onPageSizeChange && (
              <select
                className="border rounded-lg px-2 py-1 text-sm"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-1">
              <PageButton
                disabled={page <= 0}
                onClick={() => onPageChange && onPageChange(Math.max(0, page - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </PageButton>
              <span className="text-sm text-slate-700 px-2">
                Page {page + 1} / {totalPages}
              </span>
              <PageButton
                disabled={page + 1 >= totalPages}
                onClick={() => onPageChange && onPageChange(Math.min(totalPages - 1, page + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </PageButton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

