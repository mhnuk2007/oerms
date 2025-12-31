# EXAM SERVICE - Additional Endpoints Needed

## Critical Missing Endpoints

### Exam Availability & Eligibility

```java
@GetMapping("/{id}/availability")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Check exam availability", description = "Check if exam is available for student to take")
public ResponseEntity<ApiResponse<ExamAvailabilityDTO>> checkExamAvailability(
    @PathVariable UUID id,
    Authentication auth) {
    // Returns: canTake, reason, remainingAttempts, nextAvailableTime, prerequisites
}

@GetMapping("/available-for-me")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get my available exams", description = "Get all exams student can currently take")
public ResponseEntity<ApiResponse<Page<ExamDTO>>> getMyAvailableExams(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    Authentication auth) {
    // Returns exams filtered by: published, active, within date range, attempts left, prerequisites met
}

@GetMapping("/{id}/prerequisites")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get exam prerequisites", description = "Check prerequisite exams and their completion status")
public ResponseEntity<ApiResponse<PrerequisiteCheckDTO>> checkPrerequisites(
    @PathVariable UUID id,
    Authentication auth) {
    // Returns: required exams, completion status, blocking reasons
}
```

### Advanced Search & Filtering

```java
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
    Authentication auth);

@GetMapping("/upcoming")
@Operation(summary = "Get upcoming exams", description = "Get scheduled exams starting soon")
public ResponseEntity<ApiResponse<List<ExamDTO>>> getUpcomingExams(
    @RequestParam(defaultValue = "7") int daysAhead,
    Authentication auth);

@GetMapping("/ending-soon")
@Operation(summary = "Get exams ending soon", description = "Get exams with approaching deadlines")
public ResponseEntity<ApiResponse<List<ExamDTO>>> getExamsEndingSoon(
    @RequestParam(defaultValue = "24") int hoursAhead,
    Authentication auth);

@GetMapping("/by-subject")
@Operation(summary = "Get exams by subject", description = "Get all exams for a specific subject")
public ResponseEntity<ApiResponse<Page<ExamDTO>>> getExamsBySubject(
    @RequestParam String subject,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    Authentication auth);
```

### Exam Duplication & Templates

```java
@PostMapping("/{id}/duplicate")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Duplicate exam", description = "Create a copy of existing exam with questions")
public ResponseEntity<ApiResponse<ExamDTO>> duplicateExam(
    @PathVariable UUID id,
    @RequestBody(required = false) DuplicateExamRequest request,
    Authentication auth) {
    // Options: includeQuestions, newTitle, newStartTime, newEndTime
}

@PostMapping("/{id}/create-template")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Create exam template", description = "Save exam as reusable template")
public ResponseEntity<ApiResponse<ExamTemplateDTO>> createTemplate(
    @PathVariable UUID id,
    @RequestBody CreateTemplateRequest request,
    Authentication auth);

@GetMapping("/templates")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get exam templates", description = "Get all available exam templates")
public ResponseEntity<ApiResponse<Page<ExamTemplateDTO>>> getTemplates(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    Authentication auth);

@PostMapping("/from-template/{templateId}")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Create exam from template", description = "Create new exam using template")
public ResponseEntity<ApiResponse<ExamDTO>> createFromTemplate(
    @PathVariable UUID templateId,
    @RequestBody CreateFromTemplateRequest request,
    Authentication auth);
```

### Exam Scheduling & Management

```java
@PutMapping("/{id}/schedule")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Update exam schedule", description = "Modify exam start/end times")
public ResponseEntity<ApiResponse<ExamDTO>> updateSchedule(
    @PathVariable UUID id,
    @RequestBody UpdateScheduleRequest request,
    Authentication auth);

@PostMapping("/{id}/extend-deadline")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Extend exam deadline", description = "Extend end time for exam")
public ResponseEntity<ApiResponse<ExamDTO>> extendDeadline(
    @PathVariable UUID id,
    @RequestBody ExtendDeadlineRequest request,
    Authentication auth);

@PutMapping("/{id}/duration")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Update exam duration", description = "Change exam duration for ongoing exam")
public ResponseEntity<ApiResponse<ExamDTO>> updateDuration(
    @PathVariable UUID id,
    @RequestParam Integer newDuration,
    Authentication auth);
```

