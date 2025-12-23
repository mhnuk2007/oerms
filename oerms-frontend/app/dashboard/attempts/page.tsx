'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { AttemptSummary, ExamDTO } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Search, User, Filter, Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function TeacherAttemptsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'submitted' | 'completed'>('all');

  const fetchAttempts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const roles = user.roles || [];
      const isAdmin = roles.includes('ROLE_ADMIN');
      const isTeacher = roles.includes('ROLE_TEACHER');
      const isStudent = roles.includes('ROLE_STUDENT');

      // ================= ADMIN =================
      if (isAdmin) {
        const res = await apiClient.getAllAttempts({ size: 50 });
        setAttempts(res.data.content || []);
        return;
      }

      // ================= TEACHER =================
      if (isTeacher) {
        const examsRes = await apiClient.getMyExams({ size: 100 });
        const exams: ExamDTO[] = examsRes.data.content || [];

        const allAttempts: AttemptSummary[] = [];

        for (const exam of exams) {
          try {
            const attemptsRes = await apiClient.getExamAttempts(exam.id, { size: 50 });
            allAttempts.push(...(attemptsRes.data.content || []));
          } catch {
            // ignore single exam failure
          }
        }

        allAttempts.sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );

        setAttempts(allAttempts.slice(0, 50));
        return;
      }

      // ================= STUDENT =================
      if (isStudent) {
        const res = await apiClient.getMyAttempts({ size: 50 });
        setAttempts(res.data.content || []);
        return;
      }

      // ================= NO ROLE =================
      setAttempts([]);
    } catch (err) {
      console.error('Failed to fetch attempts', err);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAttempts();
  }, [user, isLoading, fetchAttempts, router]);

  const filteredAttempts = attempts.filter(att => {
    const matchesSearch = !search ||
      att.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      att.examTitle?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' ||
      (filter === 'in_progress' && att.status === 'IN_PROGRESS') ||
      (filter === 'submitted' && att.status === 'SUBMITTED') ||
      (filter === 'completed' && (att.status === 'COMPLETED' || att.status === 'GRADED'));

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'SUBMITTED': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'COMPLETED':
      case 'GRADED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'COMPLETED':
      case 'GRADED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
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
              <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view attempts.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isStudent = user.roles?.includes('ROLE_STUDENT');
  const isTeacher = user.roles?.includes('ROLE_TEACHER');
  const isAdmin = user.roles?.includes('ROLE_ADMIN');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isStudent ? 'My Exam Attempts' :
                   isTeacher ? 'Student Attempts - My Exams' :
                   'All Student Attempts'}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {isStudent
                    ? 'View your exam attempt history and progress.'
                    : isTeacher
                      ? 'Review and grade student submissions for exams you created.'
                      : 'Administrative view of all student attempts across the platform.'}
                </p>
              </div>
              {(isTeacher || isAdmin) && (
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Export Data
                  </Button>
                  {isAdmin && (
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                      <User className="w-4 h-4" />
                      Bulk Actions
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Attempts</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{attempts.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">In Progress</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {attempts.filter(a => a.status === 'IN_PROGRESS').length}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Completed</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {attempts.filter(a => a.status === 'COMPLETED' || a.status === 'GRADED').length}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Average Score</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {attempts.length > 0
                  ? (attempts.filter(a => a.percentage != null)
                      .reduce((sum, a) => sum + (a.percentage || 0), 0) /
                     attempts.filter(a => a.percentage != null).length
                    ).toFixed(1) + '%'
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
                    <option value="all">All Status</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="text-sm text-gray-500">
                  Showing {filteredAttempts.length} of {attempts.length} attempts
                </div>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading attempts...</p>
              </div>
            ) : filteredAttempts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Attempts Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {search || filter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : isStudent
                      ? 'You haven\'t attempted any exams yet.'
                      : 'No student attempts found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                    <tr>
                      {!isStudent && (
                        <th className="px-6 py-4 text-left">Student</th>
                      )}
                      <th className="px-6 py-4 text-left">Exam</th>
                      <th className="px-6 py-4 text-left">Started</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Progress</th>
                      <th className="px-6 py-4 text-left">Score</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAttempts.map(att => (
                      <tr key={att.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        {!isStudent && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {att.studentName || 'Student'}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white block">{att.examTitle}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Attempt #{att.attemptNumber || 1}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {new Date(att.startedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(att.status)}`}>
                            {getStatusIcon(att.status)}
                            {att.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{
                                  width: att.status === 'IN_PROGRESS'
                                    ? `${Math.min(100, ((Date.now() - new Date(att.startedAt).getTime()) / (10 * 60 * 1000)) * 100)}%`
                                    : att.status === 'COMPLETED' || att.status === 'GRADED' ? '100%' : '0%'
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {att.status === 'IN_PROGRESS' ? 'In Progress' :
                               att.status === 'COMPLETED' || att.status === 'GRADED' ? 'Complete' : 'Not Started'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {att.obtainedMarks != null ? (
                            <div className="text-sm">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {att.obtainedMarks}/{att.totalMarks || att.totalQuestions || 0}
                              </span>
                              <span className="text-gray-500 ml-1">
                                ({att.percentage?.toFixed(1)}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {(isTeacher || isAdmin) && (
                            <Link href={`/results/${att.id}`}>
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                Review
                              </Button>
                            </Link>
                          )}
                          {isStudent && (
                            <Link href={`/atm/${att.id}`}>
                              <Button variant="ghost" size="sm">
                                View
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
