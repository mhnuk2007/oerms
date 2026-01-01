// lib/api/admin.ts - Administrative functions service

import { apiClient } from './client';

// Admin data types
export interface SystemHealth {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  services: {
    auth: 'UP' | 'DOWN' | 'DEGRADED';
    user: 'UP' | 'DOWN' | 'DEGRADED';
    exam: 'UP' | 'DOWN' | 'DEGRADED';
    question: 'UP' | 'DOWN' | 'DEGRADED';
    attempt: 'UP' | 'DOWN' | 'DEGRADED';
    result: 'UP' | 'DOWN' | 'DEGRADED';
    notification: 'UP' | 'DOWN' | 'DEGRADED';
  };
  uptime: number; // in seconds
  lastCheck: string;
  responseTimes: Record<string, number>; // in milliseconds
}

export interface DashboardStats {
  totalUsers: number;
  totalExams: number;
  totalAttempts: number;
  pendingGrading: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  lastLogin?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  duration: number;
  questionCount: number;
  createdAt: string;
}

export interface UserManagementOperation {
  operation: 'BULK_ENABLE' | 'BULK_DISABLE' | 'BULK_DELETE' | 'BULK_EXPORT' | 'BULK_IMPORT';
  userIds: string[];
  parameters?: Record<string, any>;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  progress: number; // 0-100
  result?: {
    successCount: number;
    failedCount: number;
    errors: string[];
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export interface SystemConfiguration {
  key: string;
  value: string;
  description: string;
  category: 'SYSTEM' | 'SECURITY' | 'EXAM' | 'PROCTORING' | 'NOTIFICATION';
  updatedBy: string;
  updatedAt: string;
  isEncrypted: boolean;
}

export interface BulkOperation {
  id: string;
  type: 'USER_BULK' | 'EXAM_BULK' | 'QUESTION_BULK' | 'RESULT_BULK';
  operation: string;
  parameters: Record<string, any>;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  progress: number;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  errors: Array<{
    itemId: string;
    error: string;
  }>;
}

export interface SystemReport {
  id: string;
  type: 'USER_ACTIVITY' | 'EXAM_PERFORMANCE' | 'SYSTEM_USAGE' | 'SECURITY_AUDIT';
  title: string;
  generatedAt: string;
  generatedBy: string;
  parameters: Record<string, any>;
  fileUrl: string;
  fileSize: number;
  expiresAt: string;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
}

export const adminService = {
  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return apiClient.get('/api/admin/system/health');
  },

  /**
   * Get dashboard statistics (counts for users, exams, etc.)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get('/api/admin/dashboard/stats');
  },

  /**
   * Get system metrics and statistics
   */
  async getSystemMetrics(): Promise<{
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkTraffic: {
      incoming: number;
      outgoing: number;
    };
    activeConnections: number;
    requestRate: number;
    errorRate: number;
  }> {
    return apiClient.get('/api/admin/system/metrics');
  },

  /**
   * Get users list with filtering
   */
  async getUsers(params?: {
    page?: number;
    size?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{
    content: User[];
    totalElements: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    return apiClient.get(`/api/admin/users?${queryParams.toString()}`);
  },

  /**
   * Get exams list with filtering
   */
  async getExams(params?: {
    page?: number;
    size?: number;
    status?: string;
    search?: string;
  }): Promise<{
    content: Exam[];
    totalElements: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    return apiClient.get(`/api/admin/exams?${queryParams.toString()}`);
  },

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(params?: {
    page?: number;
    size?: number;
    userId?: string;
    action?: string;
    resource?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    content: AuditLog[];
    totalElements: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.resource) queryParams.append('resource', params.resource);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return apiClient.get(`/api/admin/audit/logs?${queryParams.toString()}`);
  },

  /**
   * Get system configuration
   */
  async getSystemConfiguration(): Promise<SystemConfiguration[]> {
    return apiClient.get('/api/admin/system/configuration');
  },

  /**
   * Update system configuration
   */
  async updateSystemConfiguration(configurations: SystemConfiguration[]): Promise<SystemConfiguration[]> {
    return apiClient.put('/api/admin/system/configuration', configurations);
  },

  /**
   * Get bulk operations status
   */
  async getBulkOperations(params?: {
    page?: number;
    size?: number;
    type?: string;
    status?: string;
  }): Promise<{
    content: BulkOperation[];
    totalElements: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    return apiClient.get(`/api/admin/bulk-operations?${queryParams.toString()}`);
  },

  /**
   * Get bulk operation details
   */
  async getBulkOperation(operationId: string): Promise<BulkOperation> {
    return apiClient.get(`/api/admin/bulk-operations/${operationId}`);
  },

  /**
   * Cancel bulk operation
   */
  async cancelBulkOperation(operationId: string): Promise<void> {
    return apiClient.post(`/api/admin/bulk-operations/${operationId}/cancel`);
  },

  /**
   * Perform bulk user operations
   */
  async performBulkUserOperation(operation: 'BULK_ENABLE' | 'BULK_DISABLE' | 'BULK_DELETE' | 'BULK_EXPORT', 
                                userIds: string[], 
                                parameters?: Record<string, any>): Promise<{
    operationId: string;
    estimatedDuration: number; // in seconds
  }> {
    return apiClient.post('/api/admin/users/bulk', {
      operation,
      userIds,
      parameters
    });
  },

  /**
   * Perform bulk exam operations
   */
  async performBulkExamOperation(operation: 'BULK_PUBLISH' | 'BULK_UNPUBLISH' | 'BULK_DELETE' | 'BULK_ARCHIVE',
                                 examIds: string[],
                                 parameters?: Record<string, any>): Promise<{
    operationId: string;
    estimatedDuration: number;
  }> {
    return apiClient.post('/api/admin/exams/bulk', {
      operation,
      examIds,
      parameters
    });
  },

  /**
   * Perform bulk question operations
   */
  async performBulkQuestionOperation(operation: 'BULK_DELETE' | 'BULK_IMPORT' | 'BULK_EXPORT',
                                     questionIdsOrData: string[] | any[],
                                     parameters?: Record<string, any>): Promise<{
    operationId: string;
    estimatedDuration: number;
  }> {
    return apiClient.post('/api/admin/questions/bulk', {
      operation,
      questionIds: Array.isArray(questionIdsOrData) && typeof questionIdsOrData[0] === 'string' ? questionIdsOrData : undefined,
      questionsData: !Array.isArray(questionIdsOrData) || typeof questionIdsOrData[0] !== 'string' ? questionIdsOrData : undefined,
      parameters
    });
  },

  /**
   * Perform bulk result operations
   */
  async performBulkResultOperation(operation: 'BULK_PUBLISH' | 'BULK_UNPUBLISH' | 'BULK_DELETE' | 'BULK_EXPORT',
                                   resultIds: string[],
                                   parameters?: Record<string, any>): Promise<{
    operationId: string;
    estimatedDuration: number;
  }> {
    return apiClient.post('/api/admin/results/bulk', {
      operation,
      resultIds,
      parameters
    });
  },

  /**
   * Generate system report
   */
  async generateSystemReport(type: 'USER_ACTIVITY' | 'EXAM_PERFORMANCE' | 'SYSTEM_USAGE' | 'SECURITY_AUDIT',
                            parameters: Record<string, any>): Promise<{
    reportId: string;
    estimatedGenerationTime: number; // in seconds
  }> {
    return apiClient.post('/api/admin/reports/generate', {
      type,
      parameters,
      format: 'PDF'
    });
  },

  /**
   * Get system reports
   */
  async getSystemReports(params?: {
    page?: number;
    size?: number;
    type?: string;
    status?: string;
  }): Promise<{
    content: SystemReport[];
    totalElements: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    return apiClient.get(`/api/admin/reports?${queryParams.toString()}`);
  },

  /**
   * Download system report
   */
  async downloadSystemReport(reportId: string): Promise<Blob> {
    return apiClient.get(`/api/admin/reports/${reportId}/download`, {
      responseType: 'blob'
    });
  },

  /**
   * Delete system report
   */
  async deleteSystemReport(reportId: string): Promise<void> {
    return apiClient.delete(`/api/admin/reports/${reportId}`);
  },

  /**
   * Get user session information
   */
  async getUserSessions(userId?: string): Promise<Array<{
    sessionId: string;
    userId: string;
    userName: string;
    ipAddress: string;
    userAgent: string;
    loginTime: string;
    lastActivity: string;
    isActive: boolean;
    location?: string;
  }>> {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient.get(`/api/admin/sessions${params}`);
  },

  /**
   * Terminate user session
   */
  async terminateUserSession(sessionId: string): Promise<void> {
    return apiClient.delete(`/api/admin/sessions/${sessionId}`);
  },

  /**
   * Terminate all sessions for a user
   */
  async terminateAllUserSessions(userId: string): Promise<void> {
    return apiClient.delete(`/api/admin/sessions/user/${userId}`);
  },

  /**
   * Get system notifications
   */
  async getSystemNotifications(params?: {
    page?: number;
    size?: number;
    type?: string;
    severity?: string;
    acknowledged?: boolean;
  }): Promise<{
    content: Array<{
      id: string;
      type: 'SYSTEM' | 'SECURITY' | 'PERFORMANCE' | 'ERROR';
      severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
      title: string;
      message: string;
      timestamp: string;
      acknowledged: boolean;
      acknowledgedBy?: string;
      acknowledgedAt?: string;
    }>;
    totalElements: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.acknowledged !== undefined) queryParams.append('acknowledged', params.acknowledged.toString());

    return apiClient.get(`/api/admin/notifications?${queryParams.toString()}`);
  },

  /**
   * Acknowledge system notification
   */
  async acknowledgeNotification(notificationId: string): Promise<void> {
    return apiClient.put(`/api/admin/notifications/${notificationId}/acknowledge`);
  },

  /**
   * Send system notification
   */
  async sendSystemNotification(notification: {
    type: 'SYSTEM' | 'SECURITY' | 'PERFORMANCE' | 'ERROR';
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    title: string;
    message: string;
    targetUsers?: string[];
    targetRoles?: string[];
  }): Promise<void> {
    return apiClient.post('/api/admin/notifications/send', notification);
  },

  /**
   * Get database backup status
   */
  async getDatabaseBackupStatus(): Promise<{
    lastBackup: string;
    nextScheduledBackup: string;
    backupSize: number;
    backupLocation: string;
    backupStatus: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
    backupHistory: Array<{
      timestamp: string;
      size: number;
      status: string;
      duration: number;
    }>;
  }> {
    return apiClient.get('/api/admin/database/backup-status');
  },

  /**
   * Create database backup
   */
  async createDatabaseBackup(): Promise<{
    backupId: string;
    estimatedDuration: number;
  }> {
    return apiClient.post('/api/admin/database/backup');
  },

  /**
   * Restore database from backup
   */
  async restoreDatabaseBackup(backupId: string): Promise<{
    restoreId: string;
    estimatedDuration: number;
  }> {
    return apiClient.post('/api/admin/database/restore', { backupId });
  },

  /**
   * Get system maintenance status
   */
  async getMaintenanceStatus(): Promise<{
    isMaintenanceMode: boolean;
    maintenanceMessage?: string;
    scheduledMaintenance?: {
      startTime: string;
      endTime: string;
      description: string;
    };
    estimatedDowntime?: number;
  }> {
    return apiClient.get('/api/admin/maintenance/status');
  },

  /**
   * Enable maintenance mode
   */
  async enableMaintenanceMode(message: string, scheduledMaintenance?: {
    startTime: string;
    endTime: string;
    description: string;
  }): Promise<void> {
    return apiClient.post('/api/admin/maintenance/enable', {
      message,
      scheduledMaintenance
    });
  },

  /**
   * Disable maintenance mode
   */
  async disableMaintenanceMode(): Promise<void> {
    return apiClient.post('/api/admin/maintenance/disable');
  }
};
