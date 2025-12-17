'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { Users, BookOpen, Activity, Shield, TrendingUp, AlertTriangle, FileText, Award, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface AdminStats {
  users: number;
  exams: number;
  attempts: number;
  results: number;
  publishedResults: number;
  pendingGrading: number;
  systemHealth: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    users: 0,
    exams: 0,
    attempts: 0,
    results: 0,
    publishedResults: 0,
    pendingGrading: 0,
    systemHealth: false
  });
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdminStats = async () => {
            try {
                setLoading(true);

                // Add timeout to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), 10000);
                });

                const [usersResponse, examsResponse, attemptsResponse] = await Promise.race([
                    Promise.all([
                        apiClient.getAllUserProfiles({ page: 0, size: 1 }).catch(() => ({ data: { totalElements: 0 } })),
                        apiClient.getPublishedExams({ page: 0, size: 1 }).catch(() => ({ data: { totalElements: 0 } })),
                        apiClient.getAllAttempts({ page: 0, size: 1 }).catch(() => ({ data: { totalElements: 0 } }))
                    ]),
                    timeoutPromise
                ]).catch(() => [{ data: { totalElements: 0 } }, { data: { totalElements: 0 } }, { data: { totalElements: 0 } }]) as any;

        // Extract pagination data from API response structure
        const usersPage = usersResponse.data || usersResponse;
        const examsPage = examsResponse.data || examsResponse;
        const attemptsPage = attemptsResponse.data || attemptsResponse;

        // Check system health
        const authHealth = await apiClient.authServiceHealth().then(() => true).catch(() => false);
        const attemptHealth = await apiClient.attemptServiceHealth().then(() => true).catch(() => false);
        const resultHealth = await apiClient.resultServiceHealth().then(() => true).catch(() => false);

        // Get pending grading results
        const pendingGradingResponse = await apiClient.getPendingGradingResults().catch(() => ({ data: [] }));
        const pendingGrading = pendingGradingResponse.data?.length || 0;

        // Get suspicious results count
        const suspiciousResponse = await apiClient.getSuspiciousResults().catch(() => ({ data: [] }));
        const suspiciousCount = suspiciousResponse.data?.length || 0;

        setStats({
          users: usersPage.totalElements || 0,
          exams: examsPage.totalElements || 0,
          attempts: attemptsPage.totalElements || 0,
          results: pendingGrading + suspiciousCount, // Total results requiring attention
          publishedResults: 0, // Not available from current endpoints
          pendingGrading: pendingGrading,
          systemHealth: authHealth && attemptHealth && resultHealth
        });
      } catch (error) {
        console.error('Failed to load admin stats:', error);
        // Set fallback data
        setStats({
          users: 0,
          exams: 0,
          attempts: 0,
          results: 0,
          publishedResults: 0,
          pendingGrading: 0,
          systemHealth: false
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdminStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Administrator Dashboard</h1>
            <p className="text-purple-100 mt-1">
              System overview and management tools
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${stats.systemHealth ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm">{stats.systemHealth ? 'All systems operational' : 'System issues detected'}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-600" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.users.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
              Published Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.exams.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Available to students</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-orange-600" />
              Total Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.attempts.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Student submissions</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Results Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingGrading + (stats.results - stats.pendingGrading)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.pendingGrading} pending grading, {(stats.results - stats.pendingGrading)} suspicious
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="border-t-4 border-t-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-purple-600" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${stats.systemHealth ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <span className="font-medium">{stats.systemHealth ? 'All Systems Operational' : 'System Issues Detected'}</span>
                <p className="text-sm text-gray-500 mt-0.5">Auth, Attempt, and Result services</p>
              </div>
            </div>
            {!stats.systemHealth && (
              <div className="text-right">
                <p className="text-sm text-red-600">Check system logs</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover className="cursor-pointer">
          <Link href="/admin/users">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">User Management</h3>
                  <p className="text-sm text-gray-500">Manage user accounts and roles</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card hover className="cursor-pointer">
          <Link href="/admin/exams">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Exam Administration</h3>
                  <p className="text-sm text-gray-500">Oversee all exam content</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Link href="/admin/results">
          <Card hover className="cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Result Management</h3>
                  <p className="text-sm text-gray-500">Review and publish results</p>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400">Manage grading & results</div>
            </CardContent>
          </Card>
        </Link>

        <Card hover className="cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Analytics & Reports</h3>
                <p className="text-sm text-gray-500">System insights and metrics</p>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">Coming Soon</div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {!stats.systemHealth && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-400">System Issues Detected</h3>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  One or more services are currently unavailable. Please check system logs for details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