### Bulk Operations

```java
@PostMapping("/bulk/publish")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Bulk publish exams", description = "Publish multiple exams at once")
public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkPublish(
    @RequestBody BulkOperationRequest request,
    Authentication auth);

@PostMapping("/bulk/archive")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Bulk archive exams", description = "Archive multiple exams at once")
public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkArchive(
    @RequestBody BulkOperationRequest request,
    Authentication auth);

@PostMapping("/bulk/delete")
@PreAuthorize("hasRole('ADMIN')")
@Operation(summary = "Bulk delete exams", description = "Delete multiple draft exams")
public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkDelete(
    @RequestBody BulkOperationRequest request,
    Authentication auth);

@PostMapping("/bulk/update-status")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Bulk update exam status", description = "Update status for multiple exams")
public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkUpdateStatus(
    @RequestBody BulkStatusUpdateRequest request,
    Authentication auth);
```

### Validation & Verification

```java
@GetMapping("/{id}/conflicts")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Check scheduling conflicts", description = "Check for conflicts with other exams")
public ResponseEntity<ApiResponse<List<ExamConflictDTO>>> checkConflicts(
    @PathVariable UUID id,
    Authentication auth);

@GetMapping("/{id}/readiness")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Check exam readiness", description = "Comprehensive readiness checklist")
public ResponseEntity<ApiResponse<ExamReadinessDTO>> checkReadiness(
    @PathVariable UUID id,
    Authentication auth) {
    // Returns: hasQuestions, questionCount, totalMarks, durationSet, scheduledProperly,
    // conflictsExist, warnings, errors, canPublish
}

@PostMapping("/{id}/validate-configuration")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Validate exam configuration", description = "Validate all exam settings")
public ResponseEntity<ApiResponse<ValidationResultDTO>> validateConfiguration(
    @PathVariable UUID id,
    Authentication auth);
```

### Notifications & Reminders

```java
@PostMapping("/{id}/notify-students")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Notify students", description = "Send notification about exam to students")
public ResponseEntity<ApiResponse<NotificationResultDTO>> notifyStudents(
    @PathVariable UUID id,
    @RequestBody NotifyStudentsRequest request,
    Authentication auth);

@GetMapping("/{id}/notification-history")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get notification history", description = "Get history of notifications sent")
public ResponseEntity<ApiResponse<List<NotificationHistoryDTO>>> getNotificationHistory(
    @PathVariable UUID id,
    Authentication auth);
```

# ATTEMPT SERVICE - Additional Endpoints Needed

### Attempt Management

```java
@PostMapping("/{attemptId}/pause")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Pause attempt", description = "Pause exam attempt (if allowed)")
public ResponseEntity<ApiResponse<AttemptResponse>> pauseAttempt(
    @PathVariable UUID attemptId,
    Authentication auth);

@PostMapping("/{attemptId}/resume")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Resume attempt", description = "Resume paused attempt")
public ResponseEntity<ApiResponse<AttemptResponse>> resumeAttempt(
    @PathVariable UUID attemptId,
    Authentication auth);

@GetMapping("/{attemptId}/status")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get attempt status", description = "Get current status and remaining time")
public ResponseEntity<ApiResponse<AttemptStatusDTO>> getAttemptStatus(
    @PathVariable UUID attemptId,
    Authentication auth);

@GetMapping("/{attemptId}/progress")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get attempt progress", description = "Get progress details (answered/unanswered)")
public ResponseEntity<ApiResponse<AttemptProgressDTO>> getAttemptProgress(
    @PathVariable UUID attemptId,
    Authentication auth);

@PostMapping("/{attemptId}/save-progress")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Save progress", description = "Auto-save attempt progress")
public ResponseEntity<ApiResponse<Void>> saveProgress(
    @PathVariable UUID attemptId,
    @RequestBody SaveProgressRequest request,
    Authentication auth);
```

