'use client';

import { Skeleton } from "@/components/ui/Skeleton";

export function ExamSkeleton() {
  return (
    <div className="flex h-screen">
      {/* Sidebar skeleton */}
      <aside className="w-72 bg-white dark:bg-gray-800 border-r p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </aside>
      
      {/* Main content skeleton */}
      <main className="flex-1 p-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
          <Skeleton className="h-8 w-3/4 mb-6" />
          <Skeleton className="h-32 w-full mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}