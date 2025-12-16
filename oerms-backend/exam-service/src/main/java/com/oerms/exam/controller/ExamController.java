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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
            @Parameter(description = "Exam ID") @PathVariable UUID teacherId) {
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
}
