# 🚀 OERMS Frontend — Complete Refactoring & Enhancement Guide

**Version:** 1.0.0  
**Date:** December 2024  
**Framework:** Next.js 16 (App Router)  
**Backend Services:** Auth, User, Exam, Question, Attempt

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Authentication Implementation](#authentication-implementation)
5. [User Profile Management](#user-profile-management)
6. [Exam Management Module](#exam-management-module)
7. [Question Management Module](#question-management-module)
8. [Attempt Management Module](#attempt-management-module)
9. [Base API Client](#base-api-client)
10. [Dashboard Implementations](#dashboard-implementations)
11. [Implementation Priorities](#implementation-priorities)
12. [Quick Start Guide](#quick-start-guide)

---

## 📋 Executive Summary

This document provides a complete implementation guide for refactoring the OERMS (Online Exam & Result Management System) Next.js frontend. The guide is based on OpenAPI specifications for Auth, User, Exam, Question, and Attempt services.

### Key Objectives
- ✅ Implement type-safe API integration
- ✅ Build OAuth2 PKCE authentication flow
- ✅ Create role-based access control
- ✅ Develop full exam-taking experience
- ✅ Implement auto-save and proctoring
- ✅ Build responsive dashboards for all roles

---

## 🎯 Architecture Overview

### Backend Services Available

| Service | Port | Purpose |
|---------|------|---------|
| **Auth Service** | 9000 | OAuth2, User Management, Roles |
| **User Service** | 9001 | Profile Management, File Upload |
| **Exam Service** | 9002 | Exam CRUD, Publishing, Statistics |
| **Question Service** | 9003 | Question Management, Bulk Operations |
| **Attempt Service** | 9004 | Exam Taking, Proctoring, Submissions |

### API Gateway
- **Gateway URL:** `http://localhost:8080`
- **Authentication:** Bearer JWT tokens
- **Response Format:** Standardized `ApiResponse<T>` wrapper

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}
```

---

## 📁 Project Structure

```
oerms-frontend/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Route group for auth pages
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── register/
│   │   │   └── page.tsx          # Registration page
│   │   └── layout.tsx            # Auth layout
│   │
│   ├── (dashboard)/               # Protected routes group
│   │   ├── layout.tsx            # Dashboard layout (sidebar + topbar)
│   │   │
│   │   ├── admin/                # Admin-only routes
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   ├── users/
│   │   │   │   ├── page.tsx      # User management list
│   │   │   │   └── [id]/page.tsx # User details
│   │   │   └── roles/page.tsx    # Role management
│   │   │
│   │   ├── teacher/               # Teacher routes
│   │   │   ├── page.tsx          # Teacher dashboard
│   │   │   ├── exams/
│   │   │   │   ├── page.tsx      # My exams list
│   │   │   │   ├── create/page.tsx # Create exam wizard
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # Exam details
│   │   │   │       ├── edit/page.tsx
│   │   │   │       ├── questions/page.tsx
│   │   │   │       ├── attempts/page.tsx
│   │   │   │       └── statistics/page.tsx
│   │   │   └── questions/
│   │   │       └── bulk-upload/page.tsx
│   │   │
│   │   ├── student/               # Student routes
│   │   │   ├── page.tsx          # Student dashboard
│   │   │   ├── exams/
│   │   │   │   ├── page.tsx      # Available exams
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # Exam details
│   │   │   │       └── take/page.tsx # Take exam
│   │   │   └── attempts/
│   │   │       ├── page.tsx      # My attempts history
│   │   │       └── [attemptId]/page.tsx
│   │   │
│   │   └── profile/
│   │       ├── page.tsx          # View/Edit profile
│   │       └── settings/page.tsx
│   │
│   ├── api/                       # API routes (server-side)
│   │   └── auth/
│   │       ├── callback/route.ts # OAuth callback
│   │       ├── refresh/route.ts  # Token refresh
│   │       └── logout/route.ts
│   │
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── [about, features, contact]/
│
├── components/
│   ├── ui/                        # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── [other shadcn/ui components]
│   │
│   ├── layout/                    # Layout components
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── breadcrumb.tsx
│   │   └── footer.tsx
│   │
│   ├── auth/                      # Auth components
│   ├── profile/                   # Profile components
│   ├── exam/                      # Exam components
│   ├── question/                  # Question components
│   ├── attempt/                   # Attempt components
│   ├── admin/                     # Admin components
│   ├── charts/                    # Chart components
│   └── common/                    # Common components
│
├── lib/
│   ├── api/                       # API services
│   │   ├── client.ts             # Base API client
│   │   ├── auth.ts               # Auth service
│   │   ├── user.ts               # User service
│   │   ├── exam.ts               # Exam service
│   │   ├── question.ts           # Question service
│   │   └── attempt.ts            # Attempt service
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-auto-save.ts
│   │   └── use-toast.ts
│   │
│   ├── stores/                    # State management
│   │   ├── auth-store.ts
│   │   ├── exam-store.ts
│   │   └── attempt-store.ts
│   │
│   ├── types/                     # TypeScript definitions
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── exam.types.ts
│   │   ├── question.types.ts
│   │   └── attempt.types.ts
│   │
│   └── utils/                     # Utilities
│       ├── pkce.ts               # PKCE helper
│       └── constants.ts
│
├── middleware.ts                  # Route protection
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔐 Authentication Implementation

### OAuth2 PKCE Flow

#### 1. TypeScript Types

```typescript
// lib/types/auth.types.ts

export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface UserResponse {
  id: string;
  userName: string;
  email: string;
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  roles: Role[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  version: number;
}

export interface RegisterRequest {
  userName: string; // 2-50 chars
  email: string;
  password: string; // 8-100 chars
  roles?: Role[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface PKCEState {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}
```

#### 2. PKCE Utility Functions

```typescript
// lib/utils/pkce.ts

/**
 * Generate cryptographically secure random string
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map(v => charset[v % charset.length])
    .join('');
}

/**
 * Generate SHA-256 hash and base64url encode
 */
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCE(): Promise<PKCEState> {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await sha256(codeVerifier);
  const state = generateRandomString(32);
  
  return { codeVerifier, codeChallenge, state };
}

/**
 * Build authorization URL
 */
export function buildAuthorizationUrl(pkce: PKCEState): string {
  const params = new URLSearchParams({
    client_id: 'oerms-nextjs-client',
    redirect_uri: `${window.location.origin}/api/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email offline_access read write',
    code_challenge: pkce.codeChallenge,
    code_challenge_method: 'S256',
    state: pkce.state
  });
  
  return `http://localhost:8080/oauth2/authorize?${params.toString()}`;
}
```

#### 3. Auth Service

```typescript
// lib/api/auth.ts

import { apiClient } from './client';
import type { UserResponse, RegisterRequest, TokenResponse } from '@/lib/types/auth.types';

export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<{ user: UserResponse; redirectUrl: string }> {
    return apiClient.post('/api/auth/register', data);
  },

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      redirect_uri: `${window.location.origin}/api/auth/callback`,
      client_id: 'oerms-nextjs-client'
    });

    const response = await fetch('http://localhost:8080/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) throw new Error('Token exchange failed');
    return response.json();
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserResponse> {
    return apiClient.get('/api/auth/me');
  },

  /**
   * Assign role to user (Admin only)
   */
  async assignRole(userId: string, role: string): Promise<UserResponse> {
    return apiClient.post(`/api/auth/roles/${userId}/assign/${role}`);
  },

  /**
   * Remove role from user (Admin only)
   */
  async removeRole(userId: string, role: string): Promise<UserResponse> {
    return apiClient.delete(`/api/auth/roles/${userId}/remove/${role}`);
  }
};
```

#### 4. Auth Store (Zustand)

```typescript
// lib/stores/auth-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '@/lib/types/auth.types';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  
  setUser: (user: UserResponse) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setAccessToken: (token) => set({ accessToken: token }),
      
      logout: () => set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false 
      }),

      hasRole: (role) => {
        const { user } = get();
        return user?.roles.includes(role as any) ?? false;
      }
    }),
    { name: 'auth-storage' }
  )
);
```

#### 5. OAuth Callback Route

```typescript
// app/api/auth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/api/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  try {
    const cookieStore = cookies();
    const codeVerifier = cookieStore.get('pkce_verifier')?.value;
    const savedState = cookieStore.get('pkce_state')?.value;

    if (!codeVerifier || !savedState || state !== savedState) {
      throw new Error('PKCE state invalid');
    }

    // Exchange code for tokens
    const tokens = await authService.exchangeCodeForToken(code, codeVerifier);

    // Store tokens in httpOnly cookies
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    response.cookies.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in
    });

    response.cookies.set('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    // Clear PKCE cookies
    response.cookies.delete('pkce_verifier');
    response.cookies.delete('pkce_state');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
```

#### 6. Route Protection Middleware

```typescript
// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;

  // Public routes
  const publicPaths = ['/', '/login', '/register', '/about', '/features', '/contact'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!accessToken && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

---

## 👤 User Profile Management

### TypeScript Types

```typescript
// lib/types/user.types.ts

export interface UserProfileDTO {
  userId: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  institution?: string;
  profilePictureUrl?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  institution?: string;
}

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}
```

### User Service

```typescript
// lib/api/user.ts

import { apiClient } from './client';
import type { UserProfileDTO, UpdateProfileRequest, FileUploadResponse } from '@/lib/types/user.types';

export const userService = {
  async getMyProfile(): Promise<UserProfileDTO> {
    return apiClient.get('/api/users/profile/me');
  },

  async updateMyProfile(data: UpdateProfileRequest): Promise<UserProfileDTO> {
    return apiClient.put('/api/users/profile/me', data);
  },

  async uploadProfilePicture(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8080/api/users/profile/me/picture', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiClient.getToken()}` },
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');
    const result = await response.json();
    return result.data;
  },

  async deleteProfilePicture(): Promise<void> {
    await apiClient.delete('/api/users/profile/me/picture');
  },

  async updateInstitution(institution: string): Promise<void> {
    await apiClient.put('/api/users/profile/me/institution', { institution });
  }
};
```

---

## 📝 Exam Management Module

### TypeScript Types

```typescript
// lib/types/exam.types.ts

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED'
}

