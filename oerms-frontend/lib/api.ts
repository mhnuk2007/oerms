import { getAccessToken } from './auth';
import type { PublishResultRequest, GradeResultRequest } from './types';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// Updated API client with Bearer token authentication
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Get access token from localStorage
    const accessToken = await getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_URL,
      ...(options.headers as Record<string, string>),
    };

    // Add Bearer token if available
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const url = `${this.baseURL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Get the response text once, then try to parse it
    let responseText: string;
    try {
      responseText = await response.text();
    } catch (textError) {
      throw {
        message: `Failed to read response body: ${response.status} ${response.statusText}`,
        status: response.status,
        details: { error: 'Could not read response body' },
        url: response.url,
      };
    }

    // Check if response is HTML (server error pages)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      throw {
        message: `Backend server returned HTML instead of JSON. This usually means the API server is not running or not responding correctly. Expected JSON from ${response.url}, but got HTML page.`,
        status: response.status,
        details: { htmlResponse: responseText.substring(0, 200) + '...' },
        url: response.url,
      };
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError: any) {
      const parseError = {
        message: `Failed to parse response as JSON. Response: ${responseText.substring(0, 300)}...`,
        status: response.status,
        details: { textResponse: responseText, jsonError: jsonError?.message || jsonError },
        url: response.url,
        endpoint,
        method: options.method || 'GET',
      };
      // Log both object and stringified for visibility
      console.error('🚨 API Parse Error:', parseError, 'raw:', responseText.substring(0, 300));
      console.error('🚨 API Parse Error (json):', JSON.stringify(parseError, null, 2));
      throw parseError;
    }

    // Check if the response indicates an error (even with 200 status)
    if (!response.ok) {
      const errorMessage = data?.message || data?.error_description || data?.error ||
                          `HTTP ${response.status}: ${response.statusText}`;

      // Create detailed error object
      const errorDetails = {
        message: errorMessage,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        responseData: data,
        responseText,
        timestamp: new Date().toISOString(),
        endpoint: endpoint,
        method: options.method || 'GET',
      };

      // Log detailed error information
      // Log both object and stringified for visibility
      console.error('🚨 API Error Details:', errorDetails, 'raw:', responseText.substring(0, 300));
      console.error('🚨 API Error Details (json):', JSON.stringify(errorDetails, null, 2));

      // Throw the error with all details
      throw errorDetails;
    }

    return data;
  }

  // Additional Exam Service Methods
  async completeExam(examId: string): Promise<any> {
    return this.request(`/api/exams/${examId}/complete`, {
      method: 'POST',
    });
  }

  async cancelExam(examId: string, reason?: string): Promise<any> {
    const queryParams = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return this.request(`/api/exams/${examId}/cancel${queryParams}`, {
      method: 'POST',
    });
  }

  async archiveExam(examId: string): Promise<any> {
    return this.request(`/api/exams/${examId}/archive`, {
      method: 'POST',
    });
  }

  async validateExamForPublish(examId: string): Promise<any> {
    return this.request(`/api/exams/${examId}/validate-publish`);
  }

  async getExamServiceStatistics(examId: string): Promise<any> {
    return this.request(`/api/exams/${examId}/statistics`);
  }

  async getTeacherExams(teacherId: string, params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

    return this.request(`/api/exams/teacher/${teacherId}?${queryParams.toString()}`);
  }

  async getTeacherExamCount(teacherId: string): Promise<any> {
    return this.request(`/api/exams/teacher/${teacherId}/count`);
  }

  async getOngoingExams(): Promise<any> {
    return this.request('/api/exams/ongoing');
  }

  async getActiveExams(): Promise<any> {
    return this.request('/api/exams/active');
  }

  async getAllExams(params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

    return this.request(`/api/admin/exams?${queryParams.toString()}`);
  }

  async getAllUsers(params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

    return this.request(`/api/admin/users?${queryParams.toString()}`);
  }

  // Alternative method to get user profiles for admin dashboard
  async getAllUserProfiles(params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    return this.request(`/api/profiles/all?${queryParams.toString()}`);
  }

  async authServiceHealth(): Promise<any> {
    return this.request('/api/auth/health');
  }

  async getCurrentUser(): Promise<any> {
    return this.request('/api/auth/me');
  }

  async getUserById(userId: string): Promise<any> {
    return this.request(`/api/admin/users/${userId}`);
  }

  async deleteUserById(userId: string): Promise<any> {
    return this.request(`/api/admin/users/${userId}`, { method: 'DELETE' });
  }

  async searchUsers(query: string, params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    return this.request(`/api/admin/users/search?${queryParams.toString()}`);
  }

  async attemptServiceHealth(): Promise<any> {
    return this.request('/api/attempts/health');
  }

  async deleteExam(id: string): Promise<any> {
    return this.request(`/api/exams/${id}`, { method: 'DELETE' });
  }

  // Note: Delete user endpoint not available in new profiles API
  // async deleteUser(id: string): Promise<any> {
  //   return this.request(`/api/profiles/${id}`, { method: 'DELETE' });
  // }

  async getAttempt(id: string): Promise<any> {
    return this.request(`/api/attempts/${id}`);
  }

  async getExamQuestionsForStudent(examId: string): Promise<any> {
    return this.request(`/api/questions/exam/${examId}/student`);
  }

  async getAttemptAnswers(attemptId: string): Promise<any> {
    return this.request(`/api/attempts/${attemptId}/answers`);
  }

  async getExam(id: string): Promise<any> {
    return this.request(`/api/exams/${id}`);
  }

  async getPublishedExamCount(): Promise<any> {
    return this.request('/api/exams/published/count');
  }

  async getMyAttempts(params?: { size?: number }): Promise<any> {
    const queryParams = params?.size ? `?size=${params.size}` : '';
    return this.request(`/api/attempts/my-attempts${queryParams}`);
  }

  async getMyAttemptsCount(): Promise<any> {
    return this.request('/api/attempts/my-attempts/count');
  }

  async getMyExamAttempts(examId: string, params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    return this.request(`/api/attempts/my-attempts/exam/${examId}?${queryParams.toString()}`);
  }

  async getPublishedExams(params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    return this.request(`/api/exams/published?${queryParams.toString()}`);
  }

  async getMyExamCount(): Promise<any> {
    return this.request('/api/exams/my-exams/count');
  }

  async getMyExams(params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    return this.request(`/api/exams/my-exams?${queryParams.toString()}`);
  }

  async getExamQuestionCount(examId: string): Promise<any> {
    return this.request(`/api/exams/${examId}/questions/count`);
  }

  async getExamAttempts(examId: string, params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    return this.request(`/api/attempts/exam/${examId}?${queryParams.toString()}`);
  }

  // Additional methods needed by the application
  async saveAnswer(attemptId: string, payload: any): Promise<any> {
    return this.request(`/api/attempts/${attemptId}/answers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async submitAttempt(payload: { attemptId: string; notes?: string }): Promise<any> {
    return this.request('/api/attempts/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAllAttempts(params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    return this.request(`/api/attempts/all?${queryParams.toString()}`);
  }

  // Proctoring violation methods
  async recordWebcamViolation(attemptId: string): Promise<any> {
    return this.request(`/api/attempts/${attemptId}/webcam-violation`, { method: 'POST' });
  }

  async recordCustomViolation(attemptId: string, violationType: string): Promise<any> {
    return this.request(`/api/attempts/${attemptId}/violations/custom?violationType=${encodeURIComponent(violationType)}`, { method: 'POST' });
  }

  async recordTabSwitch(attemptId: string): Promise<any> {
    return this.request(`/api/attempts/${attemptId}/tab-switch`, { method: 'POST' });
  }

  // Additional attempt service methods
  async getStudentAttemptsAdmin(studentId: string, params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    return this.request(`/api/attempts/student/${studentId}?${queryParams.toString()}`);
  }

  async getExamAttemptStatistics(examId: string): Promise<any> {
    return this.request(`/api/attempts/exam/${examId}/statistics`);
  }

  async getExamAttemptsCount(examId: string): Promise<any> {
    return this.request(`/api/attempts/exam/${examId}/count`);
  }

  async unpublishExam(examId: string): Promise<any> {
    return this.request(`/api/exams/${examId}/unpublish`, {
      method: 'POST',
    });
  }

  async publishExam(examId: string): Promise<any> {
    return this.request(`/api/exams/${examId}/publish`, {
      method: 'POST',
    });
  }

  async getQuestion(questionId: string): Promise<any> {
    return this.request(`/api/questions/${questionId}`);
  }

  async getExamWithQuestions(examId: string): Promise<any> {
    return this.request(`/api/exams/${examId}/with-questions`);
  }

  async deleteQuestion(questionId: string): Promise<any> {
    return this.request(`/api/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  async startAttempt(examId: string): Promise<any> {
    return this.request('/api/attempts/start', {
      method: 'POST',
      body: JSON.stringify({ examId }),
    });
  }

  async createExam(examData: any): Promise<any> {
    return this.request('/api/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async updateExam(examId: string, examData: any): Promise<any> {
    return this.request(`/api/exams/${examId}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }

  async createQuestion(questionData: any): Promise<any> {
    return this.request('/api/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(questionId: string, questionData: any): Promise<any> {
    return this.request(`/api/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  async register(registerData: any): Promise<any> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  }

  async getExamQuestions(examId: string): Promise<any> {
    return this.request(`/api/questions/exam/${examId}`);
  }

  // Question service methods
  async reorderQuestions(examId: string, questionIds: string[]): Promise<any> {
    return this.request(`/api/questions/exam/${examId}/reorder`, {
      method: 'PUT',
      body: JSON.stringify(questionIds),
    });
  }

  async getQuestionsForGrading(questionIds: string[]): Promise<any> {
    return this.request('/api/questions/internal/batch', {
      method: 'POST',
      body: JSON.stringify(questionIds),
    });
  }

  async bulkCreateQuestions(questions: any[]): Promise<any> {
    return this.request('/api/questions/bulk', {
      method: 'POST',
      body: JSON.stringify({ questions }),
    });
  }

  async validateExamQuestions(examId: string): Promise<any> {
    return this.request(`/api/questions/exam/${examId}/validate`);
  }

  async getTotalMarks(examId: string): Promise<any> {
    return this.request(`/api/questions/exam/${examId}/total-marks`);
  }

  async getExamQuestionsSummary(examId: string): Promise<any> {
    return this.request(`/api/questions/exam/${examId}/summary`);
  }

  async getQuestionExamStatistics(examId: string): Promise<any> {
    return this.request(`/api/questions/exam/${examId}/statistics`);
  }

  async deleteAllExamQuestions(examId: string): Promise<any> {
    return this.request(`/api/questions/exam/${examId}/all`, { method: 'DELETE' });
  }

  async evaluatePolicy(payload: any): Promise<any> {
    return this.request('/api/policy/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMyProfile(): Promise<any> {
    return this.request('/api/profiles/profile/me');
  }

  async updateMyProfile(profileData: any): Promise<any> {
    return this.request('/api/profiles/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadMyProfilePicture(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/api/profiles/profile/me/picture', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteMyProfilePicture(): Promise<any> {
    return this.request('/api/profiles/profile/me/picture', {
      method: 'DELETE',
    });
  }

  async updateMyInstitution(institution: string): Promise<any> {
    return this.request('/api/profiles/profile/me/institution', {
      method: 'PUT',
      body: JSON.stringify({ institution }),
    });
  }



  // User Profile Methods
  async deactivateProfile(userId: string): Promise<any> {
    return this.request(`/api/profiles/${userId}/deactivate`, {
      method: 'PUT',
    });
  }

  async activateProfile(userId: string): Promise<any> {
    return this.request(`/api/profiles/${userId}/activate`, {
      method: 'PUT',
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    return this.request(`/api/profiles/profile/${userId}`);
  }

  async getUserStats(): Promise<any> {
    return this.request('/api/profiles/stats');
  }

  async getAllProfiles(params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    return this.request(`/api/profiles/all?${queryParams.toString()}`);
  }

  // Additional admin methods
  async lockUser(userId: string): Promise<any> {
    return this.request(`/api/admin/users/${userId}/lock`, {
      method: 'PUT',
    });
  }

  async unlockUser(userId: string): Promise<any> {
    return this.request(`/api/admin/users/${userId}/unlock`, {
      method: 'PUT',
    });
  }

  async enableUser(userId: string): Promise<any> {
    return this.request(`/api/admin/users/${userId}/enable`, {
      method: 'PUT',
    });
  }

  async disableUser(userId: string): Promise<any> {
    return this.request(`/api/admin/users/${userId}/disable`, {
      method: 'PUT',
    });
  }

  async assignRole(userId: string, role: string): Promise<any> {
    return this.request(`/api/auth/roles/${userId}/assign/${role}`, {
      method: 'POST',
    });
  }

  async removeRole(userId: string, role: string): Promise<any> {
    return this.request(`/api/auth/roles/${userId}/remove/${role}`, {
      method: 'DELETE',
    });
  }

  async searchProfiles(keyword: string, params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('keyword', keyword);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    return this.request(`/api/profiles/all/search?${queryParams.toString()}`);
  }

  async getProfilesByInstitution(institution: string, params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    return this.request(`/api/profiles/all/institution/${encodeURIComponent(institution)}?${queryParams.toString()}`);
  }

  async getProfilesByCity(city: string, params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    return this.request(`/api/profiles/all/city/${encodeURIComponent(city)}?${queryParams.toString()}`);
  }

  // ==================== Result Service Methods ====================

  async getResult(id: string): Promise<any> {
    return this.request(`/api/results/${id}`);
  }

  async deleteResult(id: string): Promise<any> {
    return this.request(`/api/results/${id}`, { method: 'DELETE' });
  }

  // Removed - use publishResultAdmin instead

  async unpublishResult(id: string): Promise<any> {
    return this.request(`/api/results/${id}/unpublish`, { method: 'POST' });
  }

  // Removed - use gradeResultAdmin instead

  async calculateRankings(examId: string): Promise<any> {
    return this.request(`/api/results/exam/${examId}/calculate-rankings`, { method: 'POST' });
  }

  async getMyResults(params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    return this.request(`/api/results/my-results?${queryParams.toString()}`);
  }

  async getMyExamResults(examId: string, params?: { page?: number; size?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    return this.request(`/api/results/my-results/exam/${examId}?${queryParams.toString()}`);
  }

  async getMyStatistics(): Promise<any> {
    return this.request('/api/results/my-statistics');
  }

  async getExamResults(examId: string, params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    return this.request(`/api/results/exam/${examId}?${queryParams.toString()}`);
  }

  async getExamStatistics(examId: string): Promise<any> {
    return this.request(`/api/results/exam/${examId}/statistics`);
  }

  async getTopScorers(examId: string, limit = 10): Promise<any> {
    return this.request(`/api/results/exam/${examId}/top-scorers?limit=${limit}`);
  }

  async getSuspiciousResults(): Promise<any> {
    return this.request('/api/results/suspicious');
  }

  async getSuspiciousResultsByExam(examId: string): Promise<any> {
    return this.request(`/api/results/exam/${examId}/suspicious`);
  }

  async getStudentStatistics(studentId: string): Promise<any> {
    return this.request(`/api/results/student/${studentId}/statistics`);
  }

  async getPendingGradingResults(): Promise<any> {
    return this.request('/api/results/pending-grading');
  }

  async getPendingGradingByExam(examId: string): Promise<any> {
    return this.request(`/api/results/exam/${examId}/pending-grading`);
  }

  async getSuspiciousResultsByExam(examId: string): Promise<any> {
    return this.request(`/api/results/exam/${examId}/suspicious`);
  }

  async getStudentStatistics(studentId: string): Promise<any> {
    return this.request(`/api/results/student/${studentId}/statistics`);
  }

  // ==================== Teacher/Admin Operations ====================

  async publishResultAdmin(resultId: string, request: PublishResultRequest): Promise<any> {
    return this.request(`/api/results/${resultId}/publish`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async unpublishResultAdmin(resultId: string): Promise<any> {
    return this.request(`/api/results/${resultId}/unpublish`, { method: 'POST' });
  }

  async gradeResultAdmin(resultId: string, request: GradeResultRequest): Promise<any> {
    return this.request(`/api/results/${resultId}/grade`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getExamResultsAdmin(examId: string, params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    return this.request(`/api/results/exam/${examId}?${queryParams.toString()}`);
  }

  async getExamStatisticsAdmin(examId: string): Promise<any> {
    return this.request(`/api/results/exam/${examId}/statistics`);
  }

  async getTopScorersAdmin(examId: string, limit = 10): Promise<any> {
    return this.request(`/api/results/exam/${examId}/top-scorers?limit=${limit}`);
  }

  async calculateRankingsAdmin(examId: string): Promise<any> {
    return this.request(`/api/results/exam/${examId}/calculate-rankings`, { method: 'POST' });
  }

  // ==================== Admin Only Operations ====================

  async deleteResultAdmin(resultId: string): Promise<any> {
    return this.request(`/api/results/${resultId}`, { method: 'DELETE' });
  }

  async resultServiceHealth(): Promise<any> {
    return this.request('/api/results/health');
  }

  async getAllResults(params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

    return this.request(`/api/admin/results?${queryParams.toString()}`);
  }
}

// Use relative URLs to go through Next.js proxy
const API_URL = '';
export const apiClient = new APIClient(API_URL);
