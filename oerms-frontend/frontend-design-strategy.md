🎨 Frontend Design Strategy - Role-Based Dashboard Architecture
🏗️ Overall Architecture Approach
Design Philosophy

Role-Centric Views: Each role (Admin, Teacher, Student) sees a completely different experience
Data-First Design: Every page is designed around the rich analytics and data your backend provides
Progressive Disclosure: Show summaries first, details on demand
Real-time Feel: Use the extensive APIs to create a responsive, live-updating experience


👨‍💼 ADMIN DASHBOARD
Sidebar Navigation
📊 Dashboard (Home)
📚 Exams Management
   ├─ All Exams
   ├─ Pending Approval
   ├─ Templates Library
   └─ Bulk Operations

👥 Users Management
   ├─ Students
   ├─ Teachers
   └─ Roles & Permissions

📝 Attempts Monitor
   ├─ Live Attempts
   ├─ Suspicious Activity
   └─ Auto-Submit Queue

📈 Results & Analytics
   ├─ All Results
   ├─ Pending Grading
   ├─ System Analytics
   └─ Performance Trends

🔔 Notifications
⚙️ System Settings
Key Pages
1. Admin Dashboard (Home)
Purpose: System-wide overview and health monitoring
Widgets:

Live Stats Cards: Total exams, active attempts, pending results, system health
Activity Timeline: Recent exams published, results published, suspicious activities
Quick Actions: Bulk publish results, approve exams, send notifications
System Health: Service status, cache performance, database health
Performance Charts:

Exams created per week/month
Average pass rates trend
Student participation rates
System usage by subject



Data Sources:

/api/results/system/analytics
/api/results/system/trends
/api/exams/published/count
/api/attempts/all (with filters)


2. Exams Management Page
Purpose: Comprehensive exam oversight
Features:

Advanced Search Panel: Filter by status, teacher, subject, date range, marks range
Bulk Actions Toolbar: Select multiple → Publish/Archive/Delete
Exams Table with columns:

Title, Teacher, Status, Duration, Total Marks
Start/End Time, Students Attempted, Actions


Status Indicators: Color-coded badges (Draft, Published, Archived, Cancelled)
Quick Preview: Hover to see exam details without opening
Conflict Detection: Warning badges for scheduling conflicts

Data Sources:

/api/exams/search (advanced filters)
/api/exams/all
/api/exams/conflicts/{id}


3. Suspicious Activity Monitor
Purpose: Proctoring oversight and integrity management
Layout:

Alert Dashboard: High/Medium/Low priority violations
Live Attempts Panel: Currently active attempts with violation counts
Detailed Investigation View:

Student info, exam details
Violation timeline (tab switches, webcam violations)
Screenshot gallery (if captured)
Webcam frame analysis
Action buttons: Flag, Review, Contact Student



Features:

Real-time Updates: WebSocket for live violation alerts
Filtering: By exam, student, violation type, severity
Bulk Actions: Flag multiple attempts, send warnings

Data Sources:

/api/attempts/suspicious
/api/attempts/{id}/proctoring/summary
/api/attempts/{id}/proctoring/violations
/api/attempts/{id}/proctoring/timeline


4. System Analytics Page
Purpose: Deep insights into platform performance
Sections:

Overall Metrics: Total users, exams, pass rates, engagement
Subject Performance: Compare different subjects' success rates
Time-based Trends: Weekly/Monthly/Yearly performance graphs
Teacher Performance: Rankings, exam quality metrics
Student Engagement: Participation rates, drop-off analysis

Visualizations:

Line charts for trends
Bar charts for comparisons
Heat maps for activity patterns
Pie charts for distributions

Data Sources:

/api/results/system/analytics
/api/results/system/trends
/api/results/subject/{subject}/analytics


👨‍🏫 TEACHER DASHBOARD
Sidebar Navigation
📊 Dashboard (Home)
📚 My Exams
   ├─ All Exams
   ├─ Draft Exams
   ├─ Published Exams
   ├─ Archived Exams
   └─ Templates

➕ Create New Exam

❓ Question Bank
   ├─ My Questions
   ├─ Add Question
   └─ Import Questions

👥 Students & Attempts
   ├─ All Attempts
   ├─ In Progress
   └─ Suspicious Activity

📊 Results & Grading
   ├─ Pending Grading
   ├─ Published Results
   └─ Analytics

🔔 Notifications
⚙️ Settings
Key Pages
1. Teacher Dashboard (Home)
Purpose: Quick overview and action center
Widgets:

Quick Stats: Total exams, students, avg pass rate, exams this month
Action Required Cards:

Pending grading (count + quick link)
Exams needing questions
Upcoming exam deadlines
Conflicts detected


Recent Activity: Latest submissions, published results
Calendar View: Upcoming exams with start/end times
Performance Summary: Your exams' success rates, trends
Quick Actions: Create exam, grade results, publish results

Data Sources:

/api/exams/my-exams/count
/api/results/pending-grading
/api/exams/upcoming
/api/attempts/exam/{examId}/analytics


2. Create/Edit Exam Wizard
Purpose: Streamlined exam creation flow
Multi-Step Wizard:

Basic Info: Title, subject, description, instructions
Configuration: Duration, marks, passing marks, scheduling
Settings: Shuffle, show results, allow review, max attempts
Prerequisites: Select prerequisite exams if needed
Questions: Add/import questions (separate question management)
Review: Validate readiness, check conflicts
Publish/Save

Smart Features:

Template Selection: Start from existing template
Duplicate Existing: Clone with one click
Readiness Checker: Real-time validation feedback
Conflict Detector: Warns about scheduling conflicts
Auto-save: Draft saves automatically

Data Sources:

/api/exams/{id}/readiness
/api/exams/{id}/validate-configuration
/api/exams/{id}/conflicts
/api/exams/templates


3. Exam Detail & Management Page
Purpose: Complete exam management hub
Tabs Structure:
Tab 1: Overview

Exam details card
Quick stats: Total attempts, average score, pass rate
Status management buttons: Publish, Unpublish, Archive, Cancel
Schedule editor: Extend deadline, update times
Notification center: Send reminders, announcements

Tab 2: Questions

Question list with preview
Drag-to-reorder
Add/Edit/Delete questions
Statistics per question (accuracy, time spent)
Difficulty distribution chart

Tab 3: Attempts (with sub-tabs)

All Attempts: Table view with filters
In Progress: Live tracking
Suspicious: Flagged attempts
Analytics: Time breakdown, completion stats

Tab 4: Results

Results table (published/unpublished)
Grade distribution chart
Top scorers / Low performers
Bulk actions: Grade, Publish, Notify

Tab 5: Analytics

Comprehensive exam analytics
Question performance
Score distribution
Time analysis
Participation metrics
Comparison with other exams

Data Sources:

/api/exams/{id}/with-questions
/api/attempts/exam/{examId}
/api/results/exam/{examId}
/api/results/exam/{examId}/analytics
/api/exams/{id}/statistics


4. Grading Center
Purpose: Efficient manual grading workflow
Layout:

Pending Queue: List of results needing grading
Prioritization: Sort by submission time, student, exam
Grading Interface:

Student info sidebar
Question-by-question review
AI grading suggestions (if available)
Marks allocation sliders
Comment boxes per question
Overall feedback
Save & Next button


Bulk Grading: Select similar answers, grade together
Publish Options: Grade and publish immediately, or review later

Smart Features:

AI Suggestions: Show confidence scores and reasoning
Similar Answers: Group students with similar responses
Rubric Support: Pre-defined marking schemes
Progress Tracker: X of Y graded

Data Sources:

/api/results/pending-grading/prioritized
/api/results/{id}/grading-suggestions
/api/results/bulk/grade


5. Results & Analytics Page
Purpose: Comprehensive results management
Sections:
Results Management Panel:

Search & Filter: By status, passed/failed, date range, percentage range
Results table with actions: View, Grade, Publish, Unpublish
Bulk actions: Publish multiple, send notifications, export

Analytics Dashboard:

Overview Cards: Total results, pass rate, average score
Distribution Charts:

Score distribution histogram
Grade distribution pie chart
Performance bands


Top Performers: Leaderboard
Need Attention: Low performers list
Question Analysis: Which questions were hardest/easiest
Time Analysis: How long students took
Comparison: Compare with other exams/subjects

Export Options: Excel, PDF, CSV with customizable fields
Data Sources:

/api/results/exam/{examId}
/api/results/exam/{examId}/analytics
/api/results/exam/{examId}/grade-distribution
/api/results/exam/{examId}/top-scorers
/api/results/exam/{examId}/low-performers


👨‍🎓 STUDENT DASHBOARD
Sidebar Navigation
📊 Dashboard (Home)
📚 Available Exams
📝 My Attempts
   ├─ In Progress
   ├─ Completed
   └─ History

📊 My Results
   ├─ Published Results
   ├─ Analysis
   └─ Progress Tracking

📈 Performance Analytics
   ├─ Subject Performance
   ├─ Progress Over Time
   └─ Improvement Areas

🎯 Upcoming Exams
🔔 Notifications
⚙️ Settings
Key Pages
1. Student Dashboard (Home)
Purpose: Personalized learning hub
Widgets:

Welcome Card: "Good morning, [Name]! You have 2 exams today"
Quick Stats:

Exams taken
Average score
Current rank/percentile
Improvement trend (↑ 5% this month)


Urgent Actions:

Continue in-progress exam
Exams starting soon (countdown)
New results available


Calendar View: Upcoming exams timeline
Recent Performance: Last 5 results with quick insights
Achievement Badges: Milestones, streaks, top scores
Recommendations: "Try these exams based on your performance"

Data Sources:

/api/exams/available-for-me
/api/attempts/my-attempts
/api/results/my-statistics
/api/results/my-progress


2. Available Exams Page
Purpose: Discover and start exams
Layout:

Filter Sidebar: By subject, difficulty, duration, scheduled/anytime
Exam Cards Grid:

Title, subject, marks, duration
Status badges: Available, Starting Soon, Ending Soon
Prerequisites indicator (✅ Met / ❌ Not Met)
Remaining attempts counter
Quick actions: View Details, Start Exam, Check Prerequisites



Exam Detail Modal:

Full description and instructions
Schedule information
Prerequisites check (detailed)
Question count, marks breakdown
Past performance in similar exams
Teacher information
Start Exam button (with eligibility check)

