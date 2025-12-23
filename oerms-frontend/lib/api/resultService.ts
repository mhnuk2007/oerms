const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const request = async <T>(
  method: string,
  url: string,
  body?: any,
  params?: Record<string, any>
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let fullUrl = `${API_URL}${url}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    fullUrl += `?${searchParams.toString()}`;
  }

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ResultDTO {
  id: string;
  attemptId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passingMarks: number;
  passed: boolean;
  grade: string;
  rank: number;
  status: 'DRAFT' | 'PENDING_GRADING' | 'GRADED' | 'PUBLISHED' | 'WITHHELD';
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeTakenSeconds: number;
  submittedAt: string;
  gradedAt: string;
  gradedBy: string;
  gradedByName: string;
  publishedAt: string;
  teacherFeedback: string;
  teacherRemarks: string;
  autoGraded: boolean;
  requiresManualGrading: boolean;
  objectiveMarks: number;
  subjectiveMarks: number;
  tabSwitches: number;
  webcamViolations: number;
  suspiciousActivity: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublishResultRequest {
  resultId: string;
  comments?: string;
  calculateRankings?: boolean;
}

export interface GradeResultRequest {
  resultId: string;
  obtainedMarks: number;
  comments?: string;
}

export interface ResultQuestionDetailDTO {
  questionId: string;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  studentSelectedOptions: string[];
  studentAnswerText: string;
  isCorrect: boolean;
  marksAllocated: number;
  marksObtained: number;
}

export interface ResultDetailsResponse {
  resultId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  passed: boolean;
  status: string;
  submittedAt: string;
  publishedAt: string;
  timeTakenSeconds: number;
  questions: ResultQuestionDetailDTO[];
}

export interface ResultSummaryDTO {
  id: string;
  examId: string;
  examTitle: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  passed: boolean;
  status: string;
  publishedAt: string;
}

export interface StudentStatisticsDTO {
  studentId: string;
  totalResults: number;
  publishedResults: number;
  averageScore: number;
  recentResults: ResultSummaryDTO[];
}

export interface ExamResultStatisticsDTO {
  examId: string;
  examTitle: string;
  totalResults: number;
  publishedResults: number;
  pendingGrading: number;
  withheldResults: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  medianScore: number;
  averagePercentage: number;
  passRate: number;
  passedCount: number;
  failedCount: number;
  gradeDistribution: Record<string, number>;
  suspiciousResultsCount: number;
  averageTimeSpent: number;
}

export const ResultService = {
  unpublishResult: (id: string) => 
    request<ApiResponse<ResultDTO>>('POST', `/api/results/${id}/unpublish`),

  publishResult: (id: string, data: PublishResultRequest) => 
    request<ApiResponse<ResultDTO>>('POST', `/api/results/${id}/publish`, data),

  gradeResult: (id: string, data: GradeResultRequest) => 
    request<ApiResponse<ResultDTO>>('POST', `/api/results/${id}/grade`, data),

  calculateRankings: (examId: string) => 
    request<ApiResponse<void>>('POST', `/api/results/exam/${examId}/calculate-rankings`),

  getResult: (id: string) => 
    request<ApiResponse<ResultDTO>>('GET', `/api/results/${id}`),

  deleteResult: (id: string) => 
    request<ApiResponse<void>>('DELETE', `/api/results/${id}`),

  getResultDetails: (id: string) => 
    request<ApiResponse<ResultDetailsResponse>>('GET', `/api/results/${id}/details`),

  getSuspiciousResults: () => 
    request<ApiResponse<ResultSummaryDTO[]>>('GET', `/api/results/suspicious`),

  getStudentStatistics: (studentId: string) => 
    request<ApiResponse<StudentStatisticsDTO>>('GET', `/api/results/student/${studentId}/statistics`),

  getPendingGradingResults: () => 
    request<ApiResponse<ResultSummaryDTO[]>>('GET', `/api/results/pending-grading`),

  getMyStatistics: () => 
    request<ApiResponse<StudentStatisticsDTO>>('GET', `/api/results/my-statistics`),

  getMyResults: (page = 0, size = 20, sortBy = 'publishedAt', sortDir = 'DESC') => 
    request<ApiResponse<Page<ResultSummaryDTO>>>('GET', `/api/results/my-results`, null, { page, size, sortBy, sortDir }),

  getMyExamResults: (examId: string, page = 0, size = 20) => 
    request<ApiResponse<Page<ResultSummaryDTO>>>('GET', `/api/results/my-results/exam/${examId}`, null, { page, size }),

  checkHealth: () => 
    request<ApiResponse<string>>('GET', `/api/results/health`),

  getExamResults: (examId: string, page = 0, size = 20, sortBy = 'submittedAt', sortDir = 'DESC') => 
    request<ApiResponse<Page<ResultSummaryDTO>>>('GET', `/api/results/exam/${examId}`, null, { page, size, sortBy, sortDir }),

  getTopScorers: (examId: string, limit = 10) => 
    request<ApiResponse<ResultSummaryDTO[]>>('GET', `/api/results/exam/${examId}/top-scorers`, null, { limit }),

  getSuspiciousResultsByExam: (examId: string) => 
    request<ApiResponse<ResultSummaryDTO[]>>('GET', `/api/results/exam/${examId}/suspicious`),

  getExamStatistics: (examId: string) => 
    request<ApiResponse<ExamResultStatisticsDTO>>('GET', `/api/results/exam/${examId}/statistics`),

  getPendingGradingByExam: (examId: string) => 
    request<ApiResponse<ResultSummaryDTO[]>>('GET', `/api/results/exam/${examId}/pending-grading`),

  getResultByAttemptId: (attemptId: string) => 
    request<ApiResponse<ResultDTO>>('GET', `/api/results/attempt/${attemptId}`),
};