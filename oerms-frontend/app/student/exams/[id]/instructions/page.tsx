"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "../../../components/RequireAuth";
import api from "../../../../lib/api";
import { Exam } from "../../../types/exam";
import { getErrorMessage } from "../../../../lib/errors";

export default function ExamInstructions({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadExam() {
      try {
        const res = await api.get<Exam>(`/student/exams/${params.id}`);
        setExam(res.data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load exam"));
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [params.id]);

  const handleStart = async () => {
    if (!exam) return;
    try {
      setStarting(true);
      const res = await api.post(`/exams/${exam.id}/attempts`);
      const attemptId = res.data.id;
      router.push(`/student/exams/${exam.id}/attempt/${attemptId}`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to start exam"));
      setStarting(false);
    }
  };

  if (loading) return <div>Loading exam instructions...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!exam) return <div>Exam not found.</div>;

  return (
    <RequireAuth role="STUDENT">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white rounded-xl border p-8">
          <h1 className="text-2xl font-bold mb-6">{exam.title}</h1>

          <div className="prose prose-sm max-w-none">
            <h2 className="text-lg font-semibold mb-4">Exam Instructions</h2>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Duration: {exam.durationSeconds / 60} minutes</li>
              <li>Total Questions: {exam.questionCount}</li>
              <li>Total Marks: {exam.totalMarks}</li>
              <li>
                Question Types: Multiple Choice Questions (MCQs) and Subjective
                Questions
              </li>
              {exam.settings?.shuffleQuestions && (
                <li>Questions will be presented in random order</li>
              )}
              <li>
                Auto-save: Your answers will be saved automatically every 30
                seconds
              </li>
              <li>
                Time Management: A timer will be displayed to help you track
                remaining time
              </li>
              <li>
                Submit: You can submit the exam any time before the duration ends
              </li>
              {exam.settings?.showAnswersAfterSubmit && (
                <li>
                  Results: You will be able to view your results after submission
                </li>
              )}
            </ul>

            <h3 className="font-semibold mb-2">Important Notes:</h3>
            <ul className="space-y-2 list-disc pl-5 mb-6 text-red-600">
              <li>Do not refresh the page during the exam</li>
              <li>
                The exam will auto-submit when the time expires or if you leave
                the page
              </li>
              <li>
                Ensure you have a stable internet connection before starting
              </li>
              <li>You are allowed {exam.allowedAttempts} attempt(s)</li>
            </ul>

            {exam.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Additional Instructions:</h3>
                <p className="text-gray-600">{exam.description}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => router.push("/student/exams")}
              className="px-4 py-2 border rounded-md"
            >
              Back to Exams
            </button>
            <button
              onClick={handleStart}
              disabled={starting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md"
            >
              {starting ? "Starting..." : "Start Exam"}
            </button>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}