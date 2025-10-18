"use client";

import { useState } from "react";
import type { Question } from "../../types/exam";
import api from "../../lib/api";

interface Props {
  examId: string;
  questions: Question[];
  onClose: () => void;
  onQuestionsReordered?: () => void;
}

export default function QuestionListModal({ examId, questions, onClose, onQuestionsReordered }: Props) {
  const [reordering, setReordering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderedQuestions, setOrderedQuestions] = useState(questions);
  
  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const newOrder = [...orderedQuestions];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setOrderedQuestions(newOrder);
  };

  const handleSaveOrder = async () => {
    try {
      setLoading(true);
      setError('');
      await api.post(`/exams/${examId}/questions/reorder`, {
        questionIds: orderedQuestions.map(q => q.id)
      });
      onQuestionsReordered?.();
      onClose();
    } catch (err) {
      setError('Failed to save question order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setReordering(!reordering)}
              className="px-3 py-1 text-blue-600 border rounded-md"
            >
              {reordering ? 'Cancel Reordering' : 'Reorder Questions'}
            </button>
            <button onClick={onClose} className="text-gray-500">&times;</button>
          </div>
        </div>

        <div className="space-y-4">
          {orderedQuestions.map((question, index) => (
            <div 
              key={question.id} 
              className="p-4 border rounded-lg hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                {reordering && (
                  <div className="flex flex-col gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => moveQuestion(index, index - 1)}
                      className="px-2 py-1 text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      disabled={index === questions.length - 1}
                      onClick={() => moveQuestion(index, index + 1)}
                      className="px-2 py-1 text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500">Q{index + 1}.</span>
                    <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">{question.type}</span>
                    <span className="text-sm text-gray-600">Marks: {question.marks}</span>
                    {question.negativeMarks ? (
                      <span className="text-sm text-red-600">Negative: -{question.negativeMarks}</span>
                    ) : null}
                  </div>
                  <div className="text-gray-900">{question.questionText}</div>
                  
                  {question.type === 'MCQ' && question.options && (
                    <div className="mt-3 space-y-2">
                      {question.options.map(option => (
                        <div 
                          key={option.id}
                          className={`pl-6 text-sm ${
                            question.correctOptionIds?.includes(option.id)
                              ? 'text-green-600 font-medium'
                              : 'text-gray-600'
                          }`}
                        >
                          {option.id.toUpperCase()}. {option.text}
                          {question.correctOptionIds?.includes(option.id) && ' ✓'}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'SUBJECTIVE' && question.instructions && (
                    <div className="mt-2 text-sm text-gray-600 italic">
                      Instructions: {question.instructions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600 font-medium">{error}</div>
        )}

        {reordering && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setReordering(false)}
              className="px-4 py-2 border rounded-md"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}