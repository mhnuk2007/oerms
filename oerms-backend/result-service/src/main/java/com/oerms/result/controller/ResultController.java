package com.oerms.result.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.result.dto.*;
import com.oerms.result.service.ResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @GetMapping("/exam/{examId}/statistics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam statistics", description = "Retrieves detailed statistics for an exam")
    public ResponseEntity<ApiResponse<ExamResultStatisticsDTO>> getExamStatistics(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication auth) {
        ExamResultStatisticsDTO statistics = resultService.getExamStatistics(examId, auth);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", statistics));
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

    @PostMapping("/exam/{examId}/calculate-rankings")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Calculate rankings", description = "Calculates rankings for all published results in an exam")
    public ResponseEntity<ApiResponse<Void>> calculateRankings(
            @Parameter(description = "Exam ID") @PathVariable UUID examId,
            Authentication auth) {
        resultService.calculateRankings(examId);
        return ResponseEntity.ok(ApiResponse.success("Rankings calculated successfully", null));
    }

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

    @GetMapping("/student/{studentId}/statistics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get student statistics", description = "Retrieves statistics for a specific student")
    public ResponseEntity<ApiResponse<StudentStatisticsDTO>> getStudentStatistics(
            @Parameter(description = "Student ID") @PathVariable UUID studentId,
            Authentication auth) {
        StudentStatisticsDTO statistics = resultService.getStudentStatistics(studentId, auth);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", statistics));
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