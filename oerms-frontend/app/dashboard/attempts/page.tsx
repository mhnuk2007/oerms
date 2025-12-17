'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { AttemptSummary, ExamDTO } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Search, User, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TeacherAttemptsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
        const res = await apiClient.getAllAttempts({ size: 20 });
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

        setAttempts(allAttempts.slice(0, 20));
        return;
      }

      // ================= STUDENT =================
      if (isStudent) {
        const res = await apiClient.getMyAttempts({ size: 20 });
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {user.roles?.includes('ROLE_STUDENT') ? 'My Attempts' : 'Student Attempts'}
          </h1>
          <p className="text-gray-500">
            {user.roles?.includes('ROLE_STUDENT')
              ? 'View your exam attempt history.'
              : 'Review and grade student submissions.'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
          <div className="p-4 border-b flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by student or exam..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading attempts...</div>
          ) : attempts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No attempts found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(att => (
                  <tr key={att.id} className="border-t">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      {att.studentName || 'Student'}
                    </td>
                    <td className="px-6 py-4">{att.examTitle}</td>
                    <td className="px-6 py-4">
                      {new Date(att.startedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{att.status}</td>
                    <td className="px-6 py-4">
                      {att.obtainedMarks != null
                        ? `${att.obtainedMarks}/${att.totalQuestions || 0} (${att.percentage}%)`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
