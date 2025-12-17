// components/layout/dashboard-layout.tsx - Modern Dashboard Layout
'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundaryWrapper } from '@/components/common/error-boundary';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
        <Sidebar />

        <div className="lg:pl-[280px]">
          <TopBar />

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 min-h-[calc(100vh-4rem)]"
          >
            <ErrorBoundaryWrapper>
              {children}
            </ErrorBoundaryWrapper>
          </motion.main>
        </div>
      </div>
    </ToastProvider>
  );
}
