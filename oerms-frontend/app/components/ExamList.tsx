import { useEffect, useState } from "react";
import api from "../../lib/api";
import type { Exam } from "../types/exam";
import QuestionCreateModal from "./QuestionCreateModal";
import QuestionListModal from "./QuestionListModal";
import { getErrorMessage } from "../../lib/errors";

interface Props {
  onUpdate?: () => void;
}

export default function ExamList({ onUpdate }: Props) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  const loadExams = async () => {
    try {
      const res = await api.get<Exam[]>('/exams');
      setExams(res.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handlePublish = async (exam: Exam) => {
    try {
      await api.post(`/exams/${exam.id}/publish`);
      await loadExams();
      onUpdate?.();
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to publish exam');
      setError(message);
    }
  };

  const handleDelete = async (exam: Exam) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await api.delete(`/exams/${exam.id}`);
      await loadExams();
      onUpdate?.();
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to delete exam');
      setError(message);
    }
  };

  if (loading) return <div>Loading exams...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {exams.length === 0 ? (
        <div className="text-gray-600">No exams found.</div>
      ) : (
        exams.map((exam) => (
          <div key={exam.id} className="p-6 border rounded-xl hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{exam.title}</h3>
                <div className="text-sm text-gray-600">{exam.description}</div>
              </div>
              <div className="flex items-center gap-2">
                {exam.status === 'DRAFT' && (
                  <>
                    <button 
                      onClick={() => { setSelectedExam(exam); setShowAddQuestion(true); }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
                    >
                      Add Question
                    </button>
                    <button 
                      onClick={() => handlePublish(exam)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded"
                      disabled={!exam.questionCount}
                    >
                      Publish
                    </button>
                  </>
                )}
                <button 
                  onClick={() => { setSelectedExam(exam); setShowQuestions(true); }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded"
                >
                  View Questions
                </button>
                <button 
                  onClick={() => handleDelete(exam)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="text-gray-600">
                Duration: {exam.durationSeconds ? (exam.durationSeconds / 60) + ' mins' : '-'}
              </div>
              <div className="text-gray-600">
                Questions: {exam.questionCount || 0}
              </div>
              <div className="text-gray-600">
                Total Marks: {exam.totalMarks || 0}
              </div>
              <div className="text-gray-600">
                Attempts: {exam.allowedAttempts || 1}
              </div>
              <div className="text-gray-600">
                Visibility: {exam.visibility}
              </div>
              <div className={`font-medium ${
                exam.status === 'PUBLISHED' ? 'text-green-600' :
                exam.status === 'ENDED' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {exam.status}
              </div>
            </div>

            {exam.startTime && exam.endTime && (
              <div className="mt-2 text-xs text-gray-500">
                Available from {new Date(exam.startTime).toLocaleString()} to {new Date(exam.endTime).toLocaleString()}
              </div>
            )}
          </div>
        ))
      )}

      {showAddQuestion && selectedExam && (
        <QuestionCreateModal
          examId={selectedExam.id}
          onClose={() => {
            setShowAddQuestion(false);
            setSelectedExam(null);
            loadExams();
          }}
          onQuestionAdded={() => {
            loadExams();
            onUpdate?.();
          }}
        />
      )}

      {showQuestions && selectedExam && (
        <QuestionListModal
          examId={selectedExam.id}
          questions={selectedExam.questions || []}
          onClose={() => {
            setShowQuestions(false);
            setSelectedExam(null);
          }}
          onQuestionsReordered={() => {
            loadExams();
            onUpdate?.();
          }}
        />
      )}
    </div>
  );
}
