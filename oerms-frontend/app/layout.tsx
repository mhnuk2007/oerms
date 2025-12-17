import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundaryWrapper } from '@/components/common/error-boundary';
import { AlertBridge } from '@/components/providers/AlertBridge';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OERMS - Online Exam & Result Management System',
  description: 'A modern platform for conducting online examinations and managing results',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <ErrorBoundaryWrapper>
            <AlertBridge />
            <div className="flex flex-col min-h-screen">
              <a href="#main-content" className="skip-link sr-only focus:not-sr-only fixed top-4 left-4 z-[999] bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 px-3 py-2 rounded shadow-sm">Skip to content</a>
              <Navbar />
              <main id="main-content" className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </ErrorBoundaryWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}