Smart Features:

Availability Indicator: Real-time status check
Countdown Timers: For upcoming exams
Warning Alerts: "Ends in 2 hours!"
Prerequisite Guidance: "Complete Exam X to unlock"

Data Sources:

/api/exams/available-for-me
/api/exams/{id}/availability
/api/exams/{id}/prerequisites
/api/attempts/exam/{examId}/can-start


3. Exam Taking Interface
Purpose: Optimal exam experience
Layout:

Header Bar (always visible):

Exam title
Time remaining (countdown with color warnings)
Question navigation (1, 2, 3... 50)
Save & Exit button
Submit button


Main Content Area:

Question text (large, readable)
Options (for MCQ/multiple choice)
Text area (for essay/short answer)
Media (images, if any)


Sidebar:

Progress: X of Y answered
Flagged questions list
Quick navigation
Pause button (if allowed)


Bottom Actions:

Previous | Next buttons
Flag for Review checkbox
Clear Answer button



Smart Features:

Auto-save: Every 30 seconds
Time Warnings: Color changes, alerts at 10 min, 5 min, 1 min
Proctoring Indicators: Webcam active, tab switches tracked
Offline Support: Cache answers, sync when back online
Keyboard Shortcuts: Next (→), Previous (←), Flag (F)

Proctoring Panel (if enabled):

Webcam feed (small corner)
Status indicators: "All good" / "Multiple faces detected"
Tab switch counter with warning

Data Sources:

/api/attempts/{id}/status
/api/attempts/{id}/progress
/api/attempts/{id}/answers
POST /api/attempts/{id}/answers (save)


4. My Results Page
Purpose: Results viewing and analysis
List View:

Search & Filter: By exam, date, passed/failed, grade
Results Cards:

Exam title, date, score badge
Visual progress bar (marks obtained/total)
Grade badge (A+, B, etc.)
Status: Published, Rank shown
View Details button



Result Detail View (Modal or separate page):
Header Section:

Score overview: Big percentage circle
Grade, rank, percentile
Pass/Fail badge
Time taken

Tabs:
Tab 1: Overview

Summary statistics
Performance level (Excellent, Good, etc.)
Comparison with class average
Strengths and weaknesses chips

Tab 2: Question-by-Question Analysis

Each question with:

Your answer vs correct answer
✅ Correct or ❌ Incorrect
Marks obtained
Explanation (if provided)
Time spent on question


Filter: Show only incorrect / only flagged

Tab 3: Insights & Recommendations

AI-generated performance insights
Topic-wise breakdown (pie/bar chart)
Time efficiency analysis
Specific recommendations:

"Focus more on Algebra"
"Good time management!"
"Review Chapter 5"



Tab 4: Comparison

Your score vs class average
Percentile chart
Topic-wise comparison
Historical comparison (if multiple attempts)

Data Sources:

/api/results/my-results
/api/results/{id}/details
/api/results/{id}/insights
/api/results/{id}/strengths-weaknesses
/api/results/{id}/compare-with-average
/api/results/{id}/percentile


5. Performance Analytics Page
Purpose: Long-term progress tracking
Sections:
Overall Progress Dashboard:

Total exams taken
Average score trend (line chart)
Pass rate
Improvement rate

Subject-Wise Performance:

Cards for each subject
Average score, exams taken, trend
Strength indicator (Strong, Average, Weak)

Progress Over Time:

Interactive line/area chart
Select date range
Multiple metrics: Scores, percentile, time efficiency
Annotations for key achievements

Improvement Areas:

Priority-based list (High, Medium, Low)
Current vs target performance
Specific recommendations
Related resources/exams

Achievements & Milestones:

Badge gallery
Streaks (consecutive exams, improvement)
Personal bests
Leaderboard position (if public)

Compare Results:

Select multiple results
Side-by-side comparison
Trend analysis

Data Sources:

/api/results/my-progress
/api/results/my-subject-performance
/api/results/my-improvement-areas
/api/results/my-results/compare


🎨 Common UI Components
Reusable Components to Build

Data Tables:

Sortable columns
Multi-select with bulk actions
Inline editing
Export options
Advanced filters


Charts Library:

Line charts (trends)
Bar charts (comparisons)
Pie/Donut charts (distributions)
Gauge charts (progress)
Heat maps (activity)


Status Badges: Color-coded for statuses
Action Buttons:

Primary/Secondary/Danger
With confirmation modals for destructive actions


Search Bars:

With instant search
Filter chips
Advanced filter panels


Cards:

Stat cards with icons
Entity cards (exams, results)
Action cards


Modals/Drawers:

Quick view
Detail panels
Forms


Notifications:

Toast messages
Alert banners
Notification center


Empty States: Friendly messages when no data
Loading States: Skeletons, spinners


📱 Responsive Design Strategy
Desktop (1920px+)

Full sidebar always visible
Multi-column layouts
Large data tables
Multiple charts side-by-side

Tablet (768px - 1919px)

Collapsible sidebar
Two-column layouts
Scrollable tables
Stacked charts

Mobile (< 768px)

Bottom navigation bar instead of sidebar
Single column layouts
Card-based views instead of tables
Simplified charts
Swipe gestures for navigation


🔔 Notification Strategy
Real-time Notifications (via WebSocket)

Exam started by student (Teacher)
Result published (Student)
Suspicious activity detected (Admin/Teacher)
Exam about to start (Student)
New exam published (Student)

Email Notifications

Result published
Exam reminder (24h, 1h before)
Pending grading reminder (Teacher)
Suspicious activity report (Teacher/Admin)

In-App Notification Center

Bell icon with count badge
Dropdown with recent notifications
Mark as read
Filter by type
Link to relevant page


🎯 Key UX Principles

Progressive Disclosure: Show summaries, reveal details on demand
Data Visualization First: Use charts before tables when possible
Action-Oriented: Every page should have clear CTAs
Contextual Help: Tooltips, help icons, guided tours for new users
Feedback: Loading states, success messages, error handling
Accessibility: WCAG compliant, keyboard navigation, screen reader friendly
Performance: Lazy loading, infinite scroll, pagination, caching
Consistency: Uniform design language, reusable components


🚀 Development Priority
Phase 1: MVP (Core Functionality)

Login/Auth pages
Role-based home dashboards
Exam list & detail pages
Exam taking interface
Results viewing (student)
Basic grading (teacher)

Phase 2: Management Features

Create/edit exam wizard
Question management
Bulk operations
Advanced search/filtering

Phase 3: Analytics & Insights

Performance analytics
System analytics (admin)
Proctoring monitoring
Reports & exports

Phase 4: Polish & Optimization

Real-time features
Offline support
Mobile optimization
Advanced visualizations

Controllers in backend
package com.oerms.exam.controller;

import com.oerms.exam.dto.*;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.PageResponse;
import com.oerms.exam.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Exam Management", description = "APIs for managing exams")
public class ExamController {

    private final ExamService examService;

