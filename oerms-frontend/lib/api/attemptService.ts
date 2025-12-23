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

export interface QuestionInfo {
  questionId: string;
  marks: number;
}

export interface StartAttemptRequest {
  examId: string;
  examTitle?: string;
  duration?: number;
  studentId?: string;
  studentName?: string;
  ipAddress?: string;
  userAgent?: string;
  questions?: QuestionInfo[];
}

export interface SaveAnswerRequest {
  questionId: string;
  selectedOptions?: string[];
  answerText?: string;
  flagged?: boolean;
  timeSpentSeconds?: number;
}

export interface SubmitAttemptRequest {
  attemptId: string;
  notes?: string;
}

export interface AttemptAnswerResponse {
  questionId: string;
  questionOrder: number;
  selectedOptions: string[];
  answerText: string;
  correct: boolean;
  marksAllocated: number;
  marksObtained: number;
  timeSpentSeconds: number;
  flagged: boolean;
  answeredAt: string;
}

export interface AttemptResponse {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'GRADED' | 'ABANDONED';
  totalQuestions: number;
  answeredQuestions: number;
  flaggedQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string;
  timeTakenSeconds: number;
  remainingTimeSeconds: number;
  tabSwitches: number;
  webcamViolations: number;
  autoSubmitted: boolean;
  reviewed: boolean;
  notes: string;
  answers: AttemptAnswerResponse[];
}

export interface AttemptSummary {
  id: string;
  examId: string;
  examTitle: string;
  attemptNumber: number;
  status: string;
  answeredQuestions: number;
  totalQuestions: number;
  obtainedMarks: number;
  percentage: number;
  startedAt: string;
  submittedAt: string;
}

export const AttemptService = {
  recordWebcamViolation: (attemptId: string) => 
    request<ApiResponse<void>>('POST', `/api/attempts/${attemptId}/webcam-violation`),

  recordCustomViolation: (attemptId: string, violationType: string) => 
    request<ApiResponse<void>>('POST', `/api/attempts/${attemptId}/violations/custom`, null, { violationType }),

  recordTabSwitch: (attemptId: string) => 
    request<ApiResponse<void>>('POST', `/api/attempts/${attemptId}/tab-switch`),

  getAttemptAnswers: (attemptId: string) => 
    request<ApiResponse<AttemptAnswerResponse[]>>('GET', `/api/attempts/${attemptId}/answers`),

  saveAnswer: (attemptId: string, data: SaveAnswerRequest) => 
    request<ApiResponse<AttemptAnswerResponse>>('POST', `/api/attempts/${attemptId}/answers`, data),

  submitAttempt: (data: SubmitAttemptRequest) => 
    request<ApiResponse<AttemptResponse>>('POST', `/api/attempts/submit`, data),

  startAttempt: (data: StartAttemptRequest) => 
    request<ApiResponse<AttemptResponse>>('POST', `/api/attempts/start`, data),

  getAttempt: (attemptId: string) => 
    request<ApiResponse<AttemptResponse>>('GET', `/api/attempts/${attemptId}`),

  getStudentAttempts: (studentId: string, page = 0, size = 20) => 
    request<ApiResponse<Page<AttemptSummary>>>('GET', `/api/attempts/student/${studentId}`, null, { page, size }),

  getMyAttempts: (page = 0, size = 20) => 
    request<ApiResponse<Page<AttemptSummary>>>('GET', `/api/attempts/my-attempts`, null, { page, size }),

  getMyExamAttempts: (examId: string, page = 0, size = 20) => 
    request<ApiResponse<Page<AttemptSummary>>>('GET', `/api/attempts/my-attempts/exam/${examId}`, null, { page, size }),

  getMyAttemptsCount: () => 
    request<ApiResponse<number>>('GET', `/api/attempts/my-attempts/count`),

  checkHealth: () => 
    request<ApiResponse<string>>('GET', `/api/attempts/health`),

  getExamAttempts: (examId: string, page = 0, size = 20) => 
    request<ApiResponse<Page<AttemptSummary>>>('GET', `/api/attempts/exam/${examId}`, null, { page, size }),

  getExamAttemptsCount: (examId: string) => 
    request<ApiResponse<number>>('GET', `/api/attempts/exam/${examId}/count`),

  getAllAttempts: (page = 0, size = 20) => 
    request<ApiResponse<Page<AttemptSummary>>>('GET', `/api/attempts/all`, null, { page, size }),
};