export interface ExamDTO {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  teacherName?: string;
  duration: number; // minutes
  totalMarks: number;
  passingMarks: number;
  startTime?: string;
  endTime?: string;
  status: ExamStatus;
  isActive: boolean;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamRequest {
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startTime?: string;
  endTime?: string;
  allowMultipleAttempts?: boolean;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  instructions?: string;
}
```

### Exam Service

```typescript
// lib/api/exam.ts

import { apiClient } from './client';
import type { ExamDTO, CreateExamRequest } from '@/lib/types/exam.types';

export const examService = {
  async createExam(data: CreateExamRequest): Promise<ExamDTO> {
    return apiClient.post('/api/exams', data);
  },

  async getExam(id: string): Promise<ExamDTO> {
    return apiClient.get(`/api/exams/${id}`);
  },

  async updateExam(id: string, data: Partial<CreateExamRequest>): Promise<ExamDTO> {
    return apiClient.put(`/api/exams/${id}`, data);
  },

  async deleteExam(id: string): Promise<void> {
    await apiClient.delete(`/api/exams/${id}`);
  },

  async publishExam(id: string): Promise<ExamDTO> {
    return apiClient.post(`/api/exams/${id}/publish`);
  },

  async unpublishExam(id: string): Promise<ExamDTO> {
    return apiClient.post(`/api/exams/${id}/unpublish`);
  },

  async archiveExam(id: string): Promise<ExamDTO> {
    return apiClient.post(`/api/exams/${id}/archive`);
  },

  async getMyExams(page = 0, size = 10): Promise<any> {
    return apiClient.get(`/api/exams/my-exams?page=${page}&size=${size}`);
  },

  async getPublishedExams(page = 0, size = 10): Promise<any> {
    return apiClient.get(`/api/exams/published?page=${page}&size=${size}`);
  }
};
```

---

## ❓ Question Management Module

### TypeScript Types

```typescript
// lib/types/question.types.ts

export enum QuestionType {
  MCQ = 'MCQ',
  MULTIPLE_ANSWER = 'MULTIPLE_ANSWER',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  FILL_BLANK = 'FILL_BLANK',
  MATCHING = 'MATCHING'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface QuestionDTO {
  id: string;
  examId: string;
  questionText: string;
  type: QuestionType;
  marks: number;
  orderIndex: number;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficultyLevel?: DifficultyLevel;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  examId: string;
  questionText: string;
  type: QuestionType;
  marks: number;
  orderIndex?: number;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficultyLevel?: DifficultyLevel;
  imageUrl?: string;
}
```

### Question Service

```typescript
// lib/api/question.ts

import { apiClient } from './client';
import type { QuestionDTO, CreateQuestionRequest } from '@/lib/types/question.types';

export const questionService = {
  async createQuestion(data: CreateQuestionRequest): Promise<QuestionDTO> {
    return apiClient.post('/api/questions', data);
  },

  async getExamQuestions(examId: string): Promise<QuestionDTO[]> {
    return apiClient.get(`/api/questions/exam/${examId}`);
  },

  async getExamQuestionsForStudent(examId: string, shuffle = false): Promise<any[]> {
    return apiClient.get(`/api/questions/exam/${examId}/student?shuffle=${shuffle}`);
  },

  async updateQuestion(id: string, data: Partial<CreateQuestionRequest>): Promise<QuestionDTO> {
    return apiClient.put(`/api/questions/${id}`, data);
  },

  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/api/questions/${id}`);
  },

  async bulkCreateQuestions(questions: CreateQuestionRequest[]): Promise<QuestionDTO[]> {
    return apiClient.post('/api/questions/bulk', { questions });
  },

  async reorderQuestions(examId: string, questionIds: string[]): Promise<QuestionDTO[]> {
    return apiClient.put(`/api/questions/exam/${examId}/reorder`, questionIds);
  }
};
```

---

## 📝 Attempt Management Module

### TypeScript Types

```typescript
// lib/types/attempt.types.ts

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  AUTO_SUBMITTED = 'AUTO_SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
  GRADED = 'GRADED',
  ABANDONED = 'ABANDONED'
}

export interface AttemptResponse {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName?: string;
  attemptNumber: number;
  status: AttemptStatus;
  totalQuestions: number;
  answeredQuestions: number;
  flaggedQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  startedAt: string;
  submittedAt?: string;
  timeTakenSeconds: number;
  remainingTimeSeconds: number;
  tabSwitches: number;
  webcamViolations: number;
  autoSubmitted: boolean;
  reviewed: boolean;
  passed: boolean;
  notes?: string;
  answers: AttemptAnswerResponse[];
  createdAt: string;
}

export interface SaveAnswerRequest {
  questionId: string;
  selectedOptions?: string[];
  answerText?: string;
  flagged?: boolean;
  timeSpentSeconds?: number;
}

export interface SubmitAttemptRequest {
  attemptId: string;
  notes?: string;
}
```

### Attempt Service

```typescript
// lib/api/attempt.ts

import { apiClient } from './client';
import type { AttemptResponse, SaveAnswerRequest, SubmitAttemptRequest } from '@/lib/types/attempt.types';

export const attemptService = {
  async startAttempt(examId: string): Promise<AttemptResponse> {
    return apiClient.post('/api/attempts/start', { examId });
  },

  async getAttempt(attemptId: string): Promise<AttemptResponse> {
    return apiClient.get(`/api/attempts/${attemptId}`);
  },

  async saveAnswer(attemptId: string, answer: SaveAnswerRequest): Promise<any> {
    return apiClient.post(`/api/attempts/${attemptId}/answers`, answer);
  },

  async submitAttempt(data: SubmitAttemptRequest): Promise<AttemptResponse> {
    return apiClient.post('/api/attempts/submit', data);
  },

  async recordTabSwitch(attemptId: string): Promise<void> {
    await apiClient.post(`/api/attempts/${attemptId}/tab-switch`);
  },

  async recordWebcamViolation(attemptId: string): Promise<void> {
    await apiClient.post(`/api/attempts/${attemptId}/webcam-violation`);
  },

  async getMyAttempts(page = 0, size = 20): Promise<any> {
    return apiClient.get(`/api/attempts/my-attempts?page=${page}&size=${size}`);
  },

  async getExamAttempts(examId: string, page = 0, size = 20): Promise<any> {
    return apiClient.get(`/api/attempts/exam/${examId}?page=${page}&size=${size}`);
  }
};
```

---

## 🔧 Base API Client

```typescript
// lib/api/client.ts

import { useAuthStore } from '@/lib/stores/auth-store';

const BASE_URL = 'http://localhost:8080';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getToken(): string | null {
    return useAuthStore.getState().accessToken;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  async get<T>(path: string): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, data?: