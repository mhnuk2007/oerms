import { Answer } from './attempt';
import { Question } from './exam';

export interface QuestionResult {
  questionId: string;
  question: Question;
  answer: Answer;
  marksAwarded: number;
  maxMarks: number;
  isCorrect?: boolean;
  feedback?: string;
  timeSpentSeconds?: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  attemptId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  startedAt: string;
  submittedAt: string;
  gradedAt: string;
  questionResults: QuestionResult[];
  timeSpentSeconds: number;
  status: 'PASS' | 'FAIL' | 'PENDING';
}

export interface ResultAnalytics {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passPercentage: number;
  averageTimeSpent: number;
  questionAnalytics: {
    questionId: string;
    averageScore: number;
    correctPercentage: number;
    averageTimeSpent: number;
    difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  }[];
  timeDistribution: {
    range: string;
    count: number;
  }[];
  scoreDistribution: {
    range: string;
    count: number;
  }[];
}