export enum ResultStatus {
  DRAFT = 'DRAFT',
  PENDING_GRADING = 'PENDING_GRADING',
  GRADED = 'GRADED',
  PUBLISHED = 'PUBLISHED',
  WITHHELD = 'WITHHELD',
}

export interface Result {
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

export interface ResultSummary {
  id: string;
  examId: string;
  examTitle: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  passed: boolean;
  status: ResultStatus;
  publishedAt?: string;
  submittedAt: string;
}

export interface ResultDetails extends Result {
  questions: ResultQuestionDetail[];
}

export interface ResultQuestionDetail {
  questionId: string;
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  studentSelectedOptions?: string[];
  studentAnswerText?: string;
  isCorrect: boolean;
  marksAllocated: number;
  marksObtained: number;
}

export interface ExamResultStatistics {
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

export interface StudentStatistics {
  studentId: string;
  totalResults: number;
  publishedResults: number;
  averageScore: number;
  recentResults: ResultSummary[];
}

export interface PerformanceTrend {
  studentId: string;
  studentName: string;
  totalExams: number;
  overallAveragePercentage: number;
  overallAverageScore: number;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  dataPoints: TrendDataPoint[];
}

export interface TrendDataPoint {
  examId: string;
  examTitle: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  passed: boolean;
  submittedAt: string;
}

export interface PublicationStatus {
  examId: string;
  examTitle: string;
  totalResults: number;
  publishedResults: number;
  unpublishedResults: number;
  draftResults: number;
  pendingGradingResults: number;
  gradedResults: number;
  withheldResults: number;
  publicationRate: number;
}

export interface ResultSearchCriteria {
  studentName?: string;
  examId?: string;
  status?: ResultStatus;
  passed?: boolean;
  minPercentage?: number;
  maxPercentage?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}