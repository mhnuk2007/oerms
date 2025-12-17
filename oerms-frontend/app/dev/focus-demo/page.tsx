import React from 'react';
import FocusDemo from '@/components/ui/FocusDemo';

export const metadata = {
  title: 'Focus Demo - OERMS',
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <FocusDemo />
      </div>
    </main>
  );
}
