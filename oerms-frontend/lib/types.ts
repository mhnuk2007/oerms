// lib/types.ts
export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  authorities: string[];
  exp?: number;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  city: string;
  institution: string;
  profilePictureUrl?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PolicyRequest {
  action: string;
  resource: string;
  context?: Record<string, any>;
}

export interface PolicyResponse {
  allowed: boolean;
  reason?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email?: string;
  city: string;
  institution: string;
}

export interface InstitutionRequest {
  institution: string;
}

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  roles?: ('STUDENT' | 'TEACHER' | 'ADMIN')[];
}

export interface UserResponse {
  id: string;
  userName: string;
  email: string;
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  roles: ('STUDENT' | 'TEACHER' | 'ADMIN')[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  version: number;
}

export interface RegisterResponse {
  user: UserResponse;
  redirectUrl: string;
}

export interface ProfileSummaryResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  institution: string;
  profileCompleted: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UserProfileStatsResponse {
  total: number;
  active: number;
  completed: number;
  incomplete: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}

export interface Result {
  id: string;
  attemptId: string;
  userId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  generatedAt: string;
}

// ==================== Exam Service Types ====================

export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export interface ExamDTO {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startTime?: string;
  endTime?: string;
  status: ExamStatus;
  isActive: boolean;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy?: string;
}

export interface CreateExamRequest {
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startTime?: string;
  endTime?: string;
  allowMultipleAttempts?: boolean;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  instructions?: string;
}

export interface UpdateExamRequest {
  title?: string;
  description?: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  startTime?: string;
  endTime?: string;
  allowMultipleAttempts?: boolean;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  instructions?: string;
}

export interface ExamWithQuestionsDTO {
  exam: ExamDTO;
  questions: QuestionResponse[];
  questionCount: number;
  totalMarks: number;
  statistics: QuestionStatisticsDTO;
}

export interface ExamStatisticsDTO {
  examId: string;
  examTitle: string;
  totalQuestions: number;
  totalMarks: number;
  mcqCount: number;
  trueFalseCount: number;
  shortAnswerCount: number;
  essayCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  status: string;
}

export interface PageResponseExamDTO {
  content: ExamDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ExamStartResponse {
  exam: ExamDTO;
  attempt: AttemptResponse;
}

// ==================== Question Service Types ====================

export type QuestionType = 'MCQ' | 'MULTIPLE_ANSWER' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'FILL_BLANK' | 'MATCHING';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionDTO {
  id: string;
  examId: string;
  questionText: string;
  type: QuestionType;
  marks: number;
  orderIndex: number;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficultyLevel: DifficultyLevel;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  examId: string;
  questionText: string;
  type: QuestionType;
  marks: number;
  orderIndex?: number;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficultyLevel?: DifficultyLevel;
  imageUrl?: string;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  type?: QuestionType;
  marks?: number;
  orderIndex?: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficultyLevel?: DifficultyLevel;
  imageUrl?: string;
}

export interface BulkCreateQuestionsRequest {
  questions: CreateQuestionRequest[];
}

export interface StudentQuestionDTO {
  id: string;
  examId: string;
  questionText: string;
  type: QuestionType;
  marks: number;
  orderIndex: number;
  options?: string[];
  difficultyLevel: DifficultyLevel;
  imageUrl?: string;
}

export interface QuestionResponse {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  subject?: string;
  active: boolean;
}

export interface QuestionStatisticsDTO {
  examId: string;
  totalQuestions: number;
  totalMarks: number;
  mcqCount: number;
  trueFalseCount: number;
  shortAnswerCount: number;
  essayCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface QuestionSummaryDTO {
  examId: string;
  totalQuestions: number;
  totalMarks: number;
  questionsByType: Record<string, number>;
  questionsByDifficulty: Record<string, number>;
}

// ==================== Result Service Types ====================

export type ResultStatus = 'DRAFT' | 'PENDING_GRADING' | 'GRADED' | 'PUBLISHED' | 'WITHHELD';

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
  grade?: string;
  rank?: number;
  status: ResultStatus;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeTakenSeconds: number;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
  gradedByName?: string;
  publishedAt?: string;
  teacherFeedback?: string;
  teacherRemarks?: string;
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

export interface ResultSummaryDTO {
  id: string;
  examId: string;
  examTitle: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade?: string;
  passed: boolean;
  status: ResultStatus;
  publishedAt?: string;
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

export interface StartAttemptRequest {
  examId: string;
  timeLimitMinutes?: number;
}

export interface SaveAnswerRequest {
  questionId: string;
  selectedOptions?: string[];
  answerText?: string;
  flagged?: boolean;
  timeSpentSeconds?: number;
}

export interface PageResultSummaryDTO {
  content: ResultSummaryDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ==================== Attempt Service Types ====================

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'GRADED' | 'ABANDONED';

export interface AttemptResponse {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName?: string;
  attemptNumber: number;
  status: AttemptStatus;
  totalQuestions: number;
  answeredQuestions: number;
  flaggedQuestions: number;
  totalMarks: number;
  obtainedMarks?: number;
  percentage?: number;
  startedAt: string;
  submittedAt?: string;
  timeTakenSeconds?: number;
  remainingTimeSeconds?: number;
  tabSwitches: number;
  webcamViolations: number;
  autoSubmitted: boolean;
  reviewed: boolean;
  passed?: boolean;
  notes?: string;
  answers?: AttemptAnswerResponse[];
  createdAt: string;
}

export interface AttemptSummary {
  id: string;
  examId: string;
  examTitle: string;
  attemptNumber?: number;
  status: AttemptStatus;
  answeredQuestions?: number;
  totalQuestions?: number;
  obtainedMarks?: number;
  percentage?: number;
  startedAt: string;
  submittedAt?: string;
  score?: number; // Alias for obtainedMarks
  startTime?: string; // Alias for startedAt
  studentName?: string;
  passed?: boolean;
  totalMarks?: number;
}

export interface StartAttemptRequest {
  examId: string;
}

export interface SubmitAttemptRequest {
  attemptId: string;
}

export interface SaveAnswerRequest {
  questionId: string;
  selectedOptions?: string[];
  answerText?: string;
  flagged?: boolean;
  timeSpentSeconds?: number;
}

export interface AttemptAnswerResponse {
  id: string;
  questionId: string;
  questionOrder: number;
  selectedOptions?: string[];
  answerText?: string;
  isCorrect?: boolean;
  marksObtained?: number;
  marksAllocated: number;
  timeSpentSeconds?: number;
  flagged: boolean;
  answeredAt?: string;
}

export interface ExamAttemptStatistics {
  examId: string;
  examTitle: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore?: number;
  highestScore?: number;
  lowestScore?: number;
  passRate?: number;
  averageTimeSpent?: number;
  totalViolations: number;
  flaggedAttempts: number;
}

export interface PageAttemptSummary {
  content: AttemptSummary[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
