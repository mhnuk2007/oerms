"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ExamSession, Answer } from "../types/attempt";
import { Question } from "../types/exam";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/errors";
import ExamTimer from "./ExamTimer";

interface Props {
  examId: string;
  attemptId: string;
}

export default function ExamRunner({ examId, attemptId }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Load exam session
  useEffect(() => {
    async function loadSession() {
      try {
        const [examRes, attemptsRes] = await Promise.all([
          api.get(`/exams/${examId}/session`),
          api.get(`/attempts/${attemptId}`),
        ]);
        
        const session: ExamSession = {
          exam: examRes.data.exam,
          questions: examRes.data.questions,
          attempt: attemptsRes.data,
        };

        setSession(session);
        
        // Initialize answers from attempt
        const answerMap: Record<string, Answer> = {};
        session.attempt.answers.forEach((answer: Answer) => {
          answerMap[answer.questionId] = answer;
        });
        setAnswers(answerMap);
        
        // Restore last position
        if (session.attempt.currentQuestionIndex !== undefined) {
          setCurrentIndex(session.attempt.currentQuestionIndex);
        }
      } catch (err) {
        const message = getErrorMessage(err, "Failed to load exam");
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    
    loadSession();
  }, [examId, attemptId]);

  // Track time spent on current question
  useEffect(() => {
    if (!session) return;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      // Update time spent for current question
      if (session.questions[currentIndex]) {
        const questionId = session.questions[currentIndex].id;
        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            ...prev[questionId],
            timeSpentSeconds: (prev[questionId]?.timeSpentSeconds || 0) + Math.floor((Date.now() - startTime) / 1000)
          }
        }));
      }
    };
  }, [currentIndex, session]);

  // Autosave answers periodically
  useEffect(() => {
    if (!session || Object.keys(answers).length === 0) return;

    const saveAnswers = async () => {
      if (saving) return;
      setSaving(true);
      try {
        await api.patch(`/attempts/${attemptId}/answers`, {
          answers: Object.values(answers),
          currentQuestionIndex: currentIndex
        });
        setLastSaved(new Date());
      } catch (err) {
        console.error('Autosave failed:', err);
      } finally {
        setSaving(false);
      }
    };

    const interval = setInterval(saveAnswers, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [session, answers, attemptId, currentIndex, saving]);

  const handleAnswer = useCallback((question: Question, value: string | string[]) => {
    const now = new Date().toISOString();
    setAnswers(prev => ({
      ...prev,
      [question.id]: {
        questionId: question.id,
        answer: value,
        answeredAt: now,
        timeSpentSeconds: prev[question.id]?.timeSpentSeconds || 0
      }
    }));
  }, []);

  const handleSubmit = async () => {
    if (!session) return;

    try {
      await api.post(`/attempts/${attemptId}/submit`, {
        answers: Object.values(answers)
      });
      router.push(`/student/exams/${examId}/results`);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to submit exam");
      setError(message);
      setShowSubmitModal(false);
    }
  };

  const handleTimerExpire = async () => {
    try {
      await api.post(`/attempts/${attemptId}/submit`, {
        answers: Object.values(answers),
        expired: true
      });
      router.push(`/student/exams/${examId}/results`);
    } catch (err) {
      console.error('Auto-submit on expire failed:', err);
    }
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => 
      answer.answer && 
      (Array.isArray(answer.answer) ? answer.answer.length > 0 : answer.answer.trim() !== '')
    ).length;
  };

  const getQuestionStatus = (questionIndex: number) => {
    const question = session?.questions[questionIndex];
    if (!question) return 'unanswered';
    const answer = answers[question.id];
    if (!answer?.answer) return 'unanswered';
    if (Array.isArray(answer.answer)) {
      return answer.answer.length > 0 ? 'answered' : 'unanswered';
    }
    return answer.answer.trim() !== '' ? 'answered' : 'unanswered';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error Loading Exam</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button 
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">No exam session found.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  const totalQuestions = session.questions.length;
  const currentAnswer = answers[currentQuestion.id];
  const timeRemaining = Math.max(
    0,
    new Date(session.attempt.expiresAt).getTime() - new Date().getTime()
  ) / 1000;
  const answeredCount = getAnsweredCount();
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-neutral-900 mb-1">{session.exam.title}</h1>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span>Question {currentIndex + 1} of {totalQuestions}</span>
                <span>•</span>
                <span>{answeredCount} answered</span>
                <span>•</span>
                <span>{totalQuestions - answeredCount} remaining</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progress Bar */}
              <div className="hidden md:block w-32">
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-neutral-500 mt-1 text-center">
                  {Math.round(progress)}% Complete
                </div>
              </div>

              {/* Timer */}
              <ExamTimer seconds={timeRemaining} onExpire={handleTimerExpire} />
              
              {/* Save Status */}
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                {saving ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Saved</span>
                  </>
                ) : null}
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn btn-primary"
                disabled={saving}
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Question Navigation Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Question Navigation</h3>
          <div className="grid grid-cols-5 gap-2">
            {session.questions.map((_: any, i: number) => {
              const status = getQuestionStatus(i);
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    i === currentIndex
                      ? "bg-primary-600 text-white"
                      : status === 'answered'
                      ? "bg-success-100 text-success-700 hover:bg-success-200"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-success-100 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neutral-100 rounded"></div>
                <span>Not answered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="card">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`status-badge ${
                      currentQuestion.type === 'MCQ' ? 'status-published' : 'status-draft'
                    }`}>
                      {currentQuestion.type}
                    </span>
                    <span className="text-sm text-neutral-600">
                      {currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}
                      {currentQuestion.negativeMarks && (
                        <span className="text-error-600 ml-1">
                          (Negative: -{currentQuestion.negativeMarks})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-500">
                    Time spent: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-neutral-900 leading-relaxed">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Answer Area */}
              <div className="space-y-4">
                {currentQuestion.type === "MCQ" ? (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option: any, index: number) => (
                      <label
                        key={option.id}
                        className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-neutral-50 ${
                          currentAnswer?.answer && 
                          (Array.isArray(currentAnswer.answer) 
                            ? currentAnswer.answer.includes(option.id)
                            : currentAnswer.answer === option.id
                          ) ? 'border-primary-300 bg-primary-50' : 'border-neutral-200'
                        }`}
                      >
                        <input
                          type={currentQuestion.correctOptionIds?.length === 1 ? "radio" : "checkbox"}
                          name={`question-${currentQuestion.id}`}
                          value={option.id}
                          checked={
                            currentAnswer?.answer
                              ? Array.isArray(currentAnswer.answer)
                                ? currentAnswer.answer.includes(option.id)
                                : currentAnswer.answer === option.id
                              : false
                          }
                          onChange={(e) => {
                            if (currentQuestion.correctOptionIds?.length === 1) {
                              handleAnswer(currentQuestion, e.target.value);
                            } else {
                              const value = e.target.value;
                              const current = (currentAnswer?.answer || []) as string[];
                              const newAnswer = current.includes(value)
                                ? current.filter(v => v !== value)
                                : [...current, value];
                              handleAnswer(currentQuestion, newAnswer);
                            }
                          }}
                          className="mt-1 w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-medium text-neutral-600">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="text-neutral-900">{option.text}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={(currentAnswer?.answer as string) || ""}
                      onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                      className="form-textarea min-h-[200px]"
                      placeholder="Write your detailed answer here..."
                    />
                    {currentQuestion.instructions && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h4 className="text-sm font-medium text-blue-800 mb-1">Instructions</h4>
                            <p className="text-sm text-blue-700">{currentQuestion.instructions}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentIndex(i => i - 1)}
                disabled={currentIndex === 0}
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex gap-2">
                {session.questions.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                      i === currentIndex
                        ? "bg-primary-600 text-white"
                        : getQuestionStatus(i) === 'answered'
                        ? "bg-success-100 text-success-700 hover:bg-success-200"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentIndex(i => i + 1)}
                disabled={currentIndex === totalQuestions - 1}
                className="btn btn-secondary"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Submit Exam</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-neutral-600 mb-4">
                Are you sure you want to submit this exam? This action cannot be undone.
              </p>
              
              <div className="bg-neutral-50 rounded-lg p-4">
                <h4 className="font-medium text-neutral-900 mb-2">Exam Summary</h4>
                <div className="space-y-1 text-sm text-neutral-600">
                  <div>Total Questions: {totalQuestions}</div>
                  <div>Answered: {answeredCount}</div>
                  <div>Not Answered: {totalQuestions - answeredCount}</div>
                  <div>Time Remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary flex-1"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Exam'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}