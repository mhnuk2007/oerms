// lib/hooks/use-bulk-operations.ts - Bulk operations for teachers and admins

import { useState, useCallback } from 'react';
import { questionService } from '@/lib/api/question';
import { examService } from '@/lib/api/exam';
import { authService } from '@/lib/api/auth';
import { CreateQuestionRequest, QuestionDTO } from '@/lib/types';

interface BulkQuestionImportResult {
  successful: Array<QuestionDTO | CreateQuestionRequest>;
  failed: Array<{ data: any; error: string }>;
  total: number;
  successCount: number;
  failureCount: number;
}

interface BulkUserOperationResult {
  successful: any[];
  failed: Array<{ userId: string; error: string }>;
  total: number;
  successCount: number;
  failureCount: number;
}

export function useBulkQuestionImport(examId: string) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BulkQuestionImportResult | null>(null);

  const importQuestions = useCallback(async (
    questions: CreateQuestionRequest[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<BulkQuestionImportResult> => {
    setIsImporting(true);
    setProgress(0);
    setResult(null);

    const successful: Array<QuestionDTO | CreateQuestionRequest> = [];
    const failed: Array<{ data: any; error: string }> = [];
    const total = questions.length;

    try {
      // Process in batches to avoid overwhelming the server
      const batchSize = 10;

      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);

        // Process batch concurrently
        const batchPromises = batch.map(async (questionData, index) => {
          try {
            const question = await questionService.createQuestion({
              ...questionData,
              examId
            });
            return { success: true, data: question, index: i + index };
          } catch (error) {
            return {
              success: false,
              data: questionData,
              error: error instanceof Error ? error.message : 'Unknown error',
              index: i + index
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);

        // Process results
        batchResults.forEach(result => {
          if (result.success && result.data) {
            successful.push(result.data);
          } else if (!result.success) {
            failed.push({ data: result.data, error: result.error || 'Unknown error' });
          }
        });

        // Update progress
        const completed = Math.min(i + batchSize, total);
        setProgress((completed / total) * 100);
        onProgress?.(completed, total);
      }

      const finalResult: BulkQuestionImportResult = {
        successful,
        failed,
        total,
        successCount: successful.length,
        failureCount: failed.length
      };

      setResult(finalResult);
      return finalResult;

    } catch (error) {
      console.error('Bulk import failed:', error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, [examId]);

  const clearResult = useCallback(() => {
    setResult(null);
    setProgress(0);
  }, []);

  return {
    importQuestions,
    isImporting,
    progress,
    result,
    clearResult
  };
}

export function useBulkUserOperations() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BulkUserOperationResult | null>(null);

  const bulkAssignRoles = useCallback(async (
    userIds: string[],
    role: 'STUDENT' | 'TEACHER' | 'ADMIN',
    onProgress?: (completed: number, total: number) => void
  ): Promise<BulkUserOperationResult> => {
    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    const successful: any[] = [];
    const failed: Array<{ userId: string; error: string }> = [];
    const total = userIds.length;

    try {
      // Process in batches
      const batchSize = 5;

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);

        const batchPromises = batch.map(async (userId, index) => {
          try {
            const result = await authService.assignRole(userId, role);
            return { success: true, data: result, userId, index: i + index };
          } catch (error) {
            return {
              success: false,
              userId,
              error: error instanceof Error ? error.message : 'Unknown error',
              index: i + index
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
          if (result.success) {
            successful.push(result.data);
          } else {
            failed.push({ userId: result.userId, error: result.error || 'Unknown error' });
          }
        });

        const completed = Math.min(i + batchSize, total);
        setProgress((completed / total) * 100);
        onProgress?.(completed, total);
      }

      const finalResult: BulkUserOperationResult = {
        successful,
        failed,
        total,
        successCount: successful.length,
        failureCount: failed.length
      };

      setResult(finalResult);
      return finalResult;

    } catch (error) {
      console.error('Bulk role assignment failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const bulkUpdateUserStatus = useCallback(async (
    userIds: string[],
    action: 'enable' | 'disable' | 'lock' | 'unlock',
    onProgress?: (completed: number, total: number) => void
  ): Promise<BulkUserOperationResult> => {
    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    const successful: any[] = [];
    const failed: Array<{ userId: string; error: string }> = [];
    const total = userIds.length;

    try {
      const batchSize = 5;

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);

        const batchPromises = batch.map(async (userId, index) => {
          try {
            let result;
            switch (action) {
              case 'enable':
                result = await authService.enableUser(userId);
                break;
              case 'disable':
                result = await authService.disableUser(userId);
                break;
              case 'lock':
                result = await authService.lockUser(userId);
                break;
              case 'unlock':
                result = await authService.unlockUser(userId);
                break;
            }
            return { success: true, data: result, userId, index: i + index };
          } catch (error) {
            return {
              success: false,
              userId,
              error: error instanceof Error ? error.message : 'Unknown error',
              index: i + index
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
          if (result.success) {
            successful.push(result.data);
          } else {
            failed.push({ userId: result.userId, error: result.error || 'Unknown error' });
          }
        });

        const completed = Math.min(i + batchSize, total);
        setProgress((completed / total) * 100);
        onProgress?.(completed, total);
      }

      const finalResult: BulkUserOperationResult = {
        successful,
        failed,
        total,
        successCount: successful.length,
        failureCount: failed.length
      };

      setResult(finalResult);
      return finalResult;

    } catch (error) {
      console.error('Bulk status update failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setProgress(0);
  }, []);

  return {
    bulkAssignRoles,
    bulkUpdateUserStatus,
    isProcessing,
    progress,
    result,
    clearResult
  };
}

export function useBulkExamOperations() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const bulkPublishExams = useCallback(async (
    examIds: string[],
    onProgress?: (completed: number, total: number) => void
  ) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const successful: any[] = [];
      const failed: any[] = [];
      const total = examIds.length;

      const batchSize = 3; // Smaller batch for exam publishing

      for (let i = 0; i < examIds.length; i += batchSize) {
        const batch = examIds.slice(i, i + batchSize);

        const batchPromises = batch.map(async (examId) => {
          try {
            const result = await examService.publishExam(examId);
            return { success: true, data: result, examId };
          } catch (error) {
            return {
              success: false,
              examId,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
          if (result.success) {
            successful.push(result.data);
          } else {
            failed.push({ examId: result.examId, error: result.error });
          }
        });

        const completed = Math.min(i + batchSize, total);
        setProgress((completed / total) * 100);
        onProgress?.(completed, total);
      }

      setResult({
        operation: 'publish',
        successful,
        failed,
        total,
        successCount: successful.length,
        failureCount: failed.length
      });

      return {
        successful,
        failed,
        total,
        successCount: successful.length,
        failureCount: failed.length
      };

    } catch (error) {
      console.error('Bulk publish failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setProgress(0);
  }, []);

  return {
    bulkPublishExams,
    isProcessing,
    progress,
    result,
    clearResult
  };
}
