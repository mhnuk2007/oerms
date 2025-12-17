// lib/stores/exam-store.ts - Exam state management with Zustand

import { create } from 'zustand';
import type { ExamDTO } from '@/lib/types';

interface ExamState {
  // Current exam being viewed/edited
  currentExam: ExamDTO | null;

  // List of exams
  exams: ExamDTO[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentExam: (exam: ExamDTO | null) => void;
  setExams: (exams: ExamDTO[]) => void;
  addExam: (exam: ExamDTO) => void;
  updateExam: (id: string, updates: Partial<ExamDTO>) => void;
  removeExam: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computed properties
  getExamById: (id: string) => ExamDTO | undefined;
  getPublishedExams: () => ExamDTO[];
  getDraftExams: () => ExamDTO[];
  getActiveExams: () => ExamDTO[];
}

export const useExamStore = create<ExamState>((set, get) => ({
  currentExam: null,
  exams: [],
  isLoading: false,
  error: null,

  setCurrentExam: (exam) => set({ currentExam: exam }),

  setExams: (exams) => set({ exams, error: null }),

  addExam: (exam) => set((state) => ({
    exams: [exam, ...state.exams]
  })),

  updateExam: (id, updates) => set((state) => ({
    exams: state.exams.map(exam =>
      exam.id === id ? { ...exam, ...updates } : exam
    ),
    currentExam: state.currentExam?.id === id
      ? { ...state.currentExam, ...updates }
      : state.currentExam
  })),

  removeExam: (id) => set((state) => ({
    exams: state.exams.filter(exam => exam.id !== id),
    currentExam: state.currentExam?.id === id ? null : state.currentExam
  })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set({
    currentExam: null,
    exams: [],
    isLoading: false,
    error: null
  }),

  // Computed properties
  getExamById: (id) => {
    const { exams } = get();
    return exams.find(exam => exam.id === id);
  },

  getPublishedExams: () => {
    const { exams } = get();
    return exams.filter(exam => exam.status === 'PUBLISHED');
  },

  getDraftExams: () => {
    const { exams } = get();
    return exams.filter(exam => exam.status === 'DRAFT');
  },

  getActiveExams: () => {
    const { exams } = get();
    return exams.filter(exam => exam.status === 'ONGOING' || exam.status === 'PUBLISHED');
  }
}));
