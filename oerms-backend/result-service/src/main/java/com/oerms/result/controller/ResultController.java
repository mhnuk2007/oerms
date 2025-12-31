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
            @Parameter(description = "Exam ID") @PathVariable UUID examId) {
        resultService.calculateRankings(examId);
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

    // ==================== Health Check ====================

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if result service is running")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Result service is running", "OK"));
    }
}
