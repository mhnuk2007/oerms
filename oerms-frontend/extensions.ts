export interface ProfileSearchParams {
  keyword?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  totalExamsTaken: number;
  averageScore: number;
  completionRate: number;
  examsPassed: number;
  studyTimeMinutes: number;
}

export interface Question {
  id?: string;
  text: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'CODE';
  options?: string[];
  correctAnswer?: string;
  points: number;
  tags?: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface ViolationData {
  timestamp: string;
  evidenceUrl?: string;
  metadata?: Record<string, any>;
}

export interface GradeResultData {
  score: number;
  feedback?: string;
  graderId: string;
  gradedAt: string;
}

export interface PublishResultData {
  publishDate: string;
  notifyStudents: boolean;
  showCorrectAnswers: boolean;
}

export interface ExamStatistics {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  averageDurationMinutes: number;
}

export interface GradeDistribution {
  range: string;
  count: number;
  percentage: number;
}