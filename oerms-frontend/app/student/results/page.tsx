"use client";

import type { ExamResult } from "../../types/result";
import StudentResult from "@/app/components/StudentResult";

interface Props {
  results: ExamResult[];
}

export default function StudentResultsPage({ results }: Props) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-8">My Results</h1>

      <div className="bg-white rounded-xl border p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Date
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
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={result.id} className="group hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">
                    {new Date(result.submittedAt).toLocaleDateString()}
                  </td>
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
                    <details className="relative group">
                      <summary className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer list-none">
                        View Details
                      </summary>
                      <div className="absolute z-10 right-0 mt-2 bg-white rounded-lg shadow-xl border max-w-3xl w-[calc(100vw-3rem)] sm:w-[40rem]">
                        <div className="p-6">
                          <StudentResult result={result} />
                        </div>
                      </div>
                    </details>
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