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

    @GetMapping("/my-attempts/exam/{examId}/count")
    public ResponseEntity<ApiResponse<Long>> getStudentExamAttemptsCount(
            @PathVariable UUID examId,
            Authentication authentication){
        Long count = attemptService.getStudentExamAttemptsCount(examId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Student exam attempts count retrieved successfully", count));
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
