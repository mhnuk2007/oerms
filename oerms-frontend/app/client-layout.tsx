'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundaryWrapper } from '@/components/common/error-boundary';
import { AlertBridge } from '@/components/providers/AlertBridge';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isExamPage = pathname.startsWith('/atm');

  return (
    <ToastProvider>
      <ErrorBoundaryWrapper>
        <AlertBridge />
        <div className="flex flex-col min-h-screen">
          <a href="#main-content" className="skip-link sr-only focus:not-sr-only fixed top-4 left-4 z-[999] bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 px-3 py-2 rounded shadow-sm">Skip to content</a>
          {!isExamPage && <Navbar />}
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          {!isExamPage && <Footer />}
        </div>
      </ErrorBoundaryWrapper>
    </ToastProvider>
  );
}
