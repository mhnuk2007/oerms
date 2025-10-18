"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import type { Exam, Question } from "../../../types/exam";
import RequireAuth from "../../../components/RequireAuth";
import QuestionCreateModal from "../../../components/QuestionCreateModal";
import QuestionListModal from "../../../components/QuestionListModal";
import ExamPreview from "../../../components/ExamPreview";
import ExamUploadModal from "../../../components/ExamUploadModal";
import { getErrorMessage } from "../../../../lib/errors";
import { CSV_TEMPLATE, JSON_TEMPLATE } from "../../../../lib/templates";

export default function ExamDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const loadExam = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        api.get<Exam>(`/exams/${params.id}`),
        api.get<Question[]>(`/exams/${params.id}/questions`)
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data);
      setError("");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to load exam");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExam();
  }, [params.id]);

  const handlePublish = async () => {
    if (!exam) return;
    if (!window.confirm("Are you sure you want to publish this exam?")) return;

    try {
      await api.post(`/exams/${exam.id}/publish`);
      await loadExam();
    } catch (err) {
      const message = getErrorMessage(err, "Failed to publish exam");
      setError(message);
    }
  };

  const handleDelete = async () => {
    if (!exam) return;
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      await api.delete(`/exams/${exam.id}`);
      router.push("/admin/dashboard");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to delete exam");
      setError(message);
    }
  };

  const downloadTemplate = (format: 'csv' | 'json') => {
    const content = format === 'csv' ? CSV_TEMPLATE : JSON.stringify(JSON_TEMPLATE, null, 2);
    const type = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `questions-template.${format}`;

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <RequireAuth role="ADMIN">
        <div className="max-w-6xl mx-auto py-10 px-4">Loading exam...</div>
      </RequireAuth>
    );
  }

  if (error || !exam) {
    return (
      <RequireAuth role="ADMIN">
        <div className="max-w-6xl mx-auto py-10 px-4">
          <div className="text-red-600">{error}</div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="mt-4 text-blue-600"
          >
            &larr; Back to Dashboard
          </button>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth role="ADMIN">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <div
                className={`px-2 py-0.5 text-sm rounded-full ${
                  exam.status === "PUBLISHED"
                    ? "bg-green-100 text-green-700"
                    : exam.status === "ENDED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {exam.status}
              </div>
            </div>
            <p className="text-gray-600">{exam.description}</p>
          </div>
          <div className="flex gap-3">
            {exam.status === "DRAFT" && (
              <>
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                  disabled={!exam.questionCount}
                >
                  Publish Exam
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  Delete Exam
                </button>
              </>
            )}
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 border rounded-md"
            >
              Preview
            </button>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="px-4 py-2 border rounded-md"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white rounded-xl border">
            <h3 className="font-medium mb-2">Exam Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-600">Duration</dt>
                <dd className="font-medium">
                  {exam.durationSeconds / 60} minutes
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Questions</dt>
                <dd className="font-medium">{exam.questionCount || 0}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Total Marks</dt>
                <dd className="font-medium">{exam.totalMarks || 0}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Attempts Allowed</dt>
                <dd className="font-medium">{exam.allowedAttempts || 1}</dd>
              </div>
            </dl>
          </div>

          <div className="p-6 bg-white rounded-xl border">
            <h3 className="font-medium mb-2">Schedule</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-600">Start Time</dt>
                <dd className="font-medium">
                  {exam.startTime
                    ? new Date(exam.startTime).toLocaleString()
                    : "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">End Time</dt>
                <dd className="font-medium">
                  {exam.endTime
                    ? new Date(exam.endTime).toLocaleString()
                    : "Not set"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="p-6 bg-white rounded-xl border">
            <h3 className="font-medium mb-2">Settings</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-600">Visibility</dt>
                <dd className="font-medium">{exam.visibility}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Shuffle Questions</dt>
                <dd className="font-medium">
                  {exam.settings?.shuffleQuestions ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Show Answers</dt>
                <dd className="font-medium">
                  {exam.settings?.showAnswersAfterSubmit ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Questions</h2>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Templates:</span>
                <button
                  onClick={() => downloadTemplate('csv')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  CSV
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => downloadTemplate('json')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  JSON
                </button>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                Bulk Upload
              </button>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
              >
                Add Question
              </button>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p>No questions added yet.</p>
              <p className="text-sm mt-2">
                Add questions manually or use bulk upload.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Q{i + 1}.
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                          {q.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          Marks: {q.marks}
                        </span>
                        {q.negativeMarks ? (
                          <span className="text-sm text-red-600">
                            (Negative: -{q.negativeMarks})
                          </span>
                        ) : null}
                      </div>
                      <div className="text-gray-900">{q.questionText}</div>
                    </div>
                    <button
                      onClick={() => setShowQuestions(true)}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddQuestion && (
          <QuestionCreateModal
            examId={exam.id}
            onClose={() => setShowAddQuestion(false)}
            onQuestionAdded={() => {
              setShowAddQuestion(false);
              loadExam();
            }}
          />
        )}

        {showQuestions && (
          <QuestionListModal
            examId={exam.id}
            questions={questions}
            onClose={() => setShowQuestions(false)}
            onQuestionsReordered={() => {
              setShowQuestions(false);
              loadExam();
            }}
          />
        )}

        {showUpload && (
          <ExamUploadModal
            examId={exam.id}
            onClose={() => setShowUpload(false)}
            onQuestionsUploaded={() => {
              setShowUpload(false);
              loadExam();
            }}
          />
        )}

        {showPreview && (
          <ExamPreview
            exam={exam}
            questions={questions}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </RequireAuth>
  );
}