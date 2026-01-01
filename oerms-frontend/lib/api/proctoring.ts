// lib/api/proctoring.ts - Proctoring and monitoring service

import { apiClient } from './client';

// Proctoring event types
export interface ProctoringViolation {
  id: string;
  attemptId: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  violationType: 'WEBCAM_DISABLED' | 'TAB_SWITCH' | 'COPY_PASTE' | 'MULTIPLE_FACES' | 'AUDIO_DETECTED' | 'CUSTOM';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  evidenceUrl?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface ProctoringSession {
  attemptId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';
  violations: ProctoringViolation[];
  webcamStatus: 'ENABLED' | 'DISABLED' | 'ERROR';
  microphoneStatus: 'ENABLED' | 'DISABLED' | 'ERROR';
  screenShareStatus: 'ENABLED' | 'DISABLED' | 'ERROR';
  totalViolations: number;
  criticalViolations: number;
}

export interface ProctoringSettings {
  examId: string;
  webcamRequired: boolean;
  microphoneRequired: boolean;
  screenShareRequired: boolean;
  allowTabSwitch: boolean;
  allowCopyPaste: boolean;
  allowRightClick: boolean;
  allowKeyboardShortcuts: boolean;
  maxViolationsAllowed: number;
  autoTerminateOnViolation: boolean;
  violationThresholds: {
    webcamDisabled: number; // minutes
    tabSwitch: number; // count
    multipleFaces: number; // count
    audioDetected: number; // count
  };
}

export interface ProctoringAlert {
  id: string;
  examId: string;
  examTitle: string;
  attemptId: string;
  studentName: string;
  violationType: string;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface ProctoringStatistics {
  totalActiveSessions: number;
  totalViolationsToday: number;
  criticalViolationsToday: number;
  mostCommonViolation: string;
  averageSessionDuration: number;
  violationsByType: Record<string, number>;
  examsWithViolations: number;
  flaggedStudents: number;
}

export const proctoringService = {
  /**
   * Get proctoring session details
   */
  async getProctoringSession(attemptId: string): Promise<ProctoringSession> {
    return apiClient.get(`/api/proctoring/session/${attemptId}`);
  },

  /**
   * Get all active proctoring sessions
   */
  async getActiveSessions(): Promise<ProctoringSession[]> {
    return apiClient.get('/api/proctoring/sessions/active');
  },

  /**
   * Record webcam violation
   */
  async recordWebcamViolation(attemptId: string, description?: string): Promise<void> {
    return apiClient.post(`/api/proctoring/violations/webcam/${attemptId}`, {
      description: description || 'Webcam was disabled or not detected'
    });
  },

  /**
   * Record tab switch violation
   */
  async recordTabSwitch(attemptId: string, description?: string): Promise<void> {
    return apiClient.post(`/api/proctoring/violations/tab-switch/${attemptId}`, {
      description: description || 'Student switched to another tab'
    });
  },

  /**
   * Record copy/paste violation
   */
  async recordCopyPasteViolation(attemptId: string, description?: string): Promise<void> {
    return apiClient.post(`/api/proctoring/violations/copy-paste/${attemptId}`, {
      description: description || 'Copy or paste action detected'
    });
  },

  /**
   * Record multiple faces detection
   */
  async recordMultipleFacesViolation(attemptId: string, description?: string): Promise<void> {
    return apiClient.post(`/api/proctoring/violations/multiple-faces/${attemptId}`, {
      description: description || 'Multiple faces detected in webcam feed'
    });
  },

  /**
   * Record audio violation
   */
  async recordAudioViolation(attemptId: string, description?: string): Promise<void> {
    return apiClient.post(`/api/proctoring/violations/audio/${attemptId}`, {
      description: description || 'Audio detected during exam'
    });
  },

  /**
   * Record custom violation
   */
  async recordCustomViolation(attemptId: string, violationType: string, description: string): Promise<void> {
    return apiClient.post(`/api/proctoring/violations/custom/${attemptId}`, {
      violationType,
      description
    });
  },

  /**
   * Get violations for a specific exam
   */
  async getExamViolations(examId: string, params?: { 
    page?: number; 
    size?: number; 
    severity?: string;
    resolved?: boolean;
  }): Promise<{
    content: ProctoringViolation[];
    totalElements: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());

    return apiClient.get(`/api/proctoring/violations/exam/${examId}?${queryParams.toString()}`);
  },