### Answer Management

```java
@DeleteMapping("/{attemptId}/answers/{questionId}")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Clear answer", description = "Clear/remove answer for a question")
public ResponseEntity<ApiResponse<Void>> clearAnswer(
    @PathVariable UUID attemptId,
    @PathVariable UUID questionId,
    Authentication auth);

@PostMapping("/{attemptId}/answers/bulk")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Save multiple answers", description = "Save answers for multiple questions at once")
public ResponseEntity<ApiResponse<List<AttemptAnswerResponse>>> saveBulkAnswers(
    @PathVariable UUID attemptId,
    @RequestBody List<SaveAnswerRequest> requests,
    Authentication auth);

@GetMapping("/{attemptId}/answers/{questionId}")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get specific answer", description = "Get answer for a specific question")
public ResponseEntity<ApiResponse<AttemptAnswerResponse>> getAnswer(
    @PathVariable UUID attemptId,
    @PathVariable UUID questionId,
    Authentication auth);

@PostMapping("/{attemptId}/answers/{questionId}/flag")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Flag question for review", description = "Mark question for later review")
public ResponseEntity<ApiResponse<Void>> flagQuestion(
    @PathVariable UUID attemptId,
    @PathVariable UUID questionId,
    Authentication auth);

@DeleteMapping("/{attemptId}/answers/{questionId}/flag")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Unflag question", description = "Remove review flag from question")
public ResponseEntity<ApiResponse<Void>> unflagQuestion(
    @PathVariable UUID attemptId,
    @PathVariable UUID questionId,
    Authentication auth);

@GetMapping("/{attemptId}/flagged-questions")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get flagged questions", description = "Get all questions marked for review")
public ResponseEntity<ApiResponse<List<UUID>>> getFlaggedQuestions(
    @PathVariable UUID attemptId,
    Authentication auth);
```

### Advanced Proctoring

```java
@PostMapping("/{attemptId}/proctoring/heartbeat")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Send proctoring heartbeat", description = "Regular heartbeat for proctoring")
public ResponseEntity<ApiResponse<Void>> sendHeartbeat(
    @PathVariable UUID attemptId,
    @RequestBody ProctoringHeartbeatRequest request,
    Authentication auth);

@PostMapping("/{attemptId}/proctoring/screenshot")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Upload proctoring screenshot", description = "Upload screenshot for proctoring")
public ResponseEntity<ApiResponse<Void>> uploadScreenshot(
    @PathVariable UUID attemptId,
    @RequestParam MultipartFile screenshot,
    Authentication auth);

@PostMapping("/{attemptId}/proctoring/webcam-frame")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Upload webcam frame", description = "Upload webcam frame for face detection")
public ResponseEntity<ApiResponse<Void>> uploadWebcamFrame(
    @PathVariable UUID attemptId,
    @RequestParam MultipartFile frame,
    Authentication auth);

@GetMapping("/{attemptId}/proctoring/summary")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get proctoring summary", description = "Get summary of all proctoring events")
public ResponseEntity<ApiResponse<ProctoringSummaryDTO>> getProctoringSummary(
    @PathVariable UUID attemptId,
    Authentication auth);

@GetMapping("/{attemptId}/proctoring/violations")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get violation details", description = "Get detailed violation logs")
public ResponseEntity<ApiResponse<List<ViolationDetailDTO>>> getViolations(
    @PathVariable UUID attemptId,
    Authentication auth);

@GetMapping("/{attemptId}/proctoring/timeline")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get proctoring timeline", description = "Get chronological timeline of events")
public ResponseEntity<ApiResponse<List<ProctoringEventDTO>>> getProctoringTimeline(
    @PathVariable UUID attemptId,
    Authentication auth);
```

### Statistics & Analytics

```java
@GetMapping("/exam/{examId}/analytics")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get exam attempt analytics", description = "Analytics across all attempts for exam")
public ResponseEntity<ApiResponse<AttemptAnalyticsDTO>> getExamAttemptAnalytics(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/{attemptId}/time-breakdown")
@PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
@Operation(summary = "Get time breakdown", description = "Time spent per question/section")
public ResponseEntity<ApiResponse<TimeBreakdownDTO>> getTimeBreakdown(
    @PathVariable UUID attemptId,
    Authentication auth);

@GetMapping("/exam/{examId}/completion-stats")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get completion statistics", description = "Stats on completed vs abandoned attempts")
public ResponseEntity<ApiResponse<CompletionStatsDTO>> getCompletionStats(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/average-time")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get average completion time", description = "Average time taken to complete exam")
public ResponseEntity<ApiResponse<Double>> getAverageCompletionTime(
    @PathVariable UUID examId,
    Authentication auth);
```

### Validation & Checks

```java
@GetMapping("/exam/{examId}/can-start")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Check if can start exam", description = "Validate if student can start new attempt")
public ResponseEntity<ApiResponse<CanStartAttemptDTO>> canStartAttempt(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/{attemptId}/can-submit")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Check if can submit", description = "Validate if attempt can be submitted")
public ResponseEntity<ApiResponse<CanSubmitDTO>> canSubmit(
    @PathVariable UUID attemptId,
    Authentication auth);

@GetMapping("/exam/{examId}/remaining-attempts")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get remaining attempts", description = "Get number of remaining attempts allowed")
public ResponseEntity<ApiResponse<Integer>> getRemainingAttempts(
    @PathVariable UUID examId,
    Authentication auth);
```

### Suspicious Activity

```java
@GetMapping("/suspicious")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get suspicious attempts", description = "Get all attempts with suspicious activity")
public ResponseEntity<ApiResponse<Page<AttemptSummary>>> getSuspiciousAttempts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    Authentication auth);

@GetMapping("/exam/{examId}/suspicious")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get suspicious attempts for exam", description = "Suspicious attempts for specific exam")
public ResponseEntity<ApiResponse<List<AttemptSummary>>> getSuspiciousExamAttempts(
    @PathVariable UUID examId,
    Authentication auth);

@PostMapping("/{attemptId}/flag-suspicious")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Flag attempt as suspicious", description = "Manually flag attempt for review")
public ResponseEntity<ApiResponse<Void>> flagAsSuspicious(
    @PathVariable UUID attemptId,
    @RequestBody FlagSuspiciousRequest request,
    Authentication auth);
```

### Search & Filtering

```java
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
    Authentication auth);
```

### Bulk Operations

```java
@PostMapping("/bulk/submit")
@PreAuthorize("hasRole('ADMIN')")
@Operation(summary = "Bulk submit attempts", description = "Force submit multiple attempts")
public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkSubmit(
    @RequestBody List<UUID> attemptIds,
    Authentication auth);

@DeleteMapping("/bulk/delete")
@PreAuthorize("hasRole('ADMIN')")
@Operation(summary = "Bulk delete attempts", description = "Delete multiple attempts")
public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkDelete(
    @RequestBody List<UUID> attemptIds,
    Authentication auth);
```

# RESULT SERVICE - Additional Endpoints Needed

### Result Analytics & Insights