    // ==================== CRUD Operations ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Create a new exam", description = "Creates a new exam in DRAFT status")
    public ResponseEntity<ApiResponse<ExamDTO>> createExam(
            @Valid @RequestBody CreateExamRequest request,
            Authentication authentication) {
        ExamDTO exam = examService.createExam(request, authentication);
        return new ResponseEntity<>(
                ApiResponse.success("Exam created successfully", exam),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN') or hasAuthority('SCOPE_internal')")
    @Operation(summary = "Get exam by ID", description = "Retrieves a single exam by its ID")
    public ResponseEntity<ApiResponse<ExamDTO>> getExam(
            @Parameter(description = "Exam ID") @PathVariable UUID id) {
        ExamDTO exam = examService.getExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam retrieved successfully", exam));
    }

    @GetMapping("/{id}/with-questions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam with questions", description = "Retrieves an exam with all its questions and statistics")
    public ResponseEntity<ApiResponse<ExamWithQuestionsDTO>> getExamWithQuestions(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            Authentication authentication) {

        ExamWithQuestionsDTO examWithQuestions = examService.getExamWithQuestions(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam with questions retrieved successfully", examWithQuestions));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update exam", description = "Updates an existing exam (only DRAFT exams can be updated)")
    public ResponseEntity<ApiResponse<ExamDTO>> updateExam(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            @Valid @RequestBody UpdateExamRequest request,
            Authentication authentication) {

        ExamDTO exam = examService.updateExam(id, request, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", exam));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete exam", description = "Deletes an exam (only DRAFT exams can be deleted)")
    public ResponseEntity<ApiResponse<Void>> deleteExam(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            Authentication authentication) {

        examService.deleteExam(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", null));
    }

    // ==================== Exam Status Management ====================

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Publish exam", description = "Publishes an exam (makes it available to students)")
    public ResponseEntity<ApiResponse<ExamDTO>> publishExam(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            Authentication authentication) {

        ExamDTO exam = examService.publishExam(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam published successfully", exam));
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Unpublish exam", description = "Unpublishes an exam (returns it to DRAFT status)")
    public ResponseEntity<ApiResponse<ExamDTO>> unpublishExam(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            Authentication authentication) {

        ExamDTO exam = examService.unpublishExam(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam unpublished successfully", exam));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Archive exam", description = "Archives an exam (marks it as inactive)")
    public ResponseEntity<ApiResponse<ExamDTO>> archiveExam(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            Authentication authentication) {

        ExamDTO exam = examService.archiveExam(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam archived successfully", exam));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Cancel exam", description = "Cancels a published exam with a reason")
    public ResponseEntity<ApiResponse<ExamDTO>> cancelExam(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            @Parameter(description = "Cancellation reason") @RequestParam(required = false) String reason,
            Authentication authentication) {

        ExamDTO exam = examService.cancelExam(id, reason, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam cancelled successfully", exam));
    }

    @GetMapping("/{id}/validate-publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Validate exam for publishing", description = "Checks if an exam is ready to be published")
    public ResponseEntity<ApiResponse<Boolean>> validateExamForPublish(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            Authentication authentication) {

        Boolean isValid = examService.validateExamForPublish(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam validation completed", isValid));
    }

    // ==================== Student Exam Operations ====================

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start exam", description = "Student starts taking an exam and creates an attempt")
    public ResponseEntity<ApiResponse<ExamStartResponse>> startExam(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            Authentication authentication) {
        ExamStartResponse response = examService.startExam(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam started successfully", response));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Complete exam", description = "Student completes an exam")
    public ResponseEntity<ApiResponse<Void>> completeExam(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            Authentication authentication) {

        examService.completeExam(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam completed successfully", null));
    }

    // ==================== Query Operations ====================

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all exams (Admin)", description = "Retrieves all exams in the system (admin only)")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getAllExams(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication authentication) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        PageResponse<ExamDTO> exams = examService.getAllExams(authentication, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success("All exams retrieved successfully", exams));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get teacher's exams", description = "Retrieves all exams created by a specific teacher")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getTeacherExams(
            @Parameter(description = "Teacher ID") @PathVariable UUID teacherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        PageResponse<ExamDTO> exams = examService.getTeacherExams(
                teacherId, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success("Exams retrieved successfully", exams));
    }

    @GetMapping("/published")
    @Operation(summary = "Get published exams", description = "Retrieves all published and active exams")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getPublishedExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        PageResponse<ExamDTO> exams = examService.getPublishedExams(PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success("Published exams retrieved successfully", exams));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active exams", description = "Retrieves all currently active exams")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getActiveExams() {
        List<ExamDTO> exams = examService.getActiveExams();
        return ResponseEntity.ok(ApiResponse.success("Active exams retrieved successfully", exams));
    }

    @GetMapping("/ongoing")
    @Operation(summary = "Get ongoing exams", description = "Retrieves exams that are currently in progress")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getOngoingExams() {
        List<ExamDTO> exams = examService.getOngoingExams();
        return ResponseEntity.ok(ApiResponse.success("Ongoing exams retrieved successfully", exams));
    }

    // ==================== Statistics & Counts ====================

    @GetMapping("/teacher/{teacherId}/count")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get teacher's exam count", description = "Returns the total number of exams created by a teacher")
    public ResponseEntity<ApiResponse<Long>> getTeacherExamCount(
            @Parameter(description = "Teacher ID") @PathVariable UUID teacherId) {
        Long count = examService.getTeacherExamCount(teacherId);
        return ResponseEntity.ok(ApiResponse.success("Exam count retrieved successfully", count));
    }

    @GetMapping("/published/count")
    @Operation(summary = "Get published exam count", description = "Returns the total number of published exams")
    public ResponseEntity<ApiResponse<Long>> getPublishedExamCount() {
        Long count = examService.getPublishedExamCount();
        return ResponseEntity.ok(ApiResponse.success("Published exam count retrieved successfully", count));
    }

    @GetMapping("/{id}/questions/count")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get question count for exam", description = "Returns the number of questions in an exam")
    public ResponseEntity<ApiResponse<Long>> getExamQuestionCount(
            @Parameter(description = "Exam ID") @PathVariable UUID id) {
        Long count = examService.getExamQuestionCount(id);
        return ResponseEntity.ok(ApiResponse.success("Question count retrieved successfully", count));
    }

    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam statistics", description = "Returns detailed statistics about an exam including question breakdown")
    public ResponseEntity<ApiResponse<ExamStatisticsDTO>> getExamStatistics(
            @Parameter(description = "Exam ID") @PathVariable UUID id,
            Authentication authentication) {
        ExamStatisticsDTO statistics = examService.getExamStatistics(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Exam statistics retrieved successfully", statistics));
    }

    // ==================== Current User Operations ====================

    @GetMapping("/my-exams")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get current user's exams", description = "Retrieves all exams created by the current user")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getMyExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication authentication) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        PageResponse<ExamDTO> exams = examService.getMyExams(authentication, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success("Your exams retrieved successfully", exams));
    }

    @GetMapping("/my-exams/count")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get current user's exam count", description = "Returns the number of exams created by the current user")
    public ResponseEntity<ApiResponse<Long>> getMyExamCount(Authentication authentication) {
        Long count = examService.getMyExamCount(authentication);
        return ResponseEntity.ok(ApiResponse.success("Your exam count retrieved successfully", count));
    }

    // ==================== Exam Availability & Eligibility ====================

    @GetMapping("/{id}/availability")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Check exam availability", description = "Check if exam is available for student to take")
    public ResponseEntity<ApiResponse<ExamAvailabilityDTO>> checkExamAvailability(
            @PathVariable UUID id,
            Authentication auth) {
        ExamAvailabilityDTO availability = examService.checkExamAvailability(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Exam availability checked successfully", availability));
    }

    @GetMapping("/available-for-me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my available exams", description = "Get all exams student can currently take")
    public ResponseEntity<ApiResponse<Page<ExamDTO>>> getMyAvailableExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        Page<ExamDTO> exams = examService.getMyAvailableExams(PageRequest.of(page, size), auth);
        return ResponseEntity.ok(ApiResponse.success("Available exams retrieved successfully", exams));
    }

    @GetMapping("/{id}/prerequisites")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get exam prerequisites", description = "Check prerequisite exams and their completion status")
    public ResponseEntity<ApiResponse<PrerequisiteCheckDTO>> checkPrerequisites(
            @PathVariable UUID id,
            Authentication auth) {
        PrerequisiteCheckDTO prerequisites = examService.checkPrerequisites(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Prerequisites checked successfully", prerequisites));
    }

    // ==================== Advanced Search & Filtering ====================

    @GetMapping("/search")
    @Operation(summary = "Advanced exam search", description = "Search with multiple filters")
    public ResponseEntity<ApiResponse<Page<ExamDTO>>> searchExams(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) ExamStatus status,
            @RequestParam(required = false) UUID teacherId,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Integer minTotalMarks,
            @RequestParam(required = false) Integer maxTotalMarks,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication auth) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        
        Page<ExamDTO> exams = examService.searchExams(title, subject, status, teacherId, minDuration, 
                maxDuration, startDate, endDate, minTotalMarks, maxTotalMarks, isActive, 
                PageRequest.of(page, size, sort), auth);
        return ResponseEntity.ok(ApiResponse.success("Exams searched successfully", exams));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming exams", description = "Get scheduled exams starting soon")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getUpcomingExams(
            @RequestParam(defaultValue = "7") int daysAhead,
            Authentication auth) {
        List<ExamDTO> exams = examService.getUpcomingExams(daysAhead, auth);
        return ResponseEntity.ok(ApiResponse.success("Upcoming exams retrieved successfully", exams));
    }

    @GetMapping("/ending-soon")
    @Operation(summary = "Get exams ending soon", description = "Get exams with approaching deadlines")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getExamsEndingSoon(
            @RequestParam(defaultValue = "24") int hoursAhead,
            Authentication auth) {
        List<ExamDTO> exams = examService.getExamsEndingSoon(hoursAhead, auth);
        return ResponseEntity.ok(ApiResponse.success("Exams ending soon retrieved successfully", exams));
    }

    @GetMapping("/by-subject")
    @Operation(summary = "Get exams by subject", description = "Get all exams for a specific subject")
    public ResponseEntity<ApiResponse<Page<ExamDTO>>> getExamsBySubject(
            @RequestParam String subject,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        Page<ExamDTO> exams = examService.getExamsBySubject(subject, PageRequest.of(page, size), auth);
        return ResponseEntity.ok(ApiResponse.success("Exams by subject retrieved successfully", exams));
    }

    // ==================== Exam Duplication & Templates ====================

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Duplicate exam", description = "Create a copy of existing exam with questions")
    public ResponseEntity<ApiResponse<ExamDTO>> duplicateExam(
            @PathVariable UUID id,
            @RequestBody(required = false) DuplicateExamRequest request,
            Authentication auth) {
        ExamDTO exam = examService.duplicateExam(id, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Exam duplicated successfully", exam));
    }

    @PostMapping("/{id}/create-template")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Create exam template", description = "Save exam as reusable template")
    public ResponseEntity<ApiResponse<ExamTemplateDTO>> createTemplate(
            @PathVariable UUID id,
            @RequestBody CreateTemplateRequest request,
            Authentication auth) {
        ExamTemplateDTO template = examService.createTemplate(id, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Template created successfully", template));
    }

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam templates", description = "Get all available exam templates")
    public ResponseEntity<ApiResponse<Page<ExamTemplateDTO>>> getTemplates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        Page<ExamTemplateDTO> templates = examService.getTemplates(PageRequest.of(page, size), auth);
        return ResponseEntity.ok(ApiResponse.success("Templates retrieved successfully", templates));
    }

    @PostMapping("/from-template/{templateId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Create exam from template", description = "Create new exam using template")
    public ResponseEntity<ApiResponse<ExamDTO>> createFromTemplate(
            @PathVariable UUID templateId,
            @RequestBody CreateFromTemplateRequest request,
            Authentication auth) {
        ExamDTO exam = examService.createFromTemplate(templateId, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Exam created from template successfully", exam));
    }

    // ==================== Exam Scheduling & Management ====================

    @PutMapping("/{id}/schedule")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update exam schedule", description = "Modify exam start/end times")
    public ResponseEntity<ApiResponse<ExamDTO>> updateSchedule(
            @PathVariable UUID id,
            @RequestBody UpdateScheduleRequest request,
            Authentication auth) {
        ExamDTO exam = examService.updateSchedule(id, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Schedule updated successfully", exam));
    }

    @PostMapping("/{id}/extend-deadline")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Extend exam deadline", description = "Extend end time for exam")
    public ResponseEntity<ApiResponse<ExamDTO>> extendDeadline(
            @PathVariable UUID id,
            @RequestBody ExtendDeadlineRequest request,
            Authentication auth) {
        ExamDTO exam = examService.extendDeadline(id, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Deadline extended successfully", exam));
    }

    @PutMapping("/{id}/duration")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update exam duration", description = "Change exam duration for ongoing exam")
    public ResponseEntity<ApiResponse<ExamDTO>> updateDuration(
            @PathVariable UUID id,
            @RequestParam Integer newDuration,
            Authentication auth) {
        ExamDTO exam = examService.updateDuration(id, newDuration, auth);
        return ResponseEntity.ok(ApiResponse.success("Duration updated successfully", exam));
    }

    // ==================== Bulk Operations ====================

    @PostMapping("/bulk/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Bulk publish exams", description = "Publish multiple exams at once")
    public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkPublish(
            @RequestBody BulkOperationRequest request,
            Authentication auth) {
        BulkOperationResultDTO result = examService.bulkPublish(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Bulk publish completed successfully", result));
    }

    @PostMapping("/bulk/archive")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Bulk archive exams", description = "Archive multiple exams at once")
    public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkArchive(
            @RequestBody BulkOperationRequest request,
            Authentication auth) {
        BulkOperationResultDTO result = examService.bulkArchive(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Bulk archive completed successfully", result));
    }

    @PostMapping("/bulk/delete")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete exams", description = "Delete multiple draft exams")
    public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkDelete(
            @RequestBody BulkOperationRequest request,
            Authentication auth) {
        BulkOperationResultDTO result = examService.bulkDelete(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Bulk delete completed successfully", result));
    }

    @PostMapping("/bulk/update-status")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Bulk update exam status", description = "Update status for multiple exams")
    public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkUpdateStatus(
            @RequestBody BulkStatusUpdateRequest request,
            Authentication auth) {
        BulkOperationResultDTO result = examService.bulkUpdateStatus(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Bulk status update completed successfully", result));
    }

    // ==================== Validation & Verification ====================

    @GetMapping("/{id}/conflicts")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Check scheduling conflicts", description = "Check for conflicts with other exams")
    public ResponseEntity<ApiResponse<List<ExamConflictDTO>>> checkConflicts(
            @PathVariable UUID id,
            Authentication auth) {
        List<ExamConflictDTO> conflicts = examService.checkConflicts(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Conflicts checked successfully", conflicts));
    }

    @GetMapping("/{id}/readiness")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Check exam readiness", description = "Comprehensive readiness checklist")
    public ResponseEntity<ApiResponse<ExamReadinessDTO>> checkReadiness(
            @PathVariable UUID id,
            Authentication auth) {
        ExamReadinessDTO readiness = examService.checkReadiness(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Readiness checked successfully", readiness));
    }

    @PostMapping("/{id}/validate-configuration")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Validate exam configuration", description = "Validate all exam settings")
    public ResponseEntity<ApiResponse<ValidationResultDTO>> validateConfiguration(
            @PathVariable UUID id,
            Authentication auth) {
        ValidationResultDTO validation = examService.validateConfiguration(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Configuration validated successfully", validation));
    }

    // ==================== Notifications & Reminders ====================

    @PostMapping("/{id}/notify-students")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Notify students", description = "Send notification about exam to students")
    public ResponseEntity<ApiResponse<NotificationResultDTO>> notifyStudents(
            @PathVariable UUID id,
            @RequestBody NotifyStudentsRequest request,
            Authentication auth) {
        NotificationResultDTO result = examService.notifyStudents(id, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Students notified successfully", result));
    }

    @GetMapping("/{id}/notification-history")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get notification history", description = "Get history of notifications sent")
    public ResponseEntity<ApiResponse<List<NotificationHistoryDTO>>> getNotificationHistory(
            @PathVariable UUID id,
            Authentication auth) {
        List<NotificationHistoryDTO> history = examService.getNotificationHistory(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Notification history retrieved successfully", history));
    }
}

package com.oerms.attempt.controller;

import com.oerms.attempt.dto.*;
import com.oerms.attempt.service.AttemptService;
import com.oerms.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Attempt Management", description = "APIs for managing exam attempts")
public class AttemptController {

    private final AttemptService attemptService;

    // ==================== Student Operations ====================

    @PostMapping("/start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start exam attempt", description = "Starts a new exam attempt for a student")
    public ResponseEntity<ApiResponse<AttemptResponse>> startAttempt(
            @Valid @RequestBody StartAttemptRequest request,
            HttpServletRequest httpRequest,
            Authentication authentication) {
        log.info("Start attempt request for exam: {}", request.getExamId());
        
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        
        AttemptResponse response = attemptService.startAttempt(request, ipAddress, userAgent, authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attempt started successfully", response));
    }

    @PostMapping("/{attemptId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save answer", description = "Saves or updates an answer for a question in an attempt")
    public ResponseEntity<ApiResponse<AttemptAnswerResponse>> saveAnswer(
            @Parameter(description = "Attempt ID") @PathVariable UUID attemptId,
            @Valid @RequestBody SaveAnswerRequest request,
            Authentication authentication) {
        log.debug("Save answer request for attempt: {}, question: {}", attemptId, request.getQuestionId());
        
        AttemptAnswerResponse response = attemptService.saveAnswer(attemptId, request, authentication);
        return ResponseEntity.ok(ApiResponse.success("Answer saved successfully", response));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit attempt", description = "Submits a completed exam attempt")
    public ResponseEntity<ApiResponse<AttemptResponse>> submitAttempt(
            @Valid @RequestBody SubmitAttemptRequest request,
            Authentication authentication) {
        log.info("Submit attempt request: {}", request.getAttemptId());
        
        AttemptResponse response = attemptService.submitAttempt(request, authentication);
        return ResponseEntity.ok(ApiResponse.success("Attempt submitted successfully", response));
    }

    @GetMapping("/my-attempts")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my attempts", description = "Retrieves all attempts by the current student")
    public ResponseEntity<ApiResponse<Page<AttemptSummary>>> getMyAttempts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        log.info("Get my attempts request");
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("startedAt").descending());
        Page<AttemptSummary> attempts = attemptService.getStudentAttempts(pageable, authentication);
        return ResponseEntity.ok(ApiResponse.success("Attempts retrieved successfully", attempts));
    }

    @GetMapping("/my-attempts/exam/{examId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my attempts for exam", description = "Retrieves all attempts by current student for a specific exam")
    public ResponseEntity<ApiResponse<Page<AttemptSummary>>> getMyExamAttempts(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        log.info("Get my attempts for exam: {}", examId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("startedAt").descending());
        Page<AttemptSummary> attempts = attemptService.getStudentExamAttempts(examId, pageable, authentication);
        return ResponseEntity.ok(ApiResponse.success("Attempts retrieved successfully", attempts));
    }

    @GetMapping("/my-attempts/count")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my attempts count", description = "Returns total number of attempts by current student")
    public ResponseEntity<ApiResponse<Long>> getMyAttemptsCount(Authentication authentication) {
        log.info("Get my attempts count request");
        
        Long count = attemptService.getStudentAttemptsCount(authentication);
        return ResponseEntity.ok(ApiResponse.success("Attempt count retrieved successfully", count));
    }

    // ==================== Proctoring ====================

    @PostMapping("/{attemptId}/tab-switch")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Record tab switch", description = "Records when student switches browser tabs during exam")
    public ResponseEntity<ApiResponse<Void>> recordTabSwitch(
            @Parameter(description = "Attempt ID") @PathVariable UUID attemptId,
            Authentication authentication) {
        attemptService.recordTabSwitch(attemptId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Tab switch recorded", null));
    }

    @PostMapping("/{attemptId}/webcam-violation")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Record webcam violation", description = "Records webcam/face detection violations")
    public ResponseEntity<ApiResponse<Void>> recordWebcamViolation(
            @Parameter(description = "Attempt ID") @PathVariable UUID attemptId,
            Authentication authentication) {
        attemptService.recordWebcamViolation(attemptId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Webcam violation recorded", null));
    }

    @PostMapping("/{attemptId}/violations/custom")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Record custom violation", description = "Records any custom proctoring violation")
    public ResponseEntity<ApiResponse<Void>> recordCustomViolation(
            @Parameter(description = "Attempt ID") @PathVariable UUID attemptId,
            @RequestParam String violationType,
            Authentication authentication) {
        attemptService.recordCustomViolation(attemptId, violationType, authentication);
        return ResponseEntity.ok(ApiResponse.success("Violation recorded", null));
    }

    // ==================== View Operations ====================

    @GetMapping("/{attemptId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get attempt details", description = "Retrieves detailed information about an attempt")
    public ResponseEntity<ApiResponse<AttemptResponse>> getAttempt(
            @Parameter(description = "Attempt ID") @PathVariable UUID attemptId,
            Authentication authentication) {
        log.info("Get attempt request: {}", attemptId);
        
        AttemptResponse response = attemptService.getAttempt(attemptId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Attempt retrieved successfully", response));
    }

    @GetMapping("/{attemptId}/answers")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get attempt answers", description = "Retrieves all answers for an attempt")
    public ResponseEntity<ApiResponse<List<AttemptAnswerResponse>>> getAttemptAnswers(
            @Parameter(description = "Attempt ID") @PathVariable UUID attemptId,
            Authentication authentication) {
        log.info("Get attempt answers request: {}", attemptId);
        
        List<AttemptAnswerResponse> answers = attemptService.getAttemptAnswers(attemptId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Answers retrieved successfully", answers));
    }

    // ==================== Teacher/Admin Operations ====================

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam attempts", description = "Retrieves all attempts for a specific exam (teacher/admin)")
    public ResponseEntity<ApiResponse<Page<AttemptSummary>>> getExamAttempts(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        log.info("Get exam attempts request: {}", examId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("startedAt").descending());
        Page<AttemptSummary> attempts = attemptService.getExamAttempts(examId, pageable, authentication);
        return ResponseEntity.ok(ApiResponse.success("Attempts retrieved successfully", attempts));
    }

    @GetMapping("/exam/{examId}/count")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam attempts count", description = "Returns total number of attempts for an exam")
    public ResponseEntity<ApiResponse<Long>> getExamAttemptsCount(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication authentication) {
        log.info("Get exam attempts count: {}", examId);
        
        Long count = attemptService.getExamAttemptsCount(examId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Attempt count retrieved successfully", count));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get student attempts", description = "Retrieves all attempts by a specific student (teacher/admin)")
    public ResponseEntity<ApiResponse<Page<AttemptSummary>>> getStudentAttemptsAdmin(
            @Parameter(description = "Student ID") @PathVariable UUID studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Get attempts for student: {}", studentId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("startedAt").descending());
        Page<AttemptSummary> attempts = attemptService.getStudentAttemptsAdmin(studentId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Attempts retrieved successfully", attempts));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all attempts", description = "Retrieves all attempts in the system (admin only)")
    public ResponseEntity<ApiResponse<Page<AttemptSummary>>> getAllAttempts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Get all attempts request");
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("startedAt").descending());
        Page<AttemptSummary> attempts = attemptService.getAllAttempts(pageable);
        return ResponseEntity.ok(ApiResponse.success("Attempts retrieved successfully", attempts));
    }

    // ==================== Attempt Management ====================

    @PostMapping("/{attemptId}/pause")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Pause attempt", description = "Pause exam attempt (if allowed)")
    public ResponseEntity<ApiResponse<AttemptResponse>> pauseAttempt(
            @PathVariable UUID attemptId,
            Authentication auth) {
        AttemptResponse response = attemptService.pauseAttempt(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Attempt paused successfully", response));
    }

    @PostMapping("/{attemptId}/resume")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Resume attempt", description = "Resume paused attempt")
    public ResponseEntity<ApiResponse<AttemptResponse>> resumeAttempt(
            @PathVariable UUID attemptId,
            Authentication auth) {
        AttemptResponse response = attemptService.resumeAttempt(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Attempt resumed successfully", response));
    }

    @GetMapping("/{attemptId}/status")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get attempt status", description = "Get current status and remaining time")
    public ResponseEntity<ApiResponse<AttemptStatusDTO>> getAttemptStatus(
            @PathVariable UUID attemptId,
            Authentication auth) {
        AttemptStatusDTO status = attemptService.getAttemptStatus(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Attempt status retrieved successfully", status));
    }

    @GetMapping("/{attemptId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get attempt progress", description = "Get progress details (answered/unanswered)")
    public ResponseEntity<ApiResponse<AttemptProgressDTO>> getAttemptProgress(
            @PathVariable UUID attemptId,
            Authentication auth) {
        AttemptProgressDTO progress = attemptService.getAttemptProgress(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Attempt progress retrieved successfully", progress));
    }

    @PostMapping("/{attemptId}/save-progress")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save progress", description = "Auto-save attempt progress")
    public ResponseEntity<ApiResponse<Void>> saveProgress(
            @PathVariable UUID attemptId,
            @RequestBody SaveProgressRequest request,
            Authentication auth) {
        attemptService.saveProgress(attemptId, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Progress saved successfully", null));
    }

    // ==================== Answer Management ====================

    @DeleteMapping("/{attemptId}/answers/{questionId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Clear answer", description = "Clear/remove answer for a question")
    public ResponseEntity<ApiResponse<Void>> clearAnswer(
            @PathVariable UUID attemptId,
            @PathVariable UUID questionId,
            Authentication auth) {
        attemptService.clearAnswer(attemptId, questionId, auth);
        return ResponseEntity.ok(ApiResponse.success("Answer cleared successfully", null));
    }

    @PostMapping("/{attemptId}/answers/bulk")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save multiple answers", description = "Save answers for multiple questions at once")
    public ResponseEntity<ApiResponse<List<AttemptAnswerResponse>>> saveBulkAnswers(
            @PathVariable UUID attemptId,
            @RequestBody List<SaveAnswerRequest> requests,
            Authentication auth) {
        List<AttemptAnswerResponse> responses = attemptService.saveBulkAnswers(attemptId, requests, auth);
        return ResponseEntity.ok(ApiResponse.success("Bulk answers saved successfully", responses));
    }

    @GetMapping("/{attemptId}/answers/{questionId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get specific answer", description = "Get answer for a specific question")
    public ResponseEntity<ApiResponse<AttemptAnswerResponse>> getAnswer(
            @PathVariable UUID attemptId,
            @PathVariable UUID questionId,
            Authentication auth) {
        AttemptAnswerResponse answer = attemptService.getAnswer(attemptId, questionId, auth);
        return ResponseEntity.ok(ApiResponse.success("Answer retrieved successfully", answer));
    }

    @PostMapping("/{attemptId}/answers/{questionId}/flag")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Flag question for review", description = "Mark question for later review")
    public ResponseEntity<ApiResponse<Void>> flagQuestion(
            @PathVariable UUID attemptId,
            @PathVariable UUID questionId,
            Authentication auth) {
        attemptService.flagQuestion(attemptId, questionId, auth);
        return ResponseEntity.ok(ApiResponse.success("Question flagged successfully", null));
    }

    @DeleteMapping("/{attemptId}/answers/{questionId}/flag")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Unflag question", description = "Remove review flag from question")
    public ResponseEntity<ApiResponse<Void>> unflagQuestion(
            @PathVariable UUID attemptId,
            @PathVariable UUID questionId,
            Authentication auth) {
        attemptService.unflagQuestion(attemptId, questionId, auth);
        return ResponseEntity.ok(ApiResponse.success("Question unflagged successfully", null));
    }

    @GetMapping("/{attemptId}/flagged-questions")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get flagged questions", description = "Get all questions marked for review")
    public ResponseEntity<ApiResponse<List<UUID>>> getFlaggedQuestions(
            @PathVariable UUID attemptId,
            Authentication auth) {
        List<UUID> flaggedQuestions = attemptService.getFlaggedQuestions(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Flagged questions retrieved successfully", flaggedQuestions));
    }

    // ==================== Advanced Proctoring ====================

    @PostMapping("/{attemptId}/proctoring/heartbeat")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Send proctoring heartbeat", description = "Regular heartbeat for proctoring")
    public ResponseEntity<ApiResponse<Void>> sendHeartbeat(
            @PathVariable UUID attemptId,
            @RequestBody ProctoringHeartbeatRequest request,
            Authentication auth) {
        attemptService.sendHeartbeat(attemptId, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Heartbeat sent successfully", null));
    }

    @PostMapping("/{attemptId}/proctoring/screenshot")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Upload proctoring screenshot", description = "Upload screenshot for proctoring")
    public ResponseEntity<ApiResponse<Void>> uploadScreenshot(
            @PathVariable UUID attemptId,
            @RequestParam MultipartFile screenshot,
            Authentication auth) {
        attemptService.uploadScreenshot(attemptId, screenshot, auth);
        return ResponseEntity.ok(ApiResponse.success("Screenshot uploaded successfully", null));
    }

    @PostMapping("/{attemptId}/proctoring/webcam-frame")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Upload webcam frame", description = "Upload webcam frame for face detection")
    public ResponseEntity<ApiResponse<Void>> uploadWebcamFrame(
            @PathVariable UUID attemptId,
            @RequestParam MultipartFile frame,
            Authentication auth) {
        attemptService.uploadWebcamFrame(attemptId, frame, auth);
        return ResponseEntity.ok(ApiResponse.success("Webcam frame uploaded successfully", null));
    }

    @GetMapping("/{attemptId}/proctoring/summary")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get proctoring summary", description = "Get summary of all proctoring events")
    public ResponseEntity<ApiResponse<ProctoringSummaryDTO>> getProctoringSummary(
            @PathVariable UUID attemptId,
            Authentication auth) {
        ProctoringSummaryDTO summary = attemptService.getProctoringSummary(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Proctoring summary retrieved successfully", summary));
    }

    @GetMapping("/{attemptId}/proctoring/violations")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get violation details", description = "Get detailed violation logs")
    public ResponseEntity<ApiResponse<List<ViolationDetailDTO>>> getViolations(
            @PathVariable UUID attemptId,
            Authentication auth) {
        List<ViolationDetailDTO> violations = attemptService.getViolations(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Violations retrieved successfully", violations));
    }

    @GetMapping("/{attemptId}/proctoring/timeline")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get proctoring timeline", description = "Get chronological timeline of events")
    public ResponseEntity<ApiResponse<List<ProctoringEventDTO>>> getProctoringTimeline(
            @PathVariable UUID attemptId,
            Authentication auth) {
        List<ProctoringEventDTO> timeline = attemptService.getProctoringTimeline(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Proctoring timeline retrieved successfully", timeline));
    }

    // ==================== Statistics & Analytics ====================

    @GetMapping("/exam/{examId}/analytics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam attempt analytics", description = "Analytics across all attempts for exam")
    public ResponseEntity<ApiResponse<AttemptAnalyticsDTO>> getExamAttemptAnalytics(
            @PathVariable UUID examId,
            Authentication auth) {
        AttemptAnalyticsDTO analytics = attemptService.getExamAttemptAnalytics(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Exam attempt analytics retrieved successfully", analytics));
    }

    @GetMapping("/{attemptId}/time-breakdown")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    @Operation(summary = "Get time breakdown", description = "Time spent per question/section")
    public ResponseEntity<ApiResponse<TimeBreakdownDTO>> getTimeBreakdown(
            @PathVariable UUID attemptId,
            Authentication auth) {
        TimeBreakdownDTO breakdown = attemptService.getTimeBreakdown(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Time breakdown retrieved successfully", breakdown));
    }

    @GetMapping("/exam/{examId}/completion-stats")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get completion statistics", description = "Stats on completed vs abandoned attempts")
    public ResponseEntity<ApiResponse<CompletionStatsDTO>> getCompletionStats(
            @PathVariable UUID examId,
            Authentication auth) {
        CompletionStatsDTO stats = attemptService.getCompletionStats(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Completion stats retrieved successfully", stats));
    }

    @GetMapping("/exam/{examId}/average-time")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get average completion time", description = "Average time taken to complete exam")
    public ResponseEntity<ApiResponse<Double>> getAverageCompletionTime(
            @PathVariable UUID examId,
            Authentication auth) {
        Double avgTime = attemptService.getAverageCompletionTime(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Average completion time retrieved successfully", avgTime));
    }

    // ==================== Validation & Checks ====================

    @GetMapping("/exam/{examId}/can-start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Check if can start exam", description = "Validate if student can start new attempt")
    public ResponseEntity<ApiResponse<CanStartAttemptDTO>> canStartAttempt(
            @PathVariable UUID examId,
            Authentication auth) {
        CanStartAttemptDTO canStart = attemptService.canStartAttempt(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Can start attempt check completed successfully", canStart));
    }

    @GetMapping("/{attemptId}/can-submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Check if can submit", description = "Validate if attempt can be submitted")
    public ResponseEntity<ApiResponse<CanSubmitDTO>> canSubmit(
            @PathVariable UUID attemptId,
            Authentication auth) {
        CanSubmitDTO canSubmit = attemptService.canSubmit(attemptId, auth);
        return ResponseEntity.ok(ApiResponse.success("Can submit check completed successfully", canSubmit));
    }

    @GetMapping("/exam/{examId}/remaining-attempts")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get remaining attempts", description = "Get number of remaining attempts allowed")
    public ResponseEntity<ApiResponse<Integer>> getRemainingAttempts(
            @PathVariable UUID examId,
            Authentication auth) {
        Integer remaining = attemptService.getRemainingAttempts(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Remaining attempts retrieved successfully", remaining));
    }

    // ==================== Suspicious Activity ====================

    @GetMapping("/suspicious")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get suspicious attempts", description = "Get all attempts with suspicious activity")
    public ResponseEntity<ApiResponse<Page<AttemptSummary>>> getSuspiciousAttempts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        Page<AttemptSummary> attempts = attemptService.getSuspiciousAttempts(PageRequest.of(page, size), auth);
        return ResponseEntity.ok(ApiResponse.success("Suspicious attempts retrieved successfully", attempts));
    }

    @GetMapping("/exam/{examId}/suspicious")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get suspicious attempts for exam", description = "Suspicious attempts for specific exam")
    public ResponseEntity<ApiResponse<List<AttemptSummary>>> getSuspiciousExamAttempts(
            @PathVariable UUID examId,
            Authentication auth) {
        List<AttemptSummary> attempts = attemptService.getSuspiciousExamAttempts(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Suspicious exam attempts retrieved successfully", attempts));
    }

    @PostMapping("/{attemptId}/flag-suspicious")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Flag attempt as suspicious", description = "Manually flag attempt for review")
    public ResponseEntity<ApiResponse<Void>> flagAsSuspicious(
            @PathVariable UUID attemptId,
            @RequestBody FlagSuspiciousRequest request,
            Authentication auth) {
        attemptService.flagAsSuspicious(attemptId, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Attempt flagged as suspicious successfully", null));
    }

    // ==================== Search & Filtering ====================

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Search attempts", description = "Advanced search with filters")
    public ResponseEntity<ApiResponse<Page<AttemptSummary>>> searchAttempts(
            @RequestParam(required = false) UUID examId,
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean suspicious,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        Page<AttemptSummary> attempts = attemptService.searchAttempts(
                examId, studentId, status, suspicious, startDate, endDate, 
                PageRequest.of(page, size), auth);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", attempts));
    }

    // ==================== Bulk Operations ====================

    @PostMapping("/bulk/submit")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk submit attempts", description = "Force submit multiple attempts")
    public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkSubmit(
            @RequestBody List<UUID> attemptIds,
            Authentication auth) {
        BulkOperationResultDTO result = attemptService.bulkSubmit(attemptIds, auth);
        return ResponseEntity.ok(ApiResponse.success("Bulk submission completed successfully", result));
    }

    @DeleteMapping("/bulk/delete")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk delete attempts", description = "Delete multiple attempts")
    public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkDelete(
            @RequestBody List<UUID> attemptIds,
            Authentication auth) {
        BulkOperationResultDTO result = attemptService.bulkDelete(attemptIds, auth);
        return ResponseEntity.ok(ApiResponse.success("Bulk deletion completed successfully", result));
    }

    // ==================== Health Check ====================

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if attempt service is running")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Attempt service is running", "OK"));
    }
}

package com.oerms.result.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.result.dto.*;
import com.oerms.result.enums.ResultStatus;
import com.oerms.result.service.ResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
@Tag(name = "Result Management", description = "APIs for managing exam results")
public class ResultController {

    private final ResultService resultService;

    // ==================== Student Operations ====================

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get result by ID", description = "Retrieves a single result (students can only see published results)")
    public ResponseEntity<ApiResponse<ResultDTO>> getResult(
            @Parameter(description = "Result ID") @PathVariable UUID id,
            Authentication auth) {
        ResultDTO result = resultService.getResult(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Result retrieved successfully", result));
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get result details", description = "Retrieves detailed result including questions and answers")
    public ResponseEntity<ApiResponse<ResultDetailsResponse>> getResultDetails(
            @Parameter(description = "Result ID") @PathVariable UUID id,
            Authentication auth) {
        ResultDetailsResponse result = resultService.getResultDetails(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Result details retrieved successfully", result));
    }

    @GetMapping("/attempt/{attemptId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get result by Attempt ID", description = "Retrieves a single result by attempt ID")
    public ResponseEntity<ApiResponse<ResultDTO>> getResultByAttemptId(
            @Parameter(description = "Attempt ID") @PathVariable UUID attemptId) {
        ResultDTO result = resultService.getResultByAttemptId(attemptId);
        return ResponseEntity.ok(ApiResponse.success("Result retrieved successfully", result));
    }

    @GetMapping("/my-results")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my results", description = "Retrieves all published results for the current student")
    public ResponseEntity<ApiResponse<Page<ResultSummaryDTO>>> getMyResults(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication auth) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<ResultSummaryDTO> results = resultService.getMyResults(
                PageRequest.of(page, size, sort), auth);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @GetMapping("/my-results/exam/{examId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my results for exam", description = "Retrieves student's results for a specific exam")
    public ResponseEntity<ApiResponse<Page<ResultSummaryDTO>>> getMyExamResults(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {

        Page<ResultSummaryDTO> results = resultService.getMyExamResults(
                examId, PageRequest.of(page, size, Sort.by("publishedAt").descending()), auth);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @GetMapping("/my-statistics")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my statistics", description = "Retrieves statistics for the current student")
    public ResponseEntity<ApiResponse<StudentStatisticsDTO>> getMyStatistics(Authentication auth) {
        UUID studentId = com.oerms.common.util.JwtUtils.getUserId(auth);
        StudentStatisticsDTO statistics = resultService.getStudentStatistics(studentId, auth);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", statistics));
    }

    // ==================== Teacher/Admin Operations ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get all results", description = "Retrieves all results with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<ResultSummaryDTO>>> getAllResults(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication auth) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<ResultSummaryDTO> results = resultService.getAllResults(
                PageRequest.of(page, size, sort), auth);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @GetMapping("/bulk")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get multiple results by IDs", description = "Retrieves multiple results by their IDs")
    public ResponseEntity<ApiResponse<List<ResultDTO>>> getResultsByIds(
            @RequestParam List<UUID> ids,
            Authentication auth) {
        List<ResultDTO> results = resultService.getResultsByIds(ids, auth);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get results by status", description = "Retrieves all results with a specific status")
    public ResponseEntity<ApiResponse<Page<ResultSummaryDTO>>> getResultsByStatus(
            @Parameter(description = "Result Status") @PathVariable ResultStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication auth) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<ResultSummaryDTO> results = resultService.getResultsByStatus(
                status, PageRequest.of(page, size, sort), auth);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Search and filter results", description = "Search results with multiple filter criteria")
    public ResponseEntity<ApiResponse<Page<ResultSummaryDTO>>> searchResults(
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) UUID examId,
            @RequestParam(required = false) ResultStatus status,
            @RequestParam(required = false) Boolean passed,
            @RequestParam(required = false) Double minPercentage,
            @RequestParam(required = false) Double maxPercentage,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication auth) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        ResultSearchCriteria criteria = ResultSearchCriteria.builder()
                .studentName(studentName)
                .examId(examId)
                .status(status)
                .passed(passed)
                .minPercentage(minPercentage)
                .maxPercentage(maxPercentage)
                .build();

        Page<ResultSummaryDTO> results = resultService.searchResults(
                criteria, PageRequest.of(page, size, sort), auth);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get results within date range", description = "Retrieves results submitted within a date range")
    public ResponseEntity<ApiResponse<Page<ResultSummaryDTO>>> getResultsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication auth) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<ResultSummaryDTO> results = resultService.getResultsByDateRange(
                startDate, endDate, PageRequest.of(page, size, sort), auth);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get recently submitted/graded results", description = "Retrieves recent results based on activity type")
    public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getRecentResults(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "SUBMITTED") String activityType,
            Authentication auth) {
        List<ResultSummaryDTO> results = resultService.getRecentResults(limit, activityType, auth);
        return ResponseEntity.ok(ApiResponse.success("Recent results retrieved successfully", results));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Publish result", description = "Publishes a result to make it visible to the student")
    public ResponseEntity<ApiResponse<ResultDTO>> publishResult(
            @Parameter(description = "Result ID") @PathVariable UUID id,
            @Valid @RequestBody PublishResultRequest request,
            Authentication auth) {
        ResultDTO result = resultService.publishResult(id, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Result published successfully", result));
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Unpublish result", description = "Unpublishes a result")
    public ResponseEntity<ApiResponse<ResultDTO>> unpublishResult(
            @Parameter(description = "Result ID") @PathVariable UUID id,
            Authentication auth) {
        ResultDTO result = resultService.unpublishResult(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Result unpublished successfully", result));
    }

    @PostMapping("/{id}/grade")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Grade result", description = "Manually grades a result (for subjective questions)")
    public ResponseEntity<ApiResponse<ResultDTO>> gradeResult(
            @Parameter(description = "Result ID") @PathVariable UUID id,
            @Valid @RequestBody GradeResultRequest request,
            Authentication auth) {
        ResultDTO result = resultService.gradeResult(id, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Result graded successfully", result));
    }

    // ==================== Exam Results ====================

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam results", description = "Retrieves all results for a specific exam")
    public ResponseEntity<ApiResponse<Page<ResultSummaryDTO>>> getExamResults(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication auth) {

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<ResultSummaryDTO> results = resultService.getExamResults(
                examId, PageRequest.of(page, size, sort), auth);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @GetMapping("/exam/{examId}/student/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get specific student's results for an exam", description = "Retrieves a student's results for a specific exam")
    public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getStudentExamResults(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            @Parameter(description = "Student ID") @PathVariable UUID studentId,
            Authentication auth) {
        List<ResultSummaryDTO> results = resultService.getStudentExamResults(examId, studentId, auth);
        return ResponseEntity.ok(ApiResponse.success("Results retrieved successfully", results));
    }

    @GetMapping("/exam/{examId}/statistics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam statistics", description = "Retrieves detailed statistics for an exam")
    public ResponseEntity<ApiResponse<ExamResultStatisticsDTO>> getExamStatistics(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication auth) {
        ExamResultStatisticsDTO statistics = resultService.getExamStatistics(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", statistics));
    }

    @GetMapping("/exam/{examId}/grade-distribution")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get detailed grade distribution", description = "Retrieves grade distribution for an exam")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getGradeDistribution(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication auth) {
        Map<String, Long> distribution = resultService.getGradeDistribution(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Grade distribution retrieved successfully", distribution));
    }

    @GetMapping("/exam/{examId}/publication-status")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get publication status summary for exam", description = "Retrieves count of published vs unpublished results")
    public ResponseEntity<ApiResponse<PublicationStatusDTO>> getPublicationStatus(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication auth) {
        PublicationStatusDTO status = resultService.getPublicationStatus(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Publication status retrieved successfully", status));
    }

    @GetMapping("/exam/{examId}/top-scorers")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get top scorers", description = "Retrieves top scorers for an exam")
    public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getTopScorers(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            @RequestParam(defaultValue = "10") int limit,
            Authentication auth) {
        List<ResultSummaryDTO> topScorers = resultService.getTopScorers(examId, limit, auth);
        return ResponseEntity.ok(ApiResponse.success("Top scorers retrieved successfully", topScorers));
    }

    @GetMapping("/exam/{examId}/low-performers")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get students who need attention", description = "Retrieves low-performing students for intervention")
    public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getLowPerformers(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            @RequestParam(defaultValue = "40.0") double thresholdPercentage,
            Authentication auth) {
        List<ResultSummaryDTO> results = resultService.getLowPerformers(examId, thresholdPercentage, auth);
        return ResponseEntity.ok(ApiResponse.success("Low performers retrieved successfully", results));
    }

    @PostMapping("/exam/{examId}/calculate-rankings")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Calculate rankings", description = "Calculates rankings for all published results in an exam")
    public ResponseEntity<ApiResponse<Void>> calculateRankings(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication auth) {
        resultService.calculateRankings(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Rankings calculated successfully", null));
    }

    // ==================== Grading Operations ====================

    @GetMapping("/pending-grading")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get pending grading", description = "Retrieves all results requiring manual grading")
    public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getPendingGradingResults(Authentication auth) {
        List<ResultSummaryDTO> results = resultService.getPendingGradingResults(auth);
        return ResponseEntity.ok(ApiResponse.success("Pending results retrieved successfully", results));
    }

    @GetMapping("/exam/{examId}/pending-grading")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get pending grading by exam", description = "Retrieves results requiring grading for a specific exam")
    public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getPendingGradingByExam(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication auth) {
        List<ResultSummaryDTO> results = resultService.getPendingGradingByExam(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Pending results retrieved successfully", results));
    }

    // ==================== Suspicious Results ====================

    @GetMapping("/suspicious")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get suspicious results", description = "Retrieves all results with suspicious activity")
    public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getSuspiciousResults(Authentication auth) {
        List<ResultSummaryDTO> results = resultService.getSuspiciousResults(auth);
        return ResponseEntity.ok(ApiResponse.success("Suspicious results retrieved successfully", results));
    }

    @GetMapping("/exam/{examId}/suspicious")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get suspicious results by exam", description = "Retrieves suspicious results for a specific exam")
    public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getSuspiciousResultsByExam(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication auth) {
        List<ResultSummaryDTO> results = resultService.getSuspiciousResultsByExam(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Suspicious results retrieved successfully", results));
    }

    // ==================== Student Statistics ====================

    @GetMapping("/student/{studentId}/statistics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get student statistics", description = "Retrieves statistics for a specific student")
    public ResponseEntity<ApiResponse<StudentStatisticsDTO>> getStudentStatistics(
            @Parameter(description = "Student ID") @PathVariable UUID studentId,
            Authentication auth) {
        StudentStatisticsDTO statistics = resultService.getStudentStatistics(studentId, auth);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", statistics));
    }

    @GetMapping("/student/{studentId}/trend")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get student performance trend over time", description = "Retrieves performance trend for a student")
    public ResponseEntity<ApiResponse<PerformanceTrendDTO>> getStudentPerformanceTrend(
            @Parameter(description = "Student ID") @PathVariable UUID studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication auth) {
        PerformanceTrendDTO trend = resultService.getStudentPerformanceTrend(studentId, startDate, endDate, auth);
        return ResponseEntity.ok(ApiResponse.success("Performance trend retrieved successfully", trend));
    }

    // ==================== Admin Operations ====================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete result", description = "Deletes a result (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteResult(
            @Parameter(description = "Result ID") @PathVariable UUID id,
            Authentication auth) {
        resultService.deleteResult(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Result deleted successfully", null));
    }

    // ==================== Health Check ====================

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if result service is running")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Result service is running", "OK"));
    }
}


// Continuation of ResultController - Add these endpoints to Part 1

    // ==================== Result Analytics & Insights ====================

    @GetMapping("/{id}/insights")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get result insights", description = "AI-generated insights and recommendations")
    public ResponseEntity<ApiResponse<ResultInsightsDTO>> getResultInsights(
            @PathVariable UUID id,
            Authentication auth) {
        ResultInsightsDTO insights = resultService.getResultInsights(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Result insights retrieved successfully", insights));
    }

    @GetMapping("/{id}/strengths-weaknesses")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get strengths and weaknesses", description = "Analysis of strong and weak areas")
    public ResponseEntity<ApiResponse<StrengthWeaknessDTO>> getStrengthsWeaknesses(
            @PathVariable UUID id,
            Authentication auth) {
        StrengthWeaknessDTO analysis = resultService.getStrengthsWeaknesses(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Strengths and weaknesses retrieved successfully", analysis));
    }

    @GetMapping("/{id}/question-analysis")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get question-wise analysis", description = "Detailed analysis of each question")
    public ResponseEntity<ApiResponse<List<QuestionAnalysisDTO>>> getQuestionAnalysis(
            @PathVariable UUID id,
            Authentication auth) {
        List<QuestionAnalysisDTO> analysis = resultService.getQuestionAnalysis(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Question analysis retrieved successfully", analysis));
    }

    @GetMapping("/{id}/time-efficiency")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get time efficiency analysis", description = "Analysis of time management")
    public ResponseEntity<ApiResponse<TimeEfficiencyDTO>> getTimeEfficiency(
            @PathVariable UUID id,
            Authentication auth) {
        TimeEfficiencyDTO efficiency = resultService.getTimeEfficiency(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Time efficiency analysis retrieved successfully", efficiency));
    }

    // ==================== Comparison & Benchmarking ====================

    @GetMapping("/{id}/compare-with-average")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Compare with class average", description = "Compare result with class performance")
    public ResponseEntity<ApiResponse<ComparisonDTO>> compareWithAverage(
            @PathVariable UUID id,
            Authentication auth) {
        ComparisonDTO comparison = resultService.compareWithAverage(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Comparison with average retrieved successfully", comparison));
    }

    @GetMapping("/{id}/percentile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get percentile rank", description = "Get percentile ranking in exam")
    public ResponseEntity<ApiResponse<PercentileDTO>> getPercentile(
            @PathVariable UUID id,
            Authentication auth) {
        PercentileDTO percentile = resultService.getPercentile(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Percentile rank retrieved successfully", percentile));
    }

    @GetMapping("/my-results/compare")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Compare my results", description = "Compare multiple results side-by-side")
    public ResponseEntity<ApiResponse<MultiResultComparisonDTO>> compareMyResults(
            @RequestParam List<UUID> resultIds,
            Authentication auth) {
        MultiResultComparisonDTO comparison = resultService.compareMyResults(resultIds, auth);
        return ResponseEntity.ok(ApiResponse.success("Results comparison retrieved successfully", comparison));
    }

    // ==================== Performance Tracking ====================

    @GetMapping("/my-progress")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my progress over time", description = "Track performance improvement")
    public ResponseEntity<ApiResponse<ProgressTrackingDTO>> getMyProgress(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            Authentication auth) {
        ProgressTrackingDTO progress = resultService.getMyProgress(subject, since, auth);
        return ResponseEntity.ok(ApiResponse.success("Progress tracking retrieved successfully", progress));
    }

    @GetMapping("/my-subject-performance")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get subject-wise performance", description = "Performance breakdown by subject")
    public ResponseEntity<ApiResponse<Map<String, SubjectPerformanceDTO>>> getSubjectPerformance(
            Authentication auth) {
        Map<String, SubjectPerformanceDTO> performance = resultService.getSubjectPerformance(auth);
        return ResponseEntity.ok(ApiResponse.success("Subject performance retrieved successfully", performance));
    }

    @GetMapping("/my-improvement-areas")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get improvement areas", description = "Identify areas needing improvement")
    public ResponseEntity<ApiResponse<List<ImprovementAreaDTO>>> getImprovementAreas(
            Authentication auth) {
        List<ImprovementAreaDTO> areas = resultService.getImprovementAreas(auth);
        return ResponseEntity.ok(ApiResponse.success("Improvement areas retrieved successfully", areas));
    }

    // ==================== Exam-Level Analytics ====================

    @GetMapping("/exam/{examId}/analytics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Detailed exam analytics", description = "Comprehensive analytics for exam performance")
    public ResponseEntity<ApiResponse<ExamAnalyticsDTO>> getExamAnalytics(
            @PathVariable UUID examId,
            Authentication auth) {
        ExamAnalyticsDTO analytics = resultService.getExamAnalytics(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Exam analytics retrieved successfully", analytics));
    }

    @GetMapping("/exam/{examId}/participation")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get participation metrics", description = "Detailed participation statistics")
    public ResponseEntity<ApiResponse<ParticipationMetricsDTO>> getParticipationMetrics(
            @PathVariable UUID examId,
            Authentication auth) {
        ParticipationMetricsDTO metrics = resultService.getParticipationMetrics(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Participation metrics retrieved successfully", metrics));
    }

    @GetMapping("/exam/{examId}/performance-distribution")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get score distribution", description = "Score distribution and percentile data")
    public ResponseEntity<ApiResponse<ScoreDistributionDTO>> getScoreDistribution(
            @PathVariable UUID examId,
            Authentication auth) {
        ScoreDistributionDTO distribution = resultService.getScoreDistribution(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Score distribution retrieved successfully", distribution));
    }

    @GetMapping("/exam/{examId}/time-analysis")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get time analysis", description = "Analysis of time taken by students")
    public ResponseEntity<ApiResponse<TimeAnalysisDTO>> getTimeAnalysis(
            @PathVariable UUID examId,
            Authentication auth) {
        TimeAnalysisDTO analysis = resultService.getTimeAnalysis(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Time analysis retrieved successfully", analysis));
    }

    @GetMapping("/exam/{examId}/question-performance")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get question-wise performance", description = "Performance analysis per question")
    public ResponseEntity<ApiResponse<List<QuestionPerformanceDTO>>> getQuestionPerformance(
            @PathVariable UUID examId,
            Authentication auth) {
        List<QuestionPerformanceDTO> performance = resultService.getQuestionPerformance(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Question performance retrieved successfully", performance));
    }

    @GetMapping("/exam/{examId}/compare")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Compare exams", description = "Compare this exam with others")
    public ResponseEntity<ApiResponse<ExamComparisonDTO>> compareExams(
            @PathVariable UUID examId,
            @RequestParam List<UUID> compareWithIds,
            Authentication auth) {
        ExamComparisonDTO comparison = resultService.compareExams(examId, compareWithIds, auth);
        return ResponseEntity.ok(ApiResponse.success("Exam comparison retrieved successfully", comparison));
    }

    @GetMapping("/subject/{subject}/analytics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Subject-wise analytics", description = "Analytics across all exams in subject")
    public ResponseEntity<ApiResponse<SubjectAnalyticsDTO>> getSubjectAnalytics(
            @PathVariable String subject,
            Authentication auth) {
        SubjectAnalyticsDTO analytics = resultService.getSubjectAnalytics(subject, auth);
        return ResponseEntity.ok(ApiResponse.success("Subject analytics retrieved successfully", analytics));
    }

    @GetMapping("/exam/{examId}/performance-matrix")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get performance matrix", description = "Comprehensive performance matrix")
    public ResponseEntity<ApiResponse<PerformanceMatrixDTO>> getPerformanceMatrix(
            @PathVariable UUID examId,
            Authentication auth) {
        PerformanceMatrixDTO matrix = resultService.getPerformanceMatrix(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Performance matrix retrieved successfully", matrix));
    }

    @GetMapping("/exam/{examId}/difficulty-validation")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Validate question difficulty", description = "Validate if difficulty levels are accurate")
    public ResponseEntity<ApiResponse<DifficultyValidationDTO>> validateDifficulty(
            @PathVariable UUID examId,
            Authentication auth) {
        DifficultyValidationDTO validation = resultService.validateDifficulty(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Difficulty validation retrieved successfully", validation));
    }

    @GetMapping("/exam/{examId}/item-analysis")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get item analysis", description = "Psychometric item analysis for questions")
    public ResponseEntity<ApiResponse<ItemAnalysisDTO>> getItemAnalysis(
            @PathVariable UUID examId,
            Authentication auth) {
        ItemAnalysisDTO analysis = resultService.getItemAnalysis(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Item analysis retrieved successfully", analysis));
    }

    @GetMapping("/exam/{examId}/discrimination-index")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get discrimination index", description = "Measure question effectiveness")
    public ResponseEntity<ApiResponse<List<DiscriminationIndexDTO>>> getDiscriminationIndex(
            @PathVariable UUID examId,
            Authentication auth) {
        List<DiscriminationIndexDTO> indices = resultService.getDiscriminationIndex(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Discrimination index retrieved successfully", indices));
    }

    @GetMapping("/exam/{examId}/reliability-score")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam reliability", description = "Calculate exam reliability coefficient")
    public ResponseEntity<ApiResponse<Double>> getReliabilityScore(
            @PathVariable UUID examId,
            Authentication auth) {
        Double reliability = resultService.getReliabilityScore(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Reliability score retrieved successfully", reliability));
    }

    // ==================== Student Performance Tracking ====================

    @GetMapping("/student/{studentId}/performance-report")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get comprehensive student report", description = "Detailed performance report")
    public ResponseEntity<ApiResponse<StudentPerformanceReportDTO>> getStudentPerformanceReport(
            @PathVariable UUID studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication auth) {
        StudentPerformanceReportDTO report = resultService.getStudentPerformanceReport(
                studentId, startDate, endDate, auth);
        return ResponseEntity.ok(ApiResponse.success("Student performance report retrieved successfully", report));
    }

    @GetMapping("/student/{studentId}/subject/{subject}/performance")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get subject-specific performance", description = "Student performance in specific subject")
    public ResponseEntity<ApiResponse<SubjectPerformanceDTO>> getStudentSubjectPerformance(
            @PathVariable UUID studentId,
            @PathVariable String subject,
            Authentication auth) {
        SubjectPerformanceDTO performance = resultService.getStudentSubjectPerformance(
                studentId, subject, auth);
        return ResponseEntity.ok(ApiResponse.success("Student subject performance retrieved successfully", performance));
    }

    @GetMapping("/student/{studentId}/consistency-score")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get consistency score", description = "Measure performance consistency")
    public ResponseEntity<ApiResponse<Double>> getConsistencyScore(
            @PathVariable UUID studentId,
            Authentication auth) {
        Double score = resultService.getConsistencyScore(studentId, auth);
        return ResponseEntity.ok(ApiResponse.success("Consistency score retrieved successfully", score));
    }

    // ==================== Grading Assistance ====================

    @GetMapping("/pending-grading/prioritized")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get prioritized pending results", description = "Pending results sorted by priority")
    public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getPrioritizedPendingResults(
            @RequestParam(defaultValue = "SUBMISSION_TIME") String priorityBy,
            Authentication auth) {
        List<ResultSummaryDTO> results = resultService.getPrioritizedPendingResults(priorityBy, auth);
        return ResponseEntity.ok(ApiResponse.success("Prioritized pending results retrieved successfully", results));
    }

    @PostMapping("/bulk/grade")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Bulk grade results", description = "Grade multiple results at once")
    public ResponseEntity<ApiResponse<BulkGradingResultDTO>> bulkGrade(
            @RequestBody BulkGradingRequest request,
            Authentication auth) {
        BulkGradingResultDTO result = resultService.bulkGrade(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Bulk grading completed successfully", result));
    }

    @PostMapping("/bulk/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Bulk publish results", description = "Publish multiple results at once")
    public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkPublish(
            @RequestBody BulkPublishRequest request,
            Authentication auth) {
        BulkOperationResultDTO result = resultService.bulkPublish(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Bulk publishing completed successfully", result));
    }

    @GetMapping("/{id}/grading-suggestions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get AI grading suggestions", description = "AI-powered grading suggestions")
    public ResponseEntity<ApiResponse<GradingSuggestionsDTO>> getGradingSuggestions(
            @PathVariable UUID id,
            Authentication auth) {
        GradingSuggestionsDTO suggestions = resultService.getGradingSuggestions(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Grading suggestions retrieved successfully", suggestions));
    }

    // ==================== Export & Reporting ====================

    @GetMapping("/exam/{examId}/report/summary")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Generate summary report", description = "Generate concise summary report")
    public ResponseEntity<ApiResponse<SummaryReportDTO>> generateSummaryReport(
            @PathVariable UUID examId,
            Authentication auth) {
        SummaryReportDTO report = resultService.generateSummaryReport(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Summary report generated successfully", report));
    }

    @GetMapping("/exam/{examId}/export")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Export exam results", description = "Export all results for exam")
    public ResponseEntity<byte[]> exportExamResults(
            @PathVariable UUID examId,
            @RequestParam(defaultValue = "EXCEL") ExportFormat format,
            @RequestParam(required = false) Boolean includeDetails,
            Authentication auth) {
        byte[] exportData = resultService.exportExamResults(examId, format, includeDetails, auth);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "exam-results." + format.name().toLowerCase());
        
        return new ResponseEntity<>(exportData, headers, HttpStatus.OK);
    }

    @GetMapping("/student/{studentId}/export")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Export student results", description = "Export all results for student")
    public ResponseEntity<byte[]> exportStudentResults(
            @PathVariable UUID studentId,
            @RequestParam(defaultValue = "PDF") ExportFormat format,
            Authentication auth) {
        byte[] exportData = resultService.exportStudentResults(studentId, format, auth);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "student-results." + format.name().toLowerCase());
        
        return new ResponseEntity<>(exportData, headers, HttpStatus.OK);
    }

    @GetMapping("/{id}/certificate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Generate certificate", description = "Generate certificate for passing result")
    public ResponseEntity<byte[]> generateCertificate(
            @PathVariable UUID id,
            Authentication auth) {
        byte[] certificate = resultService.generateCertificate(id, auth);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "certificate.pdf");
        
        return new ResponseEntity<>(certificate, headers, HttpStatus.OK);
    }

    @GetMapping("/exam/{examId}/report/detailed")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Generate detailed exam report", description = "Comprehensive exam analysis report")
    public ResponseEntity<ApiResponse<DetailedExamReportDTO>> generateDetailedReport(
            @PathVariable UUID examId,
            Authentication auth) {
        DetailedExamReportDTO report = resultService.generateDetailedReport(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Detailed report generated successfully", report));
    }

    // ==================== Notifications ====================

    @PostMapping("/{id}/notify-student")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Notify student about result", description = "Send notification to student")
    public ResponseEntity<ApiResponse<Void>> notifyStudent(
            @PathVariable UUID id,
            @RequestBody(required = false) NotificationRequest request,
            Authentication auth) {
        resultService.notifyStudent(id, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Student notified successfully", null));
    }

    @PostMapping("/exam/{examId}/notify-all")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Notify all students", description = "Send result notifications to all students")
    public ResponseEntity<ApiResponse<NotificationResultDTO>> notifyAllStudents(
            @PathVariable UUID examId,
            Authentication auth) {
        NotificationResultDTO result = resultService.notifyAllStudents(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("All students notified successfully", result));
    }

    // ==================== System Analytics ====================

    @GetMapping("/system/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get system-wide analytics", description = "Overall system performance metrics")
    public ResponseEntity<ApiResponse<SystemAnalyticsDTO>> getSystemAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        SystemAnalyticsDTO analytics = resultService.getSystemAnalytics(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("System analytics retrieved successfully", analytics));
    }

    @GetMapping("/system/trends")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get system trends", description = "Trending patterns in results")
    public ResponseEntity<ApiResponse<TrendAnalysisDTO>> getSystemTrends() {
        TrendAnalysisDTO trends = resultService.getSystemTrends();
        return ResponseEntity.ok(ApiResponse.success("System trends retrieved successfully", trends));
    }

    