  /**
   * Get violations for a specific student
   */
  async getStudentViolations(studentId: string, params?: { 
    page?: number; 
    size?: number;
  }): Promise<{
    content: ProctoringViolation[];
    totalElements: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    return apiClient.get(`/api/proctoring/violations/student/${studentId}?${queryParams.toString()}`);
  },

  /**
   * Get all violations with filtering
   */
  async getAllViolations(params?: { 
    page?: number; 
    size?: number; 
    severity?: string;
    resolved?: boolean;
    examId?: string;
    studentId?: string;
  }): Promise<{
    content: ProctoringViolation[];
    totalElements: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());
    if (params?.examId) queryParams.append('examId', params.examId);
    if (params?.studentId) queryParams.append('studentId', params.studentId);

    return apiClient.get(`/api/proctoring/violations?${queryParams.toString()}`);
  },

  /**
   * Resolve a violation
   */
  async resolveViolation(violationId: string, resolutionNotes: string): Promise<void> {
    return apiClient.put(`/api/proctoring/violations/${violationId}/resolve`, {
      resolutionNotes
    });
  },

  /**
   * Get proctoring settings for an exam
   */
  async getProctoringSettings(examId: string): Promise<ProctoringSettings> {
    return apiClient.get(`/api/proctoring/settings/${examId}`);
  },

  /**
   * Update proctoring settings for an exam
   */
  async updateProctoringSettings(examId: string, settings: Partial<ProctoringSettings>): Promise<ProctoringSettings> {
    return apiClient.put(`/api/proctoring/settings/${examId}`, settings);
  },

  /**
   * Get proctoring alerts
   */
  async getProctoringAlerts(params?: {
    acknowledged?: boolean;
    severity?: string;
    examId?: string;
  }): Promise<ProctoringAlert[]> {
    const queryParams = new URLSearchParams();
    if (params?.acknowledged !== undefined) queryParams.append('acknowledged', params.acknowledged.toString());
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.examId) queryParams.append('examId', params.examId);

    return apiClient.get(`/api/proctoring/alerts?${queryParams.toString()}`);
  },

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    return apiClient.put(`/api/proctoring/alerts/${alertId}/acknowledge`);
  },

  /**
   * Get proctoring statistics
   */
  async getProctoringStatistics(): Promise<ProctoringStatistics> {
    return apiClient.get('/api/proctoring/statistics');
  },

  /**
   * Start proctoring session monitoring
   */
  async startProctoringSession(attemptId: string): Promise<void> {
    return apiClient.post(`/api/proctoring/session/${attemptId}/start`);
  },

  /**
   * End proctoring session
   */
  async endProctoringSession(attemptId: string): Promise<void> {
    return apiClient.post(`/api/proctoring/session/${attemptId}/end`);
  },

  /**
   * Pause proctoring session
   */
  async pauseProctoringSession(attemptId: string): Promise<void> {
    return apiClient.post(`/api/proctoring/session/${attemptId}/pause`);
  },

  /**
   * Resume proctoring session
   */
  async resumeProctoringSession(attemptId: string): Promise<void> {
    return apiClient.post(`/api/proctoring/session/${attemptId}/resume`);
  },

  /**
   * Terminate proctoring session
   */
  async terminateProctoringSession(attemptId: string, reason: string): Promise<void> {
    return apiClient.post(`/api/proctoring/session/${attemptId}/terminate`, {
      reason
    });
  },

  /**
   * Get violation evidence
   */
  async getViolationEvidence(violationId: string): Promise<{
    images: string[];
    videos: string[];
    audio: string[];
    screenshots: string[];
  }> {
    return apiClient.get(`/api/proctoring/violations/${violationId}/evidence`);
  },

  /**
   * Report suspicious activity
   */
  async reportSuspiciousActivity(examId: string, studentId: string, description: string): Promise<void> {
    return apiClient.post('/api/proctoring/suspicious-activity', {
      examId,
      studentId,
      description,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Get exam security status
   */
  async getExamSecurityStatus(examId: string): Promise<{
    totalAttempts: number;
    monitoredAttempts: number;
    violationCount: number;
    securityScore: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    flaggedStudents: number;
    lastViolationTime?: string;
  }> {
    return apiClient.get(`/api/proctoring/security-status/${examId}`);
  }
};
