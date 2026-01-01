'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, Award, TrendingUp } from 'lucide-react';
import type { ResultSummary } from '@/lib/types/result.types';
import { formatDistanceToNow } from 'date-fns';

interface ResultCardProps {
  result: ResultSummary;
  onClick?: () => void;
}

export function ResultCard({ result, onClick }: ResultCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500';
      case 'PENDING_GRADING': return 'bg-yellow-500';
      case 'GRADED': return 'bg-blue-500';
      case 'DRAFT': return 'bg-gray-500';
      case 'WITHHELD': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return 'text-green-600';
    if (['B', 'C'].includes(grade)) return 'text-blue-600';
    if (['D'].includes(grade)) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{result.examTitle}</CardTitle>
          <Badge className={getStatusColor(result.status)}>
            {result.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className={`text-2xl font-bold ${getGradeColor(result.grade)}`}>
                {result.grade}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {result.obtainedMarks}/{result.totalMarks}
              </div>
              <div className="text-sm text-gray-500">
                {result.percentage.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>{result.passed ? 'Passed' : 'Failed'}</span>
            </div>
            {result.publishedAt && (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(result.publishedAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}