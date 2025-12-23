'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  actions,
  emptyMessage = 'No data found'
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };
  
  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as any)[sortKey];
    const bVal = (b as any)[sortKey];
    const order = sortOrder === 'asc' ? 1 : -1;
    if (aVal === null || aVal === undefined) return 1 * order;
    if (bVal === null || bVal === undefined) return -1 * order;
    return String(aVal).localeCompare(String(bVal)) * order;
  });
  
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key}
                className={cn(
                  "px-6 py-4 font-medium text-gray-500",
                  col.sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
            {actions && <th className="px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {sortedData.map((item) => (
            <tr 
              key={keyExtractor(item)}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-right">
                  {actions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
