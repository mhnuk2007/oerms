import { Question, Exam } from './exam';

export type AnswerType = string | string[]; // string[] for MCQ multiple answers, string for both MCQ single and subjective

export interface Answer {
  questionId: string;
  answer: AnswerType;
  answeredAt: string; // ISO8601
  timeSpentSeconds?: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startedAt: string; // ISO8601
  expiresAt: string; // ISO8601
  submittedAt?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  answers: Answer[];
  lastSavedAt?: string;
  currentQuestionIndex?: number;
}

export interface ExamSession {
  attempt: ExamAttempt;
  exam: Exam;
  questions: Question[];
}