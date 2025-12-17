// components/charts/exam-analytics.tsx - Exam Analytics Dashboard
'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/common/loading';
import { examService } from '@/lib/api/exam';
import { attemptService } from '@/lib/api/attempt';
import { CalendarDays, Users, FileText, TrendingUp, Award, Clock } from 'lucide-react';

interface ExamAnalyticsProps {
  examId?: string; // If provided, show analytics for specific exam
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

interface AnalyticsData {
  overview: {
    totalExams: number;
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
  scoreDistribution: Array<{ range: string; count: number }>;
  attemptsOverTime: Array<{ date: string; attempts: number; completions: number }>;
  questionDifficulty: Array<{
    questionId: string;
    difficulty: string;
    averageScore: number;
    attempts: number;
  }>;
  studentPerformance: Array<{
    studentId: string;
    studentName: string;
    averageScore: number;
    totalAttempts: number;
    bestScore: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function ExamAnalytics({ examId, timeRange = '30d' }: ExamAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'scores' | 'trends' | 'questions' | 'students'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [examId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      if (examId) {
        // Single exam analytics
        const [examStats, attempts] = await Promise.all([
          examService.getStatistics(examId),
          attemptService.getExamAttempts(examId)
        ]);

        // Process data for single exam
        const attemptsArray = attempts.content || attempts;
        const analyticsData: AnalyticsData = {
          overview: {
            totalExams: 1,
            totalAttempts: attemptsArray.length,
            averageScore: attemptsArray.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / attemptsArray.length || 0,
            passRate: attemptsArray.filter((a: any) => a.passed).length / attemptsArray.length * 100 || 0
          },
          scoreDistribution: calculateScoreDistribution(attemptsArray),
          attemptsOverTime: calculateAttemptsOverTime(attemptsArray),
          questionDifficulty: [], // Would need question-level data
          studentPerformance: calculateStudentPerformance(attemptsArray)
        };

        setData(analyticsData);
      } else {
        // Global analytics
        const [allExams, allAttempts] = await Promise.all([
          examService.getAllExams(),
          attemptService.getAllAttempts()
        ]);

        const allExamsArray = allExams.content || allExams;
        const allAttemptsArray = allAttempts.content || allAttempts;
        const analyticsData: AnalyticsData = {
          overview: {
            totalExams: allExamsArray.length,
            totalAttempts: allAttemptsArray.length,
            averageScore: allAttemptsArray.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / allAttemptsArray.length || 0,
            passRate: allAttemptsArray.filter((a: any) => a.passed).length / allAttemptsArray.length * 100 || 0
          },
          scoreDistribution: calculateScoreDistribution(allAttemptsArray),
          attemptsOverTime: calculateAttemptsOverTime(allAttemptsArray),
          questionDifficulty: [], // Simplified for global view
          studentPerformance: calculateStudentPerformance(allAttemptsArray).slice(0, 10) // Top 10 students
        };

        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScoreDistribution = (attempts: any[]): Array<{ range: string; count: number }> => {
    const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    const distribution = ranges.map(range => ({ range, count: 0 }));

    attempts.forEach(attempt => {
      const score = attempt.score || 0;
      if (score <= 20) distribution[0].count++;
      else if (score <= 40) distribution[1].count++;
      else if (score <= 60) distribution[2].count++;
      else if (score <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    return distribution;
  };

  const calculateAttemptsOverTime = (attempts: any[]): Array<{ date: string; attempts: number; completions: number }> => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayAttempts = attempts.filter((a: any) =>
        a.createdAt?.split('T')[0] === date
      );

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attempts: dayAttempts.length,
        completions: dayAttempts.filter(a => a.status === 'COMPLETED' || a.status === 'GRADED').length
      };
    });
  };

  const calculateStudentPerformance = (attempts: any[]): Array<{
    studentId: string;
    studentName: string;
    averageScore: number;
    totalAttempts: number;
    bestScore: number;
  }> => {
    const studentMap = new Map<string, {
      studentId: string;
      studentName: string;
      scores: number[];
      attempts: number;
    }>();

    attempts.forEach(attempt => {
      const studentId = attempt.studentId;
      const studentName = attempt.studentName || `Student ${studentId.slice(-4)}`;
      const score = attempt.score || 0;

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId,
          studentName,
          scores: [],
          attempts: 0
        });
      }

      const student = studentMap.get(studentId)!;
      student.scores.push(score);
      student.attempts++;
    });

    return Array.from(studentMap.values())
      .map(student => ({
        studentId: student.studentId,
        studentName: student.studentName,
        averageScore: student.scores.reduce((sum, score) => sum + score, 0) / student.scores.length,
        totalAttempts: student.attempts,
        bestScore: Math.max(...student.scores)
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  };

  if (loading) {
    return <Loading text="Loading analytics..." />;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
        <Button onClick={loadAnalytics} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Analytics</h2>
          <p className="text-gray-600 mt-1">
            {examId ? 'Detailed analytics for this exam' : 'System-wide exam performance insights'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedMetric === 'overview' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedMetric('overview')}
          >
            Overview
          </Button>
          <Button
            variant={selectedMetric === 'scores' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedMetric('scores')}
          >
            Scores
          </Button>
          <Button
            variant={selectedMetric === 'trends' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedMetric('trends')}
          >
            Trends
          </Button>
          <Button
            variant={selectedMetric === 'students' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedMetric('students')}
          >
            Students
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Exams</p>
                  <p className="text-2xl font-bold">{data.overview.totalExams}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold">{data.overview.totalAttempts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold">{data.overview.averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold">{data.overview.passRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Score Distribution */}
      {selectedMetric === 'scores' && (
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Trends Over Time */}
      {selectedMetric === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle>Attempt Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.attemptsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="attempts" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                <Area type="monotone" dataKey="completions" stackId="2" stroke="#10B981" fill="#10B981" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Student Performance */}
      {selectedMetric === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.studentPerformance.slice(0, 10).map((student, index) => (
                <div key={student.studentId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.studentName}</p>
                      <p className="text-sm text-gray-600">{student.totalAttempts} attempts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{student.averageScore.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Best: {student.bestScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
