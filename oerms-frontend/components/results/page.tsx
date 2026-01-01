'use client';

import { usePendingGrading } from '@/lib/hooks/useResults';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Clock, User, FileText } from 'lucide-react';

export default function PendingGradingPage() {
  const router = useRouter();
  const { data, isLoading } = usePendingGrading();

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const results = data?.data || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pending Grading</h1>
        <div className="text-sm text-gray-600">{results.length} results awaiting grading</div>
      </div>

      {results.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">All caught up!</h3>
          <p className="text-gray-600">No results are pending grading at this time.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{result.examTitle}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>Student ID: {result.studentId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Total Marks: {result.totalMarks}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => router.push(`/teacher/results/${result.id}/grade`)}>
                  Grade Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}