```java
@GetMapping("/{id}/insights")
@PreAuthorize("isAuthenticated()")
@Operation(summary = "Get result insights", description = "AI-generated insights and recommendations")
public ResponseEntity<ApiResponse<ResultInsightsDTO>> getResultInsights(
    @PathVariable UUID id,
    Authentication auth);

@GetMapping("/{id}/strengths-weaknesses")
@PreAuthorize("isAuthenticated()")
@Operation(summary = "Get strengths and weaknesses", description = "Analysis of strong and weak areas")
public ResponseEntity<ApiResponse<StrengthWeaknessDTO>> getStrengthsWeaknesses(
    @PathVariable UUID id,
    Authentication auth);

@GetMapping("/{id}/question-analysis")
@PreAuthorize("isAuthenticated()")
@Operation(summary = "Get question-wise analysis", description = "Detailed analysis of each question")
public ResponseEntity<ApiResponse<List<QuestionAnalysisDTO>>> getQuestionAnalysis(
    @PathVariable UUID id,
    Authentication auth);

@GetMapping("/{id}/time-efficiency")
@PreAuthorize("isAuthenticated()")
@Operation(summary = "Get time efficiency analysis", description = "Analysis of time management")
public ResponseEntity<ApiResponse<TimeEfficiencyDTO>> getTimeEfficiency(
    @PathVariable UUID id,
    Authentication auth);
```

### Comparison & Benchmarking

```java
@GetMapping("/{id}/compare-with-average")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Compare with class average", description = "Compare result with class performance")
public ResponseEntity<ApiResponse<ComparisonDTO>> compareWithAverage(
    @PathVariable UUID id,
    Authentication auth);

@GetMapping("/{id}/percentile")
@PreAuthorize("isAuthenticated()")
@Operation(summary = "Get percentile rank", description = "Get percentile ranking in exam")
public ResponseEntity<ApiResponse<PercentileDTO>> getPercentile(
    @PathVariable UUID id,
    Authentication auth);

@GetMapping("/my-results/compare")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Compare my results", description = "Compare multiple results side-by-side")
public ResponseEntity<ApiResponse<MultiResultComparisonDTO>> compareMyResults(
    @RequestParam List<UUID> resultIds,
    Authentication auth);
```

### Performance Tracking

```java
@GetMapping("/my-progress")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get my progress over time", description = "Track performance improvement")
public ResponseEntity<ApiResponse<ProgressTrackingDTO>> getMyProgress(
    @RequestParam(required = false) String subject,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
    Authentication auth);

@GetMapping("/my-subject-performance")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get subject-wise performance", description = "Performance breakdown by subject")
public ResponseEntity<ApiResponse<Map<String, SubjectPerformanceDTO>>> getSubjectPerformance(
    Authentication auth);

@GetMapping("/my-improvement-areas")
@PreAuthorize("hasRole('STUDENT')")
@Operation(summary = "Get improvement areas", description = "Identify areas needing improvement")
public ResponseEntity<ApiResponse<List<ImprovementAreaDTO>>> getImprovementAreas(
    Authentication auth);
```

### Exam-Level Analytics (Aggregated)

