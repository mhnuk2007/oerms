'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ResultSummaryDTO, ExamDTO } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Search, User, Filter, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function TeacherResultsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [results, setResults] = useState<ResultSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [examFilter, setExamFilter] = useState<string>('all');

  const fetchResults = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const roles = user.roles || [];
      const isTeacher = roles.includes('ROLE_TEACHER');
      const isAdmin = roles.includes('ROLE_ADMIN');

      if (!isTeacher && !isAdmin) {
        router.push('/dashboard');
        return;
      }

      // Get teacher's exams first
      const examsRes = await apiClient.getMyExams({ size: 100 });
      const exams: ExamDTO[] = examsRes.data.content || [];

      const allResults: ResultSummaryDTO[] = [];

      // For each exam, get its results
      for (const exam of exams) {
        try {
          const resultsRes = await apiClient.getExamResults(exam.id, { size: 100 });
          const examResults: ResultSummaryDTO[] = resultsRes.data.content || [];

          // Add exam info to each result
          const resultsWithExam = examResults.map(result => ({
            ...result,
            examTitle: exam.title,
            examId: exam.id
          }));

          allResults.push(...resultsWithExam);
        } catch {
          // ignore single exam failure
        }
      }

      // Sort by most recent first
      allResults.sort(
        (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );

      setResults(allResults);
    } catch (err) {
      console.error('Failed to fetch results', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchResults();
  }, [user, isLoading, fetchResults, router]);

  const filteredResults = results.filter(result => {
    const matchesSearch = !search ||
      result.examTitle?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' ||
      (filter === 'passed' && result.passed) ||
      (filter === 'failed' && !result.passed);

    const matchesExam = examFilter === 'all' || result.examId === examFilter;

    return matchesSearch && matchesFilter && matchesExam;
  });

  // Get unique exams for filter dropdown
  const uniqueExams = Array.from(new Set(results.map(r => r.examTitle)))
    .map(title => results.find(r => r.examTitle === title))
    .filter(Boolean);

  const getStatusIcon = (passed: boolean) => {
    return passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (passed: boolean) => {
    return passed
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-red-500 text-2xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view results.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isTeacher = user.roles?.includes('ROLE_TEACHER');
  const isAdmin = user.roles?.includes('ROLE_ADMIN');

  if (!isTeacher && !isAdmin) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-red-500 text-2xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to view this page.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Student Results
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Review and grade student performance on exams you created.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Export Grades
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Results</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Passed</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.filter(r => r.passed).length}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Failed</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.filter(r => !r.passed).length}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Average Score</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.length > 0
                  ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1) + '%'
                  : '0%'
                }
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by student or exam..."
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <select
                    value={filter}
                    onChange={e => setFilter(e.target.value as any)}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Results</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>

                  <select
                    value={examFilter}
                    onChange={e => setExamFilter(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Exams</option>
                    {uniqueExams.map(exam => (
                      <option key={exam?.examId} value={exam?.examId}>
                        {exam?.examTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-500">
                  Showing {filteredResults.length} of {results.length} results
                </div>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading results...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Results Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {search || filter !== 'all' || examFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No student results found for your exams.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Exam</th>
                      <th className="px-6 py-4 text-left">Submitted</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Score</th>
                      <th className="px-6 py-4 text-left">Percentage</th>
                      <th className="px-6 py-4 text-left">Grade</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              Student
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900 dark:text-white">{result.examTitle}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {result.publishedAt
                            ? new Date(result.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not submitted'
                          }
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(result.passed)}`}>
                            {getStatusIcon(result.passed)}
                            {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {result.obtainedMarks}/{result.totalMarks}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${result.percentage}%` }}
                              />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {result.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {result.grade ? (
                            <span className="font-semibold text-gray-900 dark:text-white px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                              {result.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/results/${result.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 mr-2">
                              Review
                            </Button>
                          </Link>
                          {isAdmin && (
                            <Link href={`/results/${result.id}/grade`}>
                              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                Grade
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
