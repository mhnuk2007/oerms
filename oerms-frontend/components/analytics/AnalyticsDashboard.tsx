// components/analytics/AnalyticsDashboard.tsx - Comprehensive analytics dashboard

'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { analyticsService } from '@/lib/api/analytics';
import type { SystemAnalytics, PerformanceTrend, GradeDistribution } from '@/lib/api/analytics';

interface AnalyticsDashboardProps {
  examId?: string;
  studentId?: string;
  institution?: string;
}

export default function AnalyticsDashboard({ examId, studentId, institution }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalyticsData();
  }, [examId, studentId, institution, timeframe]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const promises = [];

      // Load general system analytics if no specific filter
      if (!examId && !studentId && !institution) {
        promises.push(
          analyticsService.getDashboardData().catch(() => null)
        );
      }

      // Load exam-specific analytics
      if (examId) {
        promises.push(
          analyticsService.getGradeDistribution(examId).catch(() => null),
          analyticsService.getExamAnalytics(examId).catch(() => null)
        );
      }

      // Load student-specific analytics
      if (studentId) {
        promises.push(
          analyticsService.getStudentPerformanceTrend(studentId).catch(() => []),
          analyticsService.getStudentAnalytics(studentId).catch(() => null)
        );
      }

      // Load institution-specific analytics
      if (institution) {
        promises.push(
          analyticsService.getInstitutionAnalytics(institution).catch(() => null)
        );
      }

      // Load time-based analytics
      promises.push(
        analyticsService.getTimeBasedAnalytics(timeframe).catch(() => null)
      );

      const results = await Promise.all(promises);

      // Parse results
      if (results[0]) setDashboardData(results[0]);

      const trendIndex = examId ? 0 : (studentId ? 0 : 1);
      if (results[trendIndex] && Array.isArray(results[trendIndex])) {
        setPerformanceTrends(results[trendIndex]);
      } else if (results[trendIndex]?.performanceTrend) {
        setPerformanceTrends(results[trendIndex].performanceTrend);
      }

      if (examId && results[1]) {
        setGradeDistribution(results[1]);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const type = examId ? 'exam' : (studentId ? 'student' : (institution ? 'institution' : 'system'));
      const params = {
        examId,
        studentId,
        institution,
        timeframe
      };

      const result = await analyticsService.generateAnalyticsReport(type as any, params);

      // In a real implementation, this would download the report
      console.log('Report generated:', result);
      alert('Analytics report has been generated and will be available for download shortly.');
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      alert('Failed to generate report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error loading analytics: {error}</p>
        <Button onClick={loadAnalyticsData} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {examId ? 'Exam Analytics' :
              studentId ? 'Student Analytics' :
                institution ? 'Institution Analytics' :
                  'System Analytics'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
            Export Report
          </Button>
        </div>
      </div>

      {/* System Overview (when no specific filter) */}
      {!examId && !studentId && !institution && dashboardData && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold">{dashboardData.overview.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Exams</p>
                    <p className="text-2xl font-bold">{dashboardData.overview.totalExams}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
                    <p className="text-2xl font-bold">{dashboardData.overview.totalAttempts}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                    <p className="text-2xl font-bold">{(dashboardData.overview.averageScore || 0).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Performance Trends */}
      {performanceTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceTrends.map((trend, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{trend.examTitle}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Avg: {(trend.averageScore || 0).toFixed(1)}%
                      </span>
                      <span className={`text-sm font-medium ${trend.improvement >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend.improvement >= 0 ? '+' : ''}{(trend.improvement || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${trend.averageScore}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Distribution */}
      {gradeDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution - {gradeDistribution.examTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {Object.entries(gradeDistribution.distribution).map(([range, count]) => (
                <div key={range} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{range}%</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold">{(gradeDistribution.averageScore || 0).toFixed(1)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{(gradeDistribution.medianScore || 0).toFixed(1)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Median</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{(gradeDistribution.standardDeviation || 0).toFixed(1)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Std Dev</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