```java
@GetMapping("/exam/{examId}/analytics")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Detailed exam analytics", description = "Comprehensive analytics for exam performance")
public ResponseEntity<ApiResponse<ExamAnalyticsDTO>> getExamAnalytics(
    @PathVariable UUID examId,
    Authentication auth) {
    // Returns: participation rate, completion rate, avg score, pass rate, time stats,
    // question-wise analysis, score distribution, difficulty effectiveness
}

@GetMapping("/exam/{examId}/participation")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get participation metrics", description = "Detailed participation statistics")
public ResponseEntity<ApiResponse<ParticipationMetricsDTO>> getParticipationMetrics(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/performance-distribution")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get score distribution", description = "Score distribution and percentile data")
public ResponseEntity<ApiResponse<ScoreDistributionDTO>> getScoreDistribution(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/time-analysis")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get time analysis", description = "Analysis of time taken by students")
public ResponseEntity<ApiResponse<TimeAnalysisDTO>> getTimeAnalysis(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/question-performance")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get question-wise performance", description = "Performance analysis per question")
public ResponseEntity<ApiResponse<List<QuestionPerformanceDTO>>> getQuestionPerformance(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/compare")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Compare exams", description = "Compare this exam with others")
public ResponseEntity<ApiResponse<ExamComparisonDTO>> compareExams(
    @PathVariable UUID examId,
    @RequestParam List<UUID> compareWithIds,
    Authentication auth);

@GetMapping("/subject/{subject}/analytics")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Subject-wise analytics", description = "Analytics across all exams in subject")
public ResponseEntity<ApiResponse<SubjectAnalyticsDTO>> getSubjectAnalytics(
    @PathVariable String subject,
    Authentication auth);

@GetMapping("/exam/{examId}/performance-matrix")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get performance matrix", description = "Comprehensive performance matrix")
public ResponseEntity<ApiResponse<PerformanceMatrixDTO>> getPerformanceMatrix(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/difficulty-validation")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Validate question difficulty", description = "Validate if difficulty levels are accurate")
public ResponseEntity<ApiResponse<DifficultyValidationDTO>> validateDifficulty(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/item-analysis")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get item analysis", description = "Psychometric item analysis for questions")
public ResponseEntity<ApiResponse<ItemAnalysisDTO>> getItemAnalysis(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/discrimination-index")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get discrimination index", description = "Measure question effectiveness")
public ResponseEntity<ApiResponse<List<DiscriminationIndexDTO>>> getDiscriminationIndex(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/reliability-score")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get exam reliability", description = "Calculate exam reliability coefficient")
public ResponseEntity<ApiResponse<Double>> getReliabilityScore(
    @PathVariable UUID examId,
    Authentication auth);
```

### Student Performance Tracking

```java
@GetMapping("/student/{studentId}/performance-report")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get comprehensive student report", description = "Detailed performance report")
public ResponseEntity<ApiResponse<StudentPerformanceReportDTO>> getStudentPerformanceReport(
    @PathVariable UUID studentId,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
    Authentication auth);

@GetMapping("/student/{studentId}/subject/{subject}/performance")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get subject-specific performance", description = "Student performance in specific subject")
public ResponseEntity<ApiResponse<SubjectPerformanceDTO>> getStudentSubjectPerformance(
    @PathVariable UUID studentId,
    @PathVariable String subject,
    Authentication auth);

@GetMapping("/student/{studentId}/consistency-score")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get consistency score", description = "Measure performance consistency")
public ResponseEntity<ApiResponse<Double>> getConsistencyScore(
    @PathVariable UUID studentId,
    Authentication auth);
```

### Grading Assistance

```java
@GetMapping("/pending-grading/prioritized")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get prioritized pending results", description = "Pending results sorted by priority")
public ResponseEntity<ApiResponse<List<ResultSummaryDTO>>> getPrioritizedPendingResults(
    @RequestParam(defaultValue = "SUBMISSION_TIME") String priorityBy,
    Authentication auth);

@PostMapping("/bulk/grade")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Bulk grade results", description = "Grade multiple results at once")
public ResponseEntity<ApiResponse<BulkGradingResultDTO>> bulkGrade(
    @RequestBody BulkGradingRequest request,
    Authentication auth);

@PostMapping("/bulk/publish")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Bulk publish results", description = "Publish multiple results at once")
public ResponseEntity<ApiResponse<BulkOperationResultDTO>> bulkPublish(
    @RequestBody BulkPublishRequest request,
    Authentication auth);

@GetMapping("/{id}/grading-suggestions")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Get AI grading suggestions", description = "AI-powered grading suggestions")
public ResponseEntity<ApiResponse<GradingSuggestionsDTO>> getGradingSuggestions(
    @PathVariable UUID id,
    Authentication auth);
```

### Export & Reporting

