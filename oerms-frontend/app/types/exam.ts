export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'ENDED';

export interface Question {
  id: string;
  type: 'MCQ' | 'SUBJECTIVE';
  questionText: string;
  marks: number;
  negativeMarks?: number;
  options?: {
    id: string;
    text: string;
  }[];
  correctOptionIds?: string[];
  instructions?: string;
  metadata?: Record<string, unknown>;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  startTime?: string; // ISO8601
  endTime?: string; // ISO8601
  durationSeconds: number;
  allowedAttempts?: number;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: ExamStatus;
  settings?: {
    shuffleQuestions?: boolean;
    showAnswersAfterSubmit?: boolean;
  };
  questionCount?: number;
  totalMarks?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}