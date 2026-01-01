// lib/api/analytics.ts - Analytics and reporting service

import { apiClient } from './client';

// Analytics data types
export interface PerformanceTrend {
  examId: string;
  examTitle: string;
  scores: Array<{
    date: string;
    score: number;
    percentage: number;
  }>;
  averageScore: number;
  improvement: number;
}

export interface GradeDistribution {
  examId: string;
  examTitle: string;
  distribution: {
    '0-20': number;
    '21-40': number;
    '41-60': number;
    '61-80': number;
    '81-100': number;
  };
  totalStudents: number;
  averageScore: number;
  medianScore: number;
  standardDeviation: number;
}

export interface InstitutionAnalytics {
  institution: string;
  totalStudents: number;
  totalExams: number;
  averageScore: number;
  topPerformers: Array<{
    studentName: string;
    score: number;
    examTitle: string;
  }>;
  performanceTrend: Array<{
    month: string;
    averageScore: number;
  }>;
}

export interface SystemAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalExams: number;
  totalQuestions: number;
  totalAttempts: number;
  totalResults: number;
  averageScore: number;
  activeUsers: number;
  examsThisMonth: number;
  attemptsThisMonth: number;
  resultsThisMonth: number;
}

export interface ExamAnalytics {
  examId: string;
  examTitle: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTime: number; // in minutes
  questionAnalytics: Array<{
    questionId: string;
    questionText: string;
    correctPercentage: number;
    averageTime: number; // in seconds
    difficultyLevel: string;
  }>;
  scoreDistribution: {
    '0-20': number;
    '21-40': number;
    '41-60': number;
    '61-80': number;
    '81-100': number;
  };
}

export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  totalExams: number;
  completedExams: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  improvementTrend: number;
  subjectPerformance: Array<{
    subject: string;
    averageScore: number;
    examCount: number;
  }>;
  recentPerformance: Array<{
    examId: string;
    examTitle: string;
    score: number;
    date: string;
  }>;
}

export const analyticsService = {
  /**
   * Get student performance trend over time
   */
  async getStudentPerformanceTrend(studentId: string): Promise<PerformanceTrend[]> {
    return apiClient.get(`/api/analytics/student/${studentId}/performance-trend`);
  },

  /**
   * Get grade distribution for an exam
   */
  async getGradeDistribution(examId: string): Promise<GradeDistribution> {
    return apiClient.get(`/api/analytics/exam/${examId}/grade-distribution`);
  },

  /**
   * Get institution-wise analytics
   */
  async getInstitutionAnalytics(institution: string): Promise<InstitutionAnalytics> {
    return apiClient.get(`/api/analytics/institution/${encodeURIComponent(institution)}`);
  },

  /**
   * Get overall system analytics (Admin only)
   */
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    return apiClient.get('/api/analytics/system');
  },

  /**
   * Get detailed exam analytics
   */
  async getExamAnalytics(examId: string): Promise<ExamAnalytics> {
    return apiClient.get(`/api/analytics/exam/${examId}/detailed`);
  },

  /**
   * Get student analytics
   */
  async getStudentAnalytics(studentId: string): Promise<StudentAnalytics> {
    return apiClient.get(`/api/analytics/student/${studentId}`);
  },

  /**
   * Get top performers across all exams
   */
  async getTopPerformers(limit = 20): Promise<Array<{
    studentId: string;
    studentName: string;
    averageScore: number;
    examCount: number;
  }>> {
    return apiClient.get(`/api/analytics/top-performers?limit=${limit}`);
  },

  /**
   * Get exam performance comparison
   */
  async getExamComparison(examIds: string[]): Promise<Array<{
    examId: string;
    examTitle: string;
    averageScore: number;
    attemptCount: number;
    completionRate: number;
  }>> {
    return apiClient.post('/api/analytics/exams/comparison', { examIds });
  },

  /**
   * Get subject-wise performance analytics
   */
  async getSubjectAnalytics(): Promise<Array<{
    subject: string;
    totalExams: number;
    averageScore: number;
    studentCount: number;
  }>> {
    return apiClient.get('/api/analytics/subjects');
  },

  /**
   * Get time-based analytics
   */
  async getTimeBasedAnalytics(timeframe: 'week' | 'month' | 'year' = 'month'): Promise<{
    examsCreated: Array<{ period: string; count: number }>;
    attempts: Array<{ period: string; count: number }>;
    results: Array<{ period: string; count: number }>;
    averageScores: Array<{ period: string; score: number }>;
  }> {
    return apiClient.get(`/api/analytics/time-based?timeframe=${timeframe}`);
  },

  /**
   * Get question difficulty analytics
   */
  async getQuestionDifficultyAnalytics(examId?: string): Promise<Array<{
    questionId: string;
    questionText: string;
    correctPercentage: number;
    averageTime: number;
    difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
    examTitle?: string;
  }>> {
    const params = examId ? `?examId=${examId}` : '';
    return apiClient.get(`/api/analytics/questions/difficulty${params}`);
  },

  /**
   * Generate analytics report
   */
  async generateAnalyticsReport(type: 'student' | 'exam' | 'institution' | 'system', 
                                params: Record<string, any>): Promise<{
    reportId: string;
    downloadUrl: string;
    generatedAt: string;
    expiresAt: string;
  }> {
    return apiClient.post('/api/analytics/reports', {
      type,
      params,
      format: 'PDF'
    });
  },

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(): Promise<{
    overview: SystemAnalytics;
    recentActivity: Array<{
      type: 'exam' | 'attempt' | 'result';
      title: string;
      timestamp: string;
      status: string;
    }>;
    performanceSummary: {
      thisMonth: {
        examsCreated: number;
        attemptsCompleted: number;
        averageScore: number;
      };
      lastMonth: {
        examsCreated: number;
        attemptsCompleted: number;
        averageScore: number;
      };
    };
    topExams: Array<{
      examId: string;
      title: string;
      attemptCount: number;
      averageScore: number;
    }>;
    alerts: Array<{
      type: 'warning' | 'info' | 'error';
      message: string;
      timestamp: string;
    }>;
  }> {
    return apiClient.get('/api/analytics/dashboard');
  }
};
