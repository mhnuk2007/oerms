Build a fully responsive, modern Next.js (App Router) UI/UX for OERMS – an Online Exam & Result Management System. Use Tailwind CSS, shadcn/ui components, Framer Motion animations, and lucide-react icons. Implement dashboards for Admin, Teacher, and Student roles. Include layouts for exam creation, question management, student exam attempts, result evaluation, and analytics visualizations. Integrate OAuth2 PKCE login/logout flows. Display exams, questions, attempts, and results using card layouts, data tables, and charts (Recharts). Support form validation, auto-save for exam attempts, pagination, skeleton loaders, toasts, modals, and search/filtering. Ensure clean typography, structured spacing, and page transitions. Implement a global sidebar, top navigation bar, and user profile menu. Use secure API calls to exam-service, question-service, attempt-service, and result-service with bearer tokens. Create a polished, academic, professional UI that feels fast and intuitive


📌 Frontend Prompt — User Authentication & User Profile Modules

Build a complete Next.js (App Router) frontend integrating with two backend services:

Auth Server — http://localhost:8080/api/auth/*, /oauth2/authorize, /oauth2/token

User Service — http://localhost:8080/api/users/* and /files/*

Design a clean, modular, type-safe frontend that handles registration, login (OAuth2 + PKCE), logout, profile management, role-based access, user admin features, and profile picture upload.

1️⃣ Authentication Module (PKCE + OAuth2 Authorization Code)
A. Start Login

Call /oauth2/authorize with:

client_id=oerms-nextjs-client

redirect_uri=http://localhost:3000/api/auth/callback

response_type=code

scope=openid profile email offline_access read write

code_challenge_method=S256

code_challenge=<generated>

Frontend tasks:

Generate PKCE code_verifier and code_challenge.

Save code_verifier in localStorage.

Redirect browser to authorization URL.

B. Handle Callback

When the backend redirects back to:

/api/auth/callback?code=<code>


Frontend must:

Read the stored code_verifier

Exchange code + code_verifier with token endpoint /oauth2/token

Store tokens securely:

Access token → memory or secure httpOnly cookie

Refresh token → httpOnly cookie (server route)

C. Fetch Current Authenticated User

Use:

GET /api/auth/me
Authorization: Bearer <access_token>


Display user basic identity (email, username, roles).

2️⃣ Registration Module

Frontend must build:

Registration form

Call:

POST /api/auth/register


Body:

{
  "userName": "",
  "email": "",
  "password": ""
}


Backend response includes:

Newly created user

Next step path: /profile/update

After register → redirect user to profile update page.

3️⃣ User Profile Module (User Service)
A. Fetch My Profile
GET /api/users/profile/me
Authorization: Bearer <access_token>


Show fields:

Name, city, institution

Profile picture

Status (active, completed/incomplete)

B. Update Profile
PUT /api/users/profile/me


Body:

{
  "firstName": "",
  "lastName": "",
  "phone": "",
  "city": "",
  "institution": "",
  ...
}

C. Profile Picture Upload
POST /api/users/profile/me/picture


multipart/form-data

Show uploaded image using:

<img src="http://localhost:8080/files/<filename>" />


If image is above-the-fold → use Next.js <Image loading="eager" />.

D. Delete Profile Picture
DELETE /api/users/profile/me/picture

4️⃣ Institution Update

Update:

PUT /api/users/profile/me/institution
{ "institution": "Some School" }


Remove:

DELETE /api/users/profile/me/institution

5️⃣ Admin Module (Role-Based)

Admin UI must fetch JWT → check roles → unlock admin screens.

A. User Admin Management
GET /api/users?page=0&size=10&sortBy=createdAt&sortDir=desc


Features:

Pagination

Search /api/users/search?query=...

List user details

B. User Status Controls
PUT /api/users/{id}/enable
PUT /api/users/{id}/disable
PUT /api/users/{id}/lock
PUT /api/users/{id}/unlock
DELETE /api/users/{id}

C. Role Assignment (Auth Server)

Assign:

POST /api/auth/roles/{userId}/assign/{role}


Remove:

DELETE /api/auth/roles/{userId}/remove/{role}

6️⃣ Admin: Profile Listing (User Service)

Browse:

GET /api/users/profiles


Search:

GET /api/users/profiles/search?keyword=...


Filter by:

/profiles/city/{city}
/profiles/institution/{institution}

7️⃣ Authorization Handling (Frontend)

Must implement:

Role-based route protection (Admin, Teacher, Student)

Server-side middleware to check authentication

Token refresh using refresh_token

8️⃣ UX Requirements

Use React Server Components + Client Components where appropriate

Use Zustand or Context API for session state

