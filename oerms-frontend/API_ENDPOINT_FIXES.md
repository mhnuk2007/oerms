# API Endpoint Fixes Summary

This document summarizes all the API endpoint issues that were identified and fixed by comparing the frontend code with the backend API documentation.

## Issues Fixed

### 1. Auth Service (`lib/api/auth.ts`)

#### Issue: Incorrect User Management Endpoints
**Problem:** The auth service was using `/api/auth/users/*` endpoints which don't exist in the API documentation.

**Fixed Endpoints:**
- ✅ `getUser()`: Changed from `/api/auth/users/${userId}` → `/api/admin/users/${userId}`
- ✅ `getAllUsers()`: Changed from `/api/auth/users` → `/api/admin/users` (also added missing `sortBy` and `sortDir` parameters)
- ✅ `deleteUser()`: Changed from `/api/auth/users/${userId}` → `/api/admin/users/${userId}`
- ✅ `enableUser()`: Changed from `/api/auth/users/${userId}/enable` → `/api/admin/users/${userId}/enable`
- ✅ `disableUser()`: Changed from `/api/auth/users/${userId}/disable` → `/api/admin/users/${userId}/disable`
- ✅ `lockUser()`: Changed from `/api/auth/users/${userId}/lock` → `/api/admin/users/${userId}/lock`
- ✅ `unlockUser()`: Changed from `/api/auth/users/${userId}/unlock` → `/api/admin/users/${userId}/unlock`

#### Issue: Non-existent Update User Endpoint
**Problem:** `updateUser()` method was calling `/api/auth/users/${userId}` with PUT, but this endpoint doesn't exist in the API documentation.

**Fixed:** Removed the `updateUser()` method entirely as it's not available in the backend API.

### 2. Exam Service (`lib/api/exam.ts`)

#### Issue: Incorrect Return Type for `startExam()`
**Problem:** `startExam()` was returning `ExamDTO`, but according to the API documentation, it should return `ExamStartResponse` which contains both `exam` and `attempt` objects.

**Fixed:**
- ✅ Added `ExamStartResponse` interface to `lib/types.ts`
- ✅ Updated `startExam()` return type from `Promise<ExamDTO>` → `Promise<ExamStartResponse>`
- ✅ Updated import statement to include `ExamStartResponse`

**API Documentation Reference:**
```json
{
  "exam": { ...ExamDTO },
  "attempt": { ...AttemptResponse }
}
```

### 3. Main API Client (`lib/api.ts`)

#### Issue: Incorrect Endpoint for Getting Exam Questions
**Problem:** `getExamQuestions()` was using `/api/exams/${examId}/questions` which doesn't exist in the API documentation.

**Fixed:**
- ✅ Changed from `/api/exams/${examId}/questions` → `/api/questions/exam/${examId}`

**API Documentation Reference:**
- Correct endpoint: `GET /api/questions/exam/{examId}` (Question Service)
- This endpoint retrieves all questions for an exam including answers (for teachers/admins)

## API Documentation Reference

All fixes were verified against the following API documentation files:
- `apidocumentation/auth-server.txt` - Auth & User Management endpoints
- `apidocumentation/user-service.txt` - User Profile endpoints
- `apidocumentation/exam-service.txt` - Exam Management endpoints
- `apidocumentation/question-service.txt` - Question Management endpoints
- `apidocumentation/attempt-service.txt` - Attempt Management endpoints
- `apidocumentation/result-service.txt` - Result Management endpoints

## Backend Service Ports

According to the API documentation:
- Auth Server: `http://localhost:9000` (Direct) or `http://localhost:8080` (Via Gateway)
- User Service: `http://localhost:9001` (Direct) or `http://localhost:8080` (Via Gateway)
- Exam Service: `http://localhost:9002` (Direct) or `http://localhost:8080` (Via Gateway)
- Question Service: `http://localhost:9003` (Direct) or `http://localhost:8080` (Via Gateway)
- Attempt Service: `http://localhost:9004` (Direct) or `http://localhost:8080` (Via Gateway)
- Result Service: `http://localhost:9005` (Direct) or `http://localhost:8080` (Via Gateway)

## Notes

1. **User Management Endpoints:** All user management operations (enable, disable, lock, unlock, delete, get) are under `/api/admin/users/*` and require ADMIN role.

2. **Exam Start Flow:** The API provides two ways to start an exam:
   - `/api/exams/{id}/start` (Exam Service) - Returns `ExamStartResponse` with both exam and attempt
   - `/api/attempts/start` (Attempt Service) - Returns `AttemptResponse` only
   
   The frontend currently uses the attempt service method, but the exam service method is now correctly typed.

3. **Question Endpoints:** Questions are managed through the Question Service (`/api/questions/*`), not through the Exam Service.

## Testing Recommendations

After these fixes, please test:
1. ✅ Admin user management operations (enable, disable, lock, unlock, delete)
2. ✅ Getting user list with pagination and sorting
3. ✅ Starting an exam (if using `examService.startExam()`)
4. ✅ Getting exam questions for teachers/admins
5. ✅ All user profile operations

## Files Modified

1. `lib/api/auth.ts` - Fixed all user management endpoints
2. `lib/api/exam.ts` - Fixed `startExam()` return type
3. `lib/types.ts` - Added `ExamStartResponse` interface
4. `lib/api.ts` - Fixed `getExamQuestions()` endpoint

