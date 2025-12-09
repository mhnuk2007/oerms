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
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResponse<java.util.List<AttemptAnswerResponse>>> getAttemptAnswers(
            @Parameter(description = "Attempt ID") @PathVariable UUID attemptId,
            Authentication authentication) {
        log.info("Get attempt answers request: {}", attemptId);
        
        java.util.List<AttemptAnswerResponse> answers = attemptService.getAttemptAnswers(attemptId, authentication);
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

    @GetMapping("/exam/{examId}/statistics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam attempt statistics", description = "Retrieves statistics for all attempts of an exam")
    public ResponseEntity<ApiResponse<ExamAttemptStatistics>> getExamAttemptStatistics(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication authentication) {
        log.info("Get exam attempt statistics: {}", examId);
        
        ExamAttemptStatistics statistics = attemptService.getExamAttemptStatistics(examId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", statistics));
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

    // ==================== Health Check ====================

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if attempt service is running")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Attempt service is running", "OK"));
    }
}