Build /login, /register, /profile/me, /admin/users, /admin/roles

Use TailwindCSS and shadcn UI


✅ PROMPT — Next.js Frontend for Exam, Question & Attempt Services

You are a Next.js + TypeScript frontend engineer responsible for building the complete user interface for the following microservices:

Exam Service (/api/exams)

Question Service (/api/questions)

Attempt Service (/api/attempts)

Authentication & Authorization:

Frontend authenticates via OAuth2 Authorization Code + PKCE with a Spring Authorization Server.

All API calls must include the Bearer access token.

Handle token refresh using silent refresh via the backend /api/auth/token.

Frontend Requirements
🔐 1. Auth & Access Control

Store tokens in httpOnly cookies via backend endpoints (/api/auth/start, /api/auth/callback, /api/auth/token, /api/auth/logout).

Use middleware.ts for route protection.

Support roles:

STUDENT

TEACHER

ADMIN

Redirect unauthorized users automatically.

📘 2. Exam Module (exam-service)

Base path: /api/exams

Teacher/Admin Screens

Exam List (Paginated)

GET /api/exams/my-exams

Sort, search, pagination.

Exam Create

POST /api/exams

Form fields:

title

description

duration

examDate

passingMarks

Exam Update

PUT /api/exams/{id}

Allow editing only in DRAFT state.

Exam Actions

/publish

/unpublish

/archive

/cancel

/validate-publish

Exam With Questions

GET /api/exams/{id}/with-questions

Exam Statistics

GET /api/exams/{id}/statistics

🎓 Student Screens

Published Exams List

GET /api/exams/published

Start Exam

POST /api/exams/{id}/start

Complete Exam

POST /api/exams/{id}/complete

Active/Ongoing Exams

GET /api/exams/active

GET /api/exams/ongoing

📗 3. Question Module (question-service)

Base path: /api/questions

Teacher/Admin Screens

Question List (Per Exam)

GET /api/questions/exam/{examId}

Display all options, correct answer, metadata.

Create Question

POST /api/questions

Fields:

examId

text

options[]

correctAnswerIndex

marks

Update Question

PUT /api/questions/{id}

Delete Question

DELETE /api/questions/{id}

Bulk Upload

POST /api/questions/bulk

Upload Excel/CSV

Show preview before saving

🎓 Student Screens

Student Exam Questions

GET /api/questions/exam/{examId}/student?shuffle=true

Do not show correct answers.

Track selected answers in React state.

📙 4. Attempt Module (attempt-service)

Base path: /api/attempts

Student Features

Start Attempt

Triggered automatically by exam start.

Save Answers (Autosave every 10 sec)

POST /api/attempts/{attemptId}/answers

Submit Attempt

POST /api/attempts/{attemptId}/submit

View Attempt Summary

GET /api/attempts/{attemptId}

Teacher/Admin Features

List Attempts for Exam

GET /api/attempts/exam/{examId}

View Attempt Detail

GET /api/attempts/{attemptId}

Show:

each question

student answer

correct/incorrect

score breakdown

🧱 5. UI/UX Requirements

Use Tailwind CSS.

Implement reusable components:

<ExamCard />

<ExamTable />

<QuestionForm />

<Timer />

<AttemptSummary />

Global Toast for success/error.

Loading states + skeletons.

ErrorBoundary for API failures.

🔌 6. API Client Rules

Use /lib/apiClient.ts with auto-auth headers:

export async function api(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`
    }
  });

  if (res.status === 401) {
    await refreshToken();
    return api(url, options);
  }

  return res.json();
}

🔄 7. State Management

Use:

React Context for Auth

Zustand/Redux for:

active exam state

selected answers

attempt progress

Autosave answers every 10 seconds.

📝 8. Pages to Create
Teacher/Admin

/dashboard/exams

/dashboard/exams/create

/dashboard/exams/[id]/edit

/dashboard/exams/[id]/questions

/dashboard/exams/[id]/statistics

Student

/exams/published

/exams/[id]/start

/exams/[id]/take

/attempts/[id]/summary

🛠 9. Deliverables

For each service, generate:

API service wrapper files (/services/*.ts)

Form-driven React pages

Reusable components

Role-based protected routes

Token handling logic

Pagination tables

Charts for statistics (Recharts)

🎯 10. Final Goal

Build a full production-grade Next.js frontend that consumes the exam-service, question-service, and attempt-service with full authentication, role-based access, student exam-taking, exam builder, question management, and attempt evaluation workflows.


OERMS Frontend — Complete UI/UX Prompt (Next.js)

Goal: Build a professional, scalable, secure, exam-oriented UI/UX for OERMS with full support for Exam, Question, Attempt, Assessment, and Result workflows.

🎨 General Design Direction

Create a clean, modern interface optimized for teachers, admins, and students.

Design Rules

Minimalistic, academic, dashboard-oriented UI

Use Next.js (App Router) + Tailwind CSS

Reusable components using shadcn/ui

Responsive layouts (desktop-first, mobile supported)

Clear information hierarchy (cards → tables → detail pages)

Use icons from lucide-react

Framer Motion for subtle animations

Color palette themes:

Blue for academic actions

Green for results

Red for errors/cancellations

Yellow for warnings

User Roles

Admin – system oversight

Teacher – exam/question creation

Student – exam taking + results

Each role sees a different dashboard.

UI/UX Requirements by Module
1. Authentication (Next.js + PKCE OAuth2)

Modern login page

Branding header: “OERMS – Online Exam & Result Management System”

Inputs:

email

password

Button:

“Sign in” → starts OAuth2 Authorization Code + PKCE

Show user role after login

Provide logout button in user menu

Redirect rules:

Student → /dashboard/student

Teacher → /dashboard/teacher

Admin → /dashboard/admin

2. Global Layout

Create a full app shell:

Left Sidebar

Tabs vary by role:

Admin

Dashboard

Manage Exams

Manage Questions

Students

Teachers

Attempts

Results

Analytics

Teacher

Dashboard

My Exams

My Questions

Students

Attempts

Results

Create Exam

Create Question

Student

Dashboard

Active Exams

Exam History

Results

Profile

Top Bar

App title

Search bar

Notifications

User avatar dropdown (Profile, Settings, Logout)

Content Area

Card-based layout

Smooth transitions between pages

Skeleton loaders for API calls

3. Exam Module (exam-service)
Exam List Page

Data table with columns:

Title

Subject

Status (DRAFT, PUBLISHED, ACTIVE, ARCHIVED, CANCELLED)

Created by

Total Questions

Actions (View, Edit, Publish, Archive)

Filters:

Status

Teacher

Created Date

Search bar

Exam Creation Page

Form sections:

Basic info

Timing settings

Marks configuration

Instructions

Allowed attempts

Shuffle questions (toggle)

Buttons:

Save Draft

Add Questions

Publish Exam

Exam Detail Page

Show:

Metadata

Statistics cards

List of questions

Graphs (pie chart for question types)

Action buttons:

Update

Publish / Unpublish

Archive

Cancel Exam (with reason)

4. Question Module (question-service)
Question List

Table:

Question text

Type (MCQ/Short/True-False)

Marks

Exam title

Actions

Create Question

Form items:

Question text

Question type selector

MCQ option builder

Correct answer selector

Marks

Explanation

Attach media (image/audio if needed)

Student Question View

When attempting an exam:

Show questions one-by-one OR in list

Highlight unanswered questions

Timer on top

Auto-save responses

Smooth navigation between questions

5. Attempt Module (attempt-service)
Student Attempt UI

Full-screen safe exam mode

Timer with warnings

Auto-submit on timer end

Track:

Answered

Skipped

Marked for Review

Teacher View Attempts

Table:

Student Name

Attempt Time

Score (if auto-graded)

Status (Pending, Completed, Evaluated)

View Attempt

6. Result Module
Student Result Page

Card layout:

Student Name

Exam Name

Total Marks

Marks Obtained

Percentage

Status

Download PDF Result button

Chart:

Score distribution

Section-wise breakdown

Teacher Result Review Page

Browse attempts

Evaluate subjective questions

Publish results

7. Analytics Module (Admin + Teacher)

Dashboards using charts:

Total exams

Active exams

Student participation count

Avg score

Exam difficulty analysis

Question type distribution

Charts (Recharts):

Bar chart

Line chart

Pie chart

Radar chart (optional)

8. Performance & UX Enhancements

Optimistic updates

Toast notifications

Infinite scroll / pagination

Error boundaries

Loading indicators

Debounced search

Modal confirmations

Keyboard shortcuts (optional)

9. API Integration Requirements

Front-end must call:

/api/exams/**

/api/questions/**

/api/attempt/**

/api/results/**

/api/auth/**

Headers:

Authorization: Bearer <access_token>

PKCE token exchange required for login flow

Use reusable API helper functions:

const api = async (url, options = {}) => { ... }


Store tokens in:

localStorage OR

HTTP-only cookies (recommended)

Handle 401 → auto logout.

10. Technologies Required

Next.js 14+ App Router

Tailwind CSS

shadcn/ui

lucide-react

Framer Motion

Recharts

TypeScript

OAuth2 PKCE authentication

Complete Prompt (Ready to Use)