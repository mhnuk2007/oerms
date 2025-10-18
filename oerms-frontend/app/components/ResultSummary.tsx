"use client";

import { useMemo } from "react";
import type { ExamResult } from "../../types/result";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  result: ExamResult;
}

export default function ResultSummary({ result }: Props) {
  const timeByType = useMemo(() => {
    const data = result.questionResults.reduce((acc, qr) => {
      const type = qr.question.type;
      acc[type] = (acc[type] || 0) + (qr.timeSpentSeconds || 0);
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(data).map(([type, seconds]) => ({
      type,
      minutes: Math.round(seconds / 60),
    }));
  }, [result]);

  const scoreByType = useMemo(() => {
    const data = result.questionResults.reduce((acc, qr) => {
      const type = qr.question.type;
      acc[type] = acc[type] || { scored: 0, total: 0 };
      acc[type].scored += qr.marksAwarded;
      acc[type].total += qr.maxMarks;
      return acc;
    }, {} as Record<string, { scored: number; total: number }>);
    
    return Object.entries(data).map(([type, { scored, total }]) => ({
      type,
      scored,
      total,
      percentage: Math.round((scored / total) * 100),
    }));
  }, [result]);

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Overall Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {result.score}/{result.totalMarks}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {result.percentage}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Percentage</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              result.status === 'PASS' ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.status}
            </div>
            <div className="text-sm text-gray-600 mt-1">Status</div>
          </div>
        </div>
      </div>

      {/* Time Statistics */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Time Analysis</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minutes" fill="#4f46e5" name="Minutes Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-sm text-gray-600 text-center mt-2">
          Time Spent by Question Type (minutes)
        </div>
      </div>

      {/* Score by Question Type */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Performance by Question Type</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="scored" fill="#22c55e" name="Score" />
              <Bar dataKey="total" fill="#d1d5db" name="Total Marks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-sm text-gray-600 text-center mt-2">
          Marks Scored vs Total Marks by Question Type
        </div>
      </div>

      {/* Question-wise Analysis */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Question Analysis</h2>
        <div className="divide-y">
          {result.questionResults.map((qr, index) => (
            <div key={qr.questionId} className="py-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                      Q{index + 1}.
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                      {qr.question.type}
                    </span>
                    <span className="text-sm text-gray-600">
                      {qr.marksAwarded}/{qr.maxMarks} marks
                    </span>
                    {qr.timeSpentSeconds && (
                      <span className="text-sm text-gray-600">
                        {Math.round(qr.timeSpentSeconds / 60)} mins
                      </span>
                    )}
                  </div>
                  <div className="mt-2">{qr.question.questionText}</div>
                </div>
                {qr.isCorrect !== undefined && (
                  <div className={`ml-4 ${
                    qr.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {qr.isCorrect ? '✓' : '✗'}
                  </div>
                )}
              </div>

              {qr.question.type === 'MCQ' && (
                <div className="ml-8 mt-2 space-y-2">
                  {qr.question.options?.map(option => (
                    <div
                      key={option.id}
                      className={`text-sm ${
                        qr.question.correctOptionIds?.includes(option.id)
                          ? 'text-green-600 font-medium'
                          : Array.isArray(qr.answer.answer) &&
                            qr.answer.answer.includes(option.id)
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {option.id.toUpperCase()}. {option.text}
                      {qr.question.correctOptionIds?.includes(option.id) &&
                        ' (Correct)'}
                    </div>
                  ))}
                </div>
              )}

              {qr.question.type === 'SUBJECTIVE' && (
                <div className="ml-8 mt-2">
                  <div className="text-sm font-medium">Your Answer:</div>
                  <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {qr.answer.answer as string}
                  </div>
                </div>
              )}

              {qr.feedback && (
                <div className="ml-8 mt-2 text-sm text-gray-600 italic">
                  Feedback: {qr.feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}