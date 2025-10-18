"use client";

import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { useAuth } from "../../components/AuthProvider";
import api from "../../../lib/api";
import { Exam } from "../../types/exam";
import { getErrorMessage } from "../../../lib/errors";

export default function StudentExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await api.get<Exam[]>("/student/exams");
        setExams(res.data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load exams"));
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  if (loading) return <div>Loading exams...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <RequireAuth role="STUDENT">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">My Exams</h1>
          <p className="text-gray-600 mt-1">View and take your assigned exams</p>
        </div>

        <div className="grid gap-6">
          {exams.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p>No exams available.</p>
              <p className="text-sm mt-2">Check back later for new exams.</p>
            </div>
          ) : (
            exams.map(exam => (
              <div
                key={exam.id}
                className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{exam.title}</h3>
                    <p className="text-gray-600 mt-1">{exam.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-0.5 text-sm rounded-full ${
                      exam.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {exam.status}
                    </span>
                    <div className="text-sm text-gray-600">
                      {exam.durationSeconds / 60} minutes
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <div>Questions: {exam.questionCount}</div>
                  <div>Total Marks: {exam.totalMarks}</div>
                  {exam.startTime && exam.endTime && (
                    <div>
                      Available from {new Date(exam.startTime).toLocaleString()} to{" "}
                      {new Date(exam.endTime).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-4">
                  <a
                    href={`/student/exams/${exam.id}/instructions`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md inline-block"
                  >
                    Start Exam
                  </a>
                  <a
                    href={`/student/exams/${exam.id}/results`}
                    className="px-4 py-2 border rounded-md inline-block"
                  >
                    View Results
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </RequireAuth>
  );
}