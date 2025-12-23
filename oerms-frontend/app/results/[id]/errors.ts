export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
  
  static fromResponse(response: Response, data?: any): ApiError {
    const message = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
    return new ApiError(message, response.status, data?.code, data?.details);
  }
  
  static fromNetworkError(error: Error): ApiError {
    return new ApiError('Network request failed', 0, 'NETWORK_ERROR', { originalError: error.message });
  }
  
  isNetworkError(): boolean {
    return this.status === 0 || this.code === 'NETWORK_ERROR';
  }
  
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
  
  isValidationError(): boolean {
    return this.status === 400 && !!this.details?.fields;
  }
  
  getFieldErrors(): Record<string, string> | null {
    if (!this.isValidationError()) return null;
    return this.details?.fields || null;
  }
  
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Cannot connect to server. Please check your internet connection.';
    }
    if (this.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (this.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (this.status === 404) {
      return 'The requested resource was not found.';
    }
    if (this.isValidationError()) {
      const fields = this.getFieldErrors();
      if (fields) {
        const firstError = Object.values(fields)[0];
        return firstError || 'Please check your input and try again.';
      }
    }
    if (this.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return this.message || 'An unexpected error occurred.';
  }
}