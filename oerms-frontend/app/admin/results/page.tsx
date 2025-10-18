"use client";

import { useState, useMemo } from "react";
import type { ExamResult } from "../../types/result";
import ResultAnalytics from "@/app/components/ResultAnalytics";
import StudentResult from "@/app/components/StudentResult";

interface Props {
  results: ExamResult[];
}

export default function AdminResultsPage({ results }: Props) {
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  const analytics = useMemo(() => {
    const totalAttempts = results.length;
    const scores = results.map((r) => r.percentage);
    const timeSpent = results.map((r) => r.timeSpentSeconds);

    // Score distribution
    const scoreRanges = [
      { min: 0, max: 20 },
      { min: 21, max: 40 },
      { min: 41, max: 60 },
      { min: 61, max: 80 },
      { min: 81, max: 100 },
    ];

    const scoreDistribution = scoreRanges.map((range) => ({
      range: `${range.min}-${range.max}%`,
      count: scores.filter((s) => s >= range.min && s <= range.max).length,
    }));

    // Time distribution
    const timeRanges = [
      { min: 0, max: 15 },
      { min: 16, max: 30 },
      { min: 31, max: 45 },
      { min: 46, max: 60 },
      { min: 61, max: 90 },
      { min: 91, max: Infinity },
    ];

    const timeDistribution = timeRanges.map((range) => ({
      range:
        range.max === Infinity
          ? `>${range.min}m`
          : `${range.min}-${range.max}m`,
      count: timeSpent.filter(
        (t) =>
          t / 60 >= range.min &&
          (range.max === Infinity ? true : t / 60 <= range.max)
      ).length,
    }));

    // Question analytics
    const questionAnalytics = results[0].questionResults.map((_, index) => {
      const questionResults = results.map(
        (r) => r.questionResults[index]
      );

      const avgScore =
        questionResults.reduce((sum, qr) => sum + qr.marksAwarded, 0) /
        questionResults.length;

      const correctCount = questionResults.filter(
        (qr) => qr.isCorrect
      ).length;

      const avgTime =
        questionResults.reduce(
          (sum, qr) => sum + (qr.timeSpentSeconds || 0),
          0
        ) / questionResults.length;

      return {
        questionId: questionResults[0].questionId,
        averageScore: avgScore,
        correctPercentage: (correctCount / questionResults.length) * 100,
        averageTimeSpent: avgTime,
        difficultyLevel: (questionResults[0].question.metadata?.difficulty as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
      };
    });

    return {
      totalAttempts,
      averageScore:
        scores.reduce((sum, score) => sum + score, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passPercentage:
        (results.filter((r) => r.status === "PASS").length / results.length) *
        100,
      averageTimeSpent:
        timeSpent.reduce((sum, time) => sum + time, 0) / timeSpent.length,
      questionAnalytics,
      timeDistribution,
      scoreDistribution,
    };
  }, [results]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-8">Exam Results</h1>

      {/* Analytics Overview */}
      <ResultAnalytics analytics={analytics} />

      {/* Results Table */}
      <div className="bg-white rounded-xl border p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4">All Attempts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Student ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Score
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Percentage
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Time Taken
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result) => (
                <tr
                  key={result.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 text-sm">{result.studentId}</td>
                  <td className="px-4 py-2 text-sm">
                    {result.score}/{result.totalMarks}
                  </td>
                  <td className="px-4 py-2 text-sm">{result.percentage}%</td>
                  <td className="px-4 py-2 text-sm">
                    {Math.floor(result.timeSpentSeconds / 60)}m{" "}
                    {result.timeSpentSeconds % 60}s
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        result.status === "PASS"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Result Details - Student {selectedResult.studentId}
              </h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <StudentResult result={selectedResult} />
          </div>
        </div>
      )}
    </div>
  );
}