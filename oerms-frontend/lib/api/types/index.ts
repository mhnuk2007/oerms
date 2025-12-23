// OpenAPI-generated types for OERMS API
// Generated from backend OpenAPI specifications
// This file serves as a foundation until actual OpenAPI specs are available

// ==================== Common Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
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

// ==================== Auth Service Types ====================

export interface User {
  id: string;
  userName: string;
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

export interface PageResponseExamDTO extends PageResponse<ExamDTO> {
  content: ExamDTO[];
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
  score?: number;
  startTime?: string;
  studentName?: string;
  passed?: boolean;
  totalMarks?: number;
}

export interface StartAttemptRequest {
  examId: string;
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
  correct?: boolean;
  marksObtained?: number;
  marksAllocated: number;
  timeSpentSeconds?: number;
  flagged: boolean;
  answeredAt?: string;
}

export interface PageAttemptSummary extends PageResponse<AttemptSummary> {
  content: AttemptSummary[];
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

export interface PageResultSummaryDTO extends PageResponse<ResultSummaryDTO> {
  content: ResultSummaryDTO[];
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

export interface ResultDetailsResponse {
  resultId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string;
  passed: boolean;
  status: ResultStatus;
  submittedAt: string;
  publishedAt?: string;
  timeTakenSeconds: number;
  questions: ResultQuestionDetailDTO[];
}

export interface ResultQuestionDetailDTO {
  questionId: string;
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  studentSelectedOptions?: string[];
  studentAnswerText?: string;
  isCorrect: boolean;
  marksAllocated: number;
  marksObtained: number;
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

// ==================== Profile Service Types ====================

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

export interface ProfileSummaryResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  institution: string;
  profileCompleted: boolean;
}

export interface UserProfileStatsResponse {
  total: number;
  active: number;
  completed: number;
  incomplete: number;
}

// ==================== API Request/Response Types ====================

// Auth API
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Exam API
export interface GetExamsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  status?: ExamStatus;
  teacherId?: string;
}

export interface ExamStartResponse {
  exam: ExamDTO;
  attempt: AttemptResponse;
}

export interface ExamWithQuestionsDTO {
  exam: ExamDTO;
  questions: QuestionResponse[];
  questionCount: number;
  totalMarks: number;
  statistics: QuestionStatisticsDTO;
}

// Question API
export interface GetQuestionsParams {
  examId?: string;
  page?: number;
  size?: number;
  difficulty?: DifficultyLevel;
  type?: QuestionType;
}

export interface BulkCreateQuestionsRequest {
  questions: CreateQuestionRequest[];
}

export interface QuestionSummaryDTO {
  examId: string;
  totalQuestions: number;
  totalMarks: number;
  questionsByType: Record<string, number>;
  questionsByDifficulty: Record<string, number>;
}

// Attempt API
export interface GetAttemptsParams {
  page?: number;
  size?: number;
  examId?: string;
  studentId?: string;
  status?: AttemptStatus;
}

export interface SubmitAttemptRequest {
  attemptId: string;
}

// Result API
export interface GetResultsParams {
  page?: number;
  size?: number;
  examId?: string;
  studentId?: string;
  status?: ResultStatus;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Admin API
export interface GetUsersParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  role?: string;
  enabled?: boolean;
}

export interface AssignRoleRequest {
  userId: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

// ==================== Utility Types ====================

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// ==================== Notes ====================
// This file contains comprehensive TypeScript types for the OERMS API
// In production, these would be generated from OpenAPI specifications using:
// npx openapi-typescript ./docs/api-spec.json -o ./lib/api/types/index.ts
//
// To regenerate from actual backend specs:
// 1. Obtain OpenAPI JSON specs from backend team
// 2. Run the generation commands above
// 3. Update any custom types that aren't in the specs
