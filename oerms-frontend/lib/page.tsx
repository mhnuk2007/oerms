'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface Question {
  id: string;
  text: string;
  options?: any[];
  marks: number;
  type?: string;
}

interface Answer {
  questionId: string;
  selectedOption?: string;
  selectedOptions?: string[];
  textAnswer?: string;
  marksObtained: number;
  totalMarks: number;
  status?: string; // Backend status might be unreliable, we'll calculate too
  timeTaken?: number;
  questionText?: string;
}

interface Result {
  id: string;
  examId: string;
  examTitle: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  status: string;
  publishedAt: string;
  answers: Record<string, Answer> | Answer[];
  studentId: string;
}

export default function ResultDetailsPage() {
  const params = useParams();
  const router = useRouter();
  // Handle potential array or undefined params safely
  const rawResultId = params?.resultId;
  const resultId = Array.isArray(rawResultId) ? rawResultId[0] : rawResultId;

  const [result, setResult] = useState<Result | null>(null);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!resultId) {
        setError('Invalid Result ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Fetch Result Details
        const resultData = await apiClient.getResult(resultId);
        setResult(resultData);

        if (!resultData) {
          throw new Error('Result data not found');
        }

        // 2. Fetch Exam Questions to get text/content
        // We try to fetch questions. If student doesn't have permission for full questions,
        // we might need to rely on what's in the result or handle gracefully.
        if (resultData?.examId) {
          let qMap: Record<string, Question> = {};

          try {
            // Try fetching questions for the exam to map IDs to Text
            // Note: Depending on backend permissions, this might need a specific endpoint
            const questionsData = await apiClient.getExamQuestionsForStudent(resultData.examId);
            
            const qMap: Record<string, Question> = {};
            if (Array.isArray(questionsData)) {
              questionsData.forEach((q: any) => {
                qMap[q.id] = q;
              });
            }
            setQuestions(qMap);
          } catch (qError) {
            console.warn('Could not fetch question details:', qError);
            // Continue without question text if fetch fails
            console.warn('Could not fetch question details via bulk endpoint:', qError);
          }

          // Fallback: Fetch individual questions if missing
          try {
            const answersList = Array.isArray(resultData.answers)
              ? resultData.answers
              : Object.entries(resultData.answers || {}).map(([key, val]) => ({ ...(val as any), questionId: key }));
              
            const missingIds = answersList
              .map((a: any) => a.questionId)
              .filter((id: string) => !qMap[id]);

            if (missingIds.length > 0) {
              const results = await Promise.allSettled(
                missingIds.map((id: string) => apiClient.getQuestion(id))
              );
              
              results.forEach((res) => {
                if (res.status === 'fulfilled' && res.value) {
                  qMap[res.value.id] = res.value;
                }
              });
            }
          } catch (fallbackError) {
            console.warn('Fallback question fetch failed:', fallbackError);
          }
          
          setQuestions(qMap);
        }
      } catch (err: any) {
        console.error('Failed to load result:', err);
        if (err.status === 500) {
          setError('Internal Server Error. Please try again later.');
        } else if (err.status === 404) {
          setError('Result not found.');
        } else {
          setError(err.message || 'Failed to load result details');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Result</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Result not found'}</p>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Normalize answers to array
  const answersList = Array.isArray(result.answers)
    ? result.answers
    : Object.entries(result.answers || {}).map(([key, val]) => ({ ...(val as any), questionId: key }));

  // Calculate stats
  const totalQuestions = answersList.length;
  const correctAnswers = answersList.filter(a => a.marksObtained === a.totalMarks).length;
  const partialAnswers = answersList.filter(a => a.marksObtained > 0 && a.marksObtained < a.totalMarks).length;
  const skippedAnswers = answersList.filter(a => !a.selectedOption && !a.textAnswer && (!a.selectedOptions || a.selectedOptions.length === 0)).length;

  const getStatusColor = (obtained: number, total: number) => {
    if (obtained === total && total > 0) return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
    if (obtained > 0) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  const getStatusText = (obtained: number, total: number) => {
    if (obtained === total && total > 0) return 'Correct';
    if (obtained > 0) return 'Partial';
    return 'Incorrect';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 mb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{result.examTitle || 'Exam Result'}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Published: {new Date(result.publishedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.print()}>
              Print Result
            </Button>
          </div>
        </div>

        {/* Score Overview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            {/* Percentage Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-100 dark:text-gray-700"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * result.percentage) / 100}
                    className={`${result.percentage >= 50 ? 'text-blue-600 dark:text-blue-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{Math.round(result.percentage)}%</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${result.status === 'PASSED' || result.percentage >= 50 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {result.status || (result.percentage >= 50 ? 'Passed' : 'Failed')}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.obtainedMarks}<span className="text-sm text-gray-400 font-normal">/{result.totalMarks}</span>
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl text-center">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Correct</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{correctAnswers}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl text-center">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Incorrect</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{answersList.length - correctAnswers - partialAnswers - skippedAnswers}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Skipped</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{skippedAnswers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1">Detailed Breakdown</h2>
          
          {answersList.map((answer, index) => {
            const question = questions[answer.questionId];
            const statusText = getStatusText(answer.marksObtained, answer.totalMarks);
            const statusClasses = getStatusColor(answer.marksObtained, answer.totalMarks);

            return (
              <div key={answer.questionId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Question Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Question {index + 1}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusClasses}`}>
                        {statusText}
                      </span>
                      <span className="text-xs text-gray-400">
                        {answer.marksObtained}/{answer.totalMarks} Marks
                      </span>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      {question ? (
                        <div dangerouslySetInnerHTML={{ __html: question.text }} />
                      ) : answer.questionText ? (
                        <div dangerouslySetInnerHTML={{ __html: answer.questionText }} />
                      ) : (
                        <p className="text-gray-500 italic">Question content loading or unavailable (ID: {answer.questionId})</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer Section */}
                <div className="p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Answer */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Answer</p>
                      <div className={`p-3 rounded-lg border ${
                        statusText === 'Correct' 
                          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                          : statusText === 'Partial'
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
                            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                      }`}>
                        {answer.selectedOption ? (
                          <span className="font-medium">{answer.selectedOption}</span>
                        ) : answer.textAnswer ? (
                          <span>{answer.textAnswer}</span>
                        ) : (
                          <span className="italic text-gray-500">No answer provided</span>
                        )}
                      </div>
                    </div>

                    {/* Correct Answer (if available in question data) */}
                    {/* Note: Usually student endpoints might hide correct options unless explicitly allowed. 
                        If we have question options, we can try to find the correct one. */}
                    {question?.options && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Correct Answer</p>
                        <div className="space-y-2">
                          {question.options.map((opt: any) => {
                            // Assuming option structure has 'isCorrect' or similar, or we just list them
                            // If we don't have isCorrect flag, we might not be able to show this column accurately
                            if (opt.isCorrect) {
                              return (
                                <div key={opt.id} className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 flex items-center gap-2">
                                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{opt.text}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                          {/* Fallback if no options marked correct in data */}
                          {!question.options.some((o: any) => o.isCorrect) && (
                            <p className="text-sm text-gray-400 italic">Correct answer hidden</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation if available */}
                  {/* {question?.explanation && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Explanation</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{question.explanation}</p>
                    </div>
                  )} */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