```java
@GetMapping("/exam/{examId}/report/summary")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Generate summary report", description = "Generate concise summary report")
public ResponseEntity<ApiResponse<SummaryReportDTO>> generateSummaryReport(
    @PathVariable UUID examId,
    Authentication auth);

@GetMapping("/exam/{examId}/export")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Export exam results", description = "Export all results for exam")
public ResponseEntity<byte[]> exportExamResults(
    @PathVariable UUID examId,
    @RequestParam(defaultValue = "EXCEL") ExportFormat format,
    @RequestParam(required = false) Boolean includeDetails,
    Authentication auth);

@GetMapping("/student/{studentId}/export")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Export student results", description = "Export all results for student")
public ResponseEntity<byte[]> exportStudentResults(
    @PathVariable UUID studentId,
    @RequestParam(defaultValue = "PDF") ExportFormat format,
    Authentication auth);

@GetMapping("/{id}/certificate")
@PreAuthorize("isAuthenticated()")
@Operation(summary = "Generate certificate", description = "Generate certificate for passing result")
public ResponseEntity<byte[]> generateCertificate(
    @PathVariable UUID id,
    Authentication auth);

@GetMapping("/exam/{examId}/report/detailed")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Generate detailed exam report", description = "Comprehensive exam analysis report")
public ResponseEntity<ApiResponse<DetailedExamReportDTO>> generateDetailedReport(
    @PathVariable UUID examId,
    Authentication auth);
```

### Notifications

```java
@PostMapping("/{id}/notify-student")
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
@Operation(summary = "Notify student about result", description = "Send notification to student")
public ResponseEntity<ApiResponse<Void>> notifyStudent(
    @PathVariable UUID id,
    @RequestBody(required = false) NotificationRequest request,
    Authentication auth);

@PostMapping("/exam/{examId}/notify-all")
@PreAuthorize("hasAnyRole('TEACHAER', 'ADMIN')")
@Operation(summary = "Notify all students", description = "Send result notifications to all students")
public ResponseEntity<ApiResponse<NotificationResultDTO>> notifyAllStudents(
    @PathVariable UUID examId,
    Authentication auth);
```

### System Analytics

```java
@GetMapping("/system/analytics")
@PreAuthorize("hasRole('ADMIN')")
@Operation(summary = "Get system-wide analytics", description = "Overall system performance metrics")
public ResponseEntity<ApiResponse<SystemAnalyticsDTO>> getSystemAnalytics(
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate);

@GetMapping("/system/trends")
@PreAuthorize("hasRole('ADMIN')")
@Operation(summary = "Get system trends", description = "Trending patterns in results")
public ResponseEntity<ApiResponse<TrendAnalysisDTO>> getSystemTrends();
```

---

## **Priority Implementation Matrix**

### 🔴 Critical (Implement First)
1.  **Exam Service:**
    -   `checkExamAvailability`, `getMyAvailableExams`
    -   `searchExams`, `getUpcomingExams`
    -   `duplicateExam`, `checkReadiness`

2.  **Attempt Service:**
    -   `getAttemptStatus`, `getAttemptProgress`, `saveProgress`
    -   `canStartAttempt`, `getRemainingAttempts`
    -   `getProctoringSummary`, `getViolations`
    -   `getSuspiciousAttempts`

3.  **Result Service:**
    -   `getResultInsights`, `getStrengthsWeaknesses`
    -   `compareWithAverage`, `getPercentile`
    -   `getMyProgress`, `getSubjectPerformance`
    -   `getExamAnalytics`, `getPerformanceMatrix`, `getItemAnalysis`
    -   `bulkGrade`, `bulkPublish`

### 🟡 Important (Implement Second)
1.  **Exam Service:**
    -   Templates, bulk operations
    -   Notifications

2.  **Attempt Service:**
    -   Flag/unflag questions, pause/resume
    -   Time breakdown, completion stats
    -   Bulk operations

3.  **Result Service:**
    -   Advanced analytics (difficulty validation, discrimination index, time analysis)
    -   Export capabilities, certificate generation
    -   Notification system
    -   Comparison & Benchmarking (compare exams, subject analytics)

### 🟢 Nice to Have (Implement Later)
1.  Cross-service comparison endpoints
2.  AI-powered suggestions and insights
3.  Advanced visualization data endpoints
4.  Historical trend analysis
