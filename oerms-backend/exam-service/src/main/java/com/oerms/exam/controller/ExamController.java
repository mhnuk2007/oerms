package com.oerms.exam.controller;

import com.oerms.exam.dto.*;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.PageResponse;
import com.oerms.exam.enums.ExamStatus;
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
        return new ResponseEntity<>(ApiResponse.success("Exam created successfully", exam), HttpStatus.CREATED);
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

    // ==================== Student Exam Lifecycle ====================

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

    // ==================== Query & Search Operations ====================

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all exams (Admin)", description = "Retrieves all exams in the system (admin only)")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getAllExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            Authentication authentication) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageResponse<ExamDTO> exams = examService.getAllExams(authentication, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success("All exams retrieved successfully", exams));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get teacher's exams", description = "Retrieves all exams created by a specific teacher")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getTeacherExams(
            @PathVariable UUID teacherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageResponse<ExamDTO> exams = examService.getTeacherExams(teacherId, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success("Exams retrieved successfully", exams));
    }

    @GetMapping("/published")
    @Operation(summary = "Get published exams", description = "Retrieves all published and active exams")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getPublishedExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
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
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<ExamDTO> exams = examService.searchExams(title, subject, status, teacherId, minDuration, maxDuration,
                startDate, endDate, minTotalMarks, maxTotalMarks, isActive, PageRequest.of(page, size, sort), auth);
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

    // ==================== Duplication & Templates ====================

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Duplicate exam", description = "Create a copy of existing exam")
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

    // ==================== Scheduling & Management ====================

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
            @RequestParam int extraMinutes,
            Authentication auth) {
        ExamDTO exam = examService.extendDeadline(id, extraMinutes, auth);
        return ResponseEntity.ok(ApiResponse.success("Deadline extended successfully", exam));
    }

    @PutMapping("/{id}/duration")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update exam duration", description = "Change total duration of exam")
    public ResponseEntity<ApiResponse<ExamDTO>> updateDuration(
            @PathVariable UUID id,
            @RequestParam int durationMinutes,
            Authentication auth) {
        ExamDTO exam = examService.updateDuration(id, durationMinutes, auth);
        return ResponseEntity.ok(ApiResponse.success("Duration updated successfully", exam));
    }

    // ==================== Bulk Operations ====================

    @PostMapping("/bulk/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkPublish(@RequestBody List<UUID> examIds, Authentication auth) {
        examService.bulkPublish(examIds, auth);
        return ResponseEntity.ok(ApiResponse.success("Exams published successfully", null));
    }

    @PostMapping("/bulk/archive")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkArchive(@RequestBody List<UUID> examIds, Authentication auth) {
        examService.bulkArchive(examIds, auth);
        return ResponseEntity.ok(ApiResponse.success("Exams archived successfully", null));
    }

    @PostMapping("/bulk/delete")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkDelete(@RequestBody List<UUID> examIds, Authentication auth) {
        examService.bulkDelete(examIds, auth);
        return ResponseEntity.ok(ApiResponse.success("Exams deleted successfully", null));
    }

    @PostMapping("/bulk/update-status")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkUpdateStatus(
            @RequestBody BulkStatusUpdateRequest request, Authentication auth) {
        examService.bulkUpdateStatus(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Exams status updated successfully", null));
    }

    // ==================== Validation & Verification ====================

    @GetMapping("/{id}/conflicts")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ExamConflictDTO>>> checkConflicts(@PathVariable UUID id, Authentication auth) {
        List<ExamConflictDTO> conflicts = examService.checkConflicts(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Conflicts checked successfully", conflicts));
    }

    @GetMapping("/{id}/readiness")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamReadinessDTO>> checkReadiness(@PathVariable UUID id, Authentication auth) {
        ExamReadinessDTO readiness = examService.checkReadiness(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Exam readiness checked successfully", readiness));
    }

    @PostMapping("/{id}/validate-configuration")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Boolean>> validateConfiguration(@PathVariable UUID id, Authentication auth) {
        Boolean isValid = examService.validateConfiguration(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Exam configuration validated", isValid));
    }

    // ==================== Exam Statistics ====================

    @GetMapping("/{id}/questions/count")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> getExamQuestionCount(@PathVariable UUID id) {
        int count = examService.getExamQuestionCount(id);
        return ResponseEntity.ok(ApiResponse.success("Question count retrieved successfully", count));
    }

    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamStatisticsDTO>> getExamStatistics(@PathVariable UUID id) {
        ExamStatisticsDTO stats = examService.getExamStatistics(id);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    }
}
