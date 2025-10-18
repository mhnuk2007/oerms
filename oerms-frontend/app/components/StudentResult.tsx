"use client";

import { useMemo } from "react";
import type { ExamResult } from "../types/result";

interface Props {
  result: ExamResult;
}

export default function StudentResult({ result }: Props) {
  const {
    score,
    totalMarks,
    startedAt,
    submittedAt,
    questionResults,
    timeSpentSeconds,
    percentage,
  } = result;

  return (
    <div className="space-y-8">
      {/* Overall Score Card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              {score}/{totalMarks}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">
              {percentage}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Percentage</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">
              {Math.floor(timeSpentSeconds / 60)}m {timeSpentSeconds % 60}s
            </div>
            <div className="text-sm text-gray-600 mt-1">Time Taken</div>
          </div>
        </div>
      </div>

      {/* Question-wise Analysis */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Question Analysis</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Question
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Your Score
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Max Score
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Time Spent
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questionResults.map((qr) => (
                <tr key={qr.questionId}>
                  <td className="px-4 py-2 text-sm">Q{qr.questionId}</td>
                  <td className="px-4 py-2 text-sm">{qr.marksAwarded}</td>
                  <td className="px-4 py-2 text-sm">{qr.maxMarks}</td>
                  <td className="px-4 py-2 text-sm">
                    {qr.timeSpentSeconds ? (
                      <>
                        {Math.floor(qr.timeSpentSeconds / 60)}m {qr.timeSpentSeconds % 60}s
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        qr.isCorrect
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {qr.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}