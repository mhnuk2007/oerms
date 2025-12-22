package com.oerms.result.service;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.AttemptDTO;
import com.oerms.common.dto.ExamDTO; // Changed from ExamDetailsDTO
import com.oerms.common.exception.*;
import com.oerms.common.util.JwtUtils;
import com.oerms.result.client.*;
import com.oerms.result.dto.*;
import com.oerms.result.entity.Result;
import com.oerms.result.enums.ResultStatus;
import com.oerms.result.kafka.ResultEventProducer;
import com.oerms.result.mapper.ResultMapper;
import com.oerms.result.repository.ResultRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResultService {

    private final ResultRepository resultRepository;
    private final ResultMapper resultMapper;
    private final ExamServiceClient examServiceClient;
    private final AttemptServiceClient attemptServiceClient;
    private final ResultEventProducer eventProducer;

    /**
     * Creates result from completed attempt
     */
    @Transactional
    public ResultDTO createResultFromAttempt(AttemptDTO attempt) {
        log.info("Creating result from attempt: {}", attempt.getId());

        // Check if result already exists
        Optional<Result> existingResult = resultRepository.findByAttemptId(attempt.getId());
        if (existingResult.isPresent()) {
            log.warn("Result already exists for attempt: {}", attempt.getId());
            return resultMapper.toDTO(existingResult.get());
        }

        // Fetch exam details
        ExamDTO exam = getExamOrThrow(attempt.getExamId()); // Changed from ExamDetailsDTO

        // Determine if manual grading is required
        boolean requiresManualGrading = attempt.getAnswers() != null && attempt.getAnswers().stream()
                .anyMatch(answer -> answer.getMarksObtained() == null);

        // Calculate grade
        String grade = calculateGrade(attempt.getObtainedMarks(), attempt.getTotalMarks()); // Changed to use attempt.getTotalMarks()

        // Determine pass/fail
        boolean passed = attempt.getObtainedMarks() != null &&
                exam.getPassingMarks() != null &&
                attempt.getObtainedMarks() >= exam.getPassingMarks();

        // Determine the initial status of the result
        ResultStatus initialStatus;
        if (requiresManualGrading) {
            initialStatus = ResultStatus.PENDING_GRADING;
        } else if (Boolean.TRUE.equals(exam.getShowResultsImmediately())) {
            initialStatus = ResultStatus.PUBLISHED;
        } else {
            initialStatus = ResultStatus.DRAFT;
        }

        // Create result entity
        Result result = Result.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .studentId(attempt.getStudentId())
                .studentName(attempt.getStudentName())
                .obtainedMarks(attempt.getObtainedMarks())
                .totalMarks(attempt.getTotalMarks())
                .percentage(attempt.getPercentage())
                .grade(grade)
                .passed(passed)
                .totalQuestions(attempt.getTotalQuestions())
                .status(initialStatus)
                .requiresManualGrading(requiresManualGrading)
                .timeTakenSeconds(attempt.getTimeTakenSeconds() != null ? attempt.getTimeTakenSeconds().longValue() : null)
                .attemptNumber(attempt.getAttemptNumber())
                .tabSwitches(attempt.getTabSwitches())
                .webcamViolations(attempt.getWebcamViolations())
                .suspiciousActivity(isSuspiciousActivity(attempt))
                .submittedAt(attempt.getSubmittedAt())
                .autoSubmitted(attempt.getAutoSubmitted())
                .build();

        if (result.getStatus() == ResultStatus.PUBLISHED) {
            result.setPublishedAt(LocalDateTime.now());
        }

        result = resultRepository.save(result);
        log.info("Result created successfully: {}", result.getId());

        // Publish event
        try {
            eventProducer.publishResultCreated(result);
            if (result.getStatus() == ResultStatus.PUBLISHED) {
                eventProducer.publishResultPublished(result);
            }
        } catch (Exception e) {
            log.error("Failed to publish result created event", e);
        }

        return resultMapper.toDTO(result);
    }

    /**
     * Publishes a result to make it visible to students
     */
    @Transactional
    public ResultDTO publishResult(UUID resultId, PublishResultRequest request, Authentication auth) {
        UUID userId = JwtUtils.getUserId(auth);
        String role = JwtUtils.getRole(auth);

        log.info("Publishing result: {} by user: {}", resultId, userId);

        Result result = getResultEntity(resultId);

        // Verify ownership for teachers
        if ("ROLE_TEACHER".equals(role)) {
            ExamDTO exam = getExamOrThrow(result.getExamId()); // Changed from ExamDetailsDTO
            if (!exam.getTeacherId().equals(userId)) {
                throw new UnauthorizedException("Not authorized to publish this result");
            }
        }

        // Check if already published
        if (result.getStatus() == ResultStatus.PUBLISHED) {
            throw new BadRequestException("Result is already published");
        }

        // Check if requires grading
        if (result.getRequiresManualGrading() && result.getStatus() != ResultStatus.GRADED) {
            throw new BadRequestException("Result requires manual grading before publishing");
        }

        // Update result
        result.setStatus(ResultStatus.PUBLISHED);
        result.setPublishedAt(LocalDateTime.now());
        result.setPublishedBy(userId);
        if (request.getComments() != null) {
            result.setTeacherComments(request.getComments());
        }

        result = resultRepository.save(result);
        log.info("Result published successfully: {}", resultId);

        // Calculate rankings if needed
        if (Boolean.TRUE.equals(request.getCalculateRankings())) {
            calculateRankings(result.getExamId());
        }

        // Publish event
        try {
            eventProducer.publishResultPublished(result);
        } catch (Exception e) {
            log.error("Failed to publish result published event", e);
        }

        return resultMapper.toDTO(result);
    }

    /**
     * Manually grades a result (for subjective questions)
     */
    @Transactional
    public ResultDTO gradeResult(UUID resultId, GradeResultRequest request, Authentication auth) {
        UUID userId = JwtUtils.getUserId(auth);
        String graderName = JwtUtils.getUsername(auth);
        String role = JwtUtils.getRole(auth);

        log.info("Grading result: {} by user: {}", resultId, userId);

        Result result = getResultEntity(resultId);

        // Verify ownership for teachers
        if ("ROLE_TEACHER".equals(role)) {
            ExamDTO exam = getExamOrThrow(result.getExamId()); // Changed from ExamDetailsDTO
            if (!exam.getTeacherId().equals(userId)) {
                throw new UnauthorizedException("Not authorized to grade this result");
            }
        }

        // Update marks
        if (request.getObtainedMarks() != null) {
            result.setObtainedMarks(request.getObtainedMarks());

            // Recalculate percentage
            if (result.getTotalMarks() != null && result.getTotalMarks() > 0) { // Added null check for totalMarks
                result.setPercentage((request.getObtainedMarks() / result.getTotalMarks()) * 100);
            }

            // Recalculate grade
            result.setGrade(calculateGrade(request.getObtainedMarks(), result.getTotalMarks()));

            // Recalculate pass/fail
            ExamDTO exam = getExamOrThrow(result.getExamId()); // Changed from ExamDetailsDTO
            result.setPassed(request.getObtainedMarks() >= exam.getPassingMarks());
        }

        // Set grader info
        result.setGradedBy(userId);
        result.setGradedByName(graderName);
        result.setGradedAt(LocalDateTime.now());
        result.setStatus(ResultStatus.GRADED);
        result.setRequiresManualGrading(false);

        // Add teacher comments
        if (request.getComments() != null) {
            result.setTeacherComments(request.getComments());
        }

        result = resultRepository.save(result);
        log.info("Result graded successfully: {} (Marks: {}/{})",
                resultId, result.getObtainedMarks(), result.getTotalMarks());

        // Publish event
        try {
            eventProducer.publishResultGraded(result);
        } catch (Exception e) {
            log.error("Failed to publish result graded event", e);
        }

        return resultMapper.toDTO(result);
    }

    /**
     * Gets a single result
     */
    @Transactional(readOnly = true)
    public ResultDTO getResult(UUID resultId, Authentication auth) {
        UUID userId = JwtUtils.getUserId(auth);
        String role = JwtUtils.getRole(auth);

        log.debug("Fetching result: {}", resultId);

        Result result = getResultEntity(resultId);

        // Check access
        if ("ROLE_STUDENT".equals(role)) {
            // Students can only see their own published results
            if (!result.getStudentId().equals(userId)) {
                throw new UnauthorizedException("Not authorized to view this result");
            }
            if (result.getStatus() != ResultStatus.PUBLISHED) {
                throw new UnauthorizedException("Result is not yet published");
            }
        } else if ("ROLE_TEACHER".equals(role)) {
            // Teachers can see results for their exams
            ExamDTO exam = getExamOrThrow(result.getExamId()); // Changed from ExamDetailsDTO
            if (!exam.getTeacherId().equals(userId)) {
                throw new UnauthorizedException("Not authorized to view this result");
            }
        }
        // Admins can see all results

        return resultMapper.toDTO(result);
    }

    /**
     * Gets a result by attempt ID
     */
    @Transactional(readOnly = true)
    public ResultDTO getResultByAttemptId(UUID attemptId) {
        log.debug("Fetching result for attempt: {}", attemptId);
        Result result = resultRepository.findByAttemptId(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found for attempt: " + attemptId));
        return resultMapper.toDTO(result);
    }

    /**
     * Gets student's own results
     */
    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getMyResults(Pageable pageable, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        log.debug("Fetching results for student: {}", studentId);

        Page<Result> results = resultRepository.findByStudentId(studentId, pageable);
        return results.map(resultMapper::toSummaryDTO);
    }

    /**
     * Gets student's results for specific exam
     */
    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getMyExamResults(UUID examId, Pageable pageable, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        log.debug("Fetching results for student: {} and exam: {}", studentId, examId);

        Page<Result> results = resultRepository.findByStudentIdAndExamId(studentId, examId, pageable);
        return results.map(resultMapper::toSummaryDTO);
    }

    /**
     * Gets all results for an exam (teacher/admin)
     */
    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getExamResults(UUID examId, Pageable pageable, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        verifyExamOwnership(examId, auth);

        log.debug("Fetching results for exam: {}", examId);

        Page<Result> results = resultRepository.findByExamId(examId, pageable);
        return results.map(resultMapper::toSummaryDTO);
    }

    /**
     * Gets results requiring grading
     */
    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getPendingGradingResults(Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        log.debug("Fetching results pending grading");

        List<Result> results = resultRepository.findPendingGrading();
        return results.stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gets results requiring grading for specific exam
     */
    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getPendingGradingByExam(UUID examId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        verifyExamOwnership(examId, auth);

        log.debug("Fetching results pending grading for exam: {}", examId);

        List<Result> results = resultRepository.findPendingGradingByExam(examId);
        return results.stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gets exam statistics
     */
    @Transactional(readOnly = true)
    public ExamResultStatisticsDTO getExamStatistics(UUID examId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        verifyExamOwnership(examId, auth);

        log.debug("Calculating statistics for exam: {}", examId);

        ExamDTO exam = getExamOrThrow(examId); // Changed from ExamDetailsDTO
        List<Result> allResults = resultRepository.findAllByExamId(examId);
        List<Result> publishedResults = resultRepository.findByExamIdAndStatus(examId, ResultStatus.PUBLISHED);

        if (publishedResults.isEmpty()) {
            return ExamResultStatisticsDTO.builder()
                    .examId(examId)
                    .examTitle(exam.getTitle())
                    .totalResults(0L)
                    .publishedResults(0L)
                    .pendingGrading(0L)
                    .averageScore(0.0)
                    .highestScore(0.0)
                    .lowestScore(0.0)
                    .averagePercentage(0.0)
                    .passedCount(0L)
                    .failedCount(0L)
                    .passRate(0.0)
                    .gradeDistribution(new HashMap<>())
                    .build();
        }

        long totalResults = allResults.size();
        long publishedCount = publishedResults.size();
        long pendingGrading = resultRepository.countByExamIdAndStatus(examId, ResultStatus.PENDING_GRADING);

        Double averageScore = resultRepository.getAverageScoreByExam(examId);
        Double highestScore = resultRepository.getHighestScoreByExam(examId);
        Double lowestScore = resultRepository.getLowestScoreByExam(examId);
        Double averagePercentage = resultRepository.getAveragePercentageByExam(examId);

        long passedCount = resultRepository.countByExamIdAndPassed(examId, true);
        long failedCount = resultRepository.countByExamIdAndPassed(examId, false);
        double passRate = publishedCount > 0 ? (passedCount * 100.0 / publishedCount) : 0.0;

        // Get grade distribution
        List<Object[]> gradeDistRaw = resultRepository.getGradeDistribution(examId);
        Map<String, Long> gradeDistribution = new HashMap<>();
        for (Object[] row : gradeDistRaw) {
            gradeDistribution.put((String) row[0], ((Number) row[1]).longValue());
        }

        // Get suspicious results count
        long suspiciousCount = resultRepository.findSuspiciousResultsByExam(examId).size();

        return ExamResultStatisticsDTO.builder()
                .examId(examId)
                .examTitle(exam.getTitle())
                .totalResults(totalResults)
                .publishedResults(publishedCount)
                .pendingGrading(pendingGrading)
                .averageScore(averageScore != null ? averageScore : 0.0)
                .highestScore(highestScore != null ? highestScore : 0.0)
                .lowestScore(lowestScore != null ? lowestScore : 0.0)
                .averagePercentage(averagePercentage != null ? averagePercentage : 0.0)
                .passedCount(passedCount)
                .failedCount(failedCount)
                .passRate(passRate)
                .gradeDistribution(gradeDistribution)
                .suspiciousResultsCount(suspiciousCount)
                .build();
    }

    /**
     * Gets student statistics
     */
    @Transactional(readOnly = true)
    public StudentStatisticsDTO getStudentStatistics(UUID studentId, Authentication auth) {
        UUID userId = JwtUtils.getUserId(auth);
        String role = JwtUtils.getRole(auth);

        // Students can only see their own stats
        if ("ROLE_STUDENT".equals(role) && !studentId.equals(userId)) {
            throw new UnauthorizedException("Not authorized to view this student's statistics");
        }

        log.debug("Calculating statistics for student: {}", studentId);

        long totalResults = resultRepository.countByStudentId(studentId);
        long publishedResults = resultRepository.countByStudentIdAndStatus(studentId, ResultStatus.PUBLISHED);
        Double averageScore = resultRepository.getStudentAverageScore(studentId);

        List<Result> recentResults = resultRepository.findRecentResultsByStudent(
                studentId, PageRequest.of(0, 10));

        return StudentStatisticsDTO.builder()
                .studentId(studentId)
                .totalResults(totalResults)
                .publishedResults(publishedResults)
                .averageScore(averageScore != null ? averageScore : 0.0)
                .recentResults(recentResults.stream()
                        .map(resultMapper::toSummaryDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Gets top scorers for an exam
     */
    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getTopScorers(UUID examId, int limit, Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        log.debug("Fetching top {} scorers for exam: {}", limit, examId);

        List<Result> topResults = resultRepository.findTopScoresByExam(
                examId, PageRequest.of(0, limit));

        return topResults.stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gets suspicious results
     */
    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getSuspiciousResults(Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        log.debug("Fetching suspicious results");

        List<Result> suspiciousResults = resultRepository.findSuspiciousResults();
        return suspiciousResults.stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gets suspicious results for an exam
     */
    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getSuspiciousResultsByExam(UUID examId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        verifyExamOwnership(examId, auth);

        log.debug("Fetching suspicious results for exam: {}", examId);

        List<Result> suspiciousResults = resultRepository.findSuspiciousResultsByExam(examId);
        return suspiciousResults.stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Calculates rankings for all published results in an exam
     */
    @Transactional
    public void calculateRankings(UUID examId) {
        log.info("Calculating rankings for exam: {}", examId);

        List<Result> publishedResults = resultRepository.findByExamIdAndStatus(examId, ResultStatus.PUBLISHED);

        if (publishedResults.isEmpty()) {
            log.warn("No published results found for exam: {}", examId);
            return;
        }

        // Sort by marks descending
        publishedResults.sort((r1, r2) -> Double.compare(r2.getObtainedMarks(), r1.getObtainedMarks()));

        // Assign ranks
        int rank = 1;
        Double previousMarks = null;
        int sameRankCount = 0;

        for (Result result : publishedResults) {
            if (previousMarks != null && result.getObtainedMarks().equals(previousMarks)) {
                // Same marks, same rank
                sameRankCount++;
            } else {
                // Different marks, new rank
                rank += sameRankCount;
                sameRankCount = 1;
            }

            result.setRank(rank);
            previousMarks = result.getObtainedMarks();
        }

        resultRepository.saveAll(publishedResults);
        log.info("Rankings calculated for {} results", publishedResults.size());
    }

    /**
     * Unpublishes a result
     */
    @Transactional
    public ResultDTO unpublishResult(UUID resultId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        log.info("Unpublishing result: {}", resultId);

        Result result = getResultEntity(resultId);
        verifyExamOwnership(result.getExamId(), auth);

        if (result.getStatus() != ResultStatus.PUBLISHED) {
            throw new BadRequestException("Result is not published");
        }

        result.setStatus(result.getRequiresManualGrading() ?
                ResultStatus.PENDING_GRADING : ResultStatus.DRAFT);
        result.setPublishedAt(null);
        result.setPublishedBy(null);

        result = resultRepository.save(result);
        log.info("Result unpublished: {}", resultId);

        return resultMapper.toDTO(result);
    }

    /**
     * Deletes a result (admin only)
     */
    @Transactional
    public void deleteResult(UUID resultId, Authentication auth) {
        String role = JwtUtils.getRole(auth);

        if (!"ROLE_ADMIN".equals(role)) {
            throw new UnauthorizedException("Only admins can delete results");
        }

        log.info("Deleting result: {}", resultId);

        Result result = getResultEntity(resultId);

        if (result.getStatus() == ResultStatus.PUBLISHED) {
            throw new BadRequestException("Cannot delete published result");
        }

        resultRepository.delete(result);
        log.info("Result deleted: {}", resultId);
    }

    // ==================== Helper Methods ====================

    private Result getResultEntity(UUID resultId) {
        return resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + resultId));
    }

    private ExamDTO getExamOrThrow(UUID examId) { // Changed from ExamDetailsDTO
        try {
            ApiResponse<ExamDTO> response = examServiceClient.getExam(examId); // Changed from ExamDetailsDTO
            if (response == null || response.getData() == null) {
                throw new ResourceNotFoundException("Exam not found with id: " + examId);
            }
            return response.getData();
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        } catch (FeignException e) {
            log.error("Error fetching exam details: {}", e.getMessage());
            throw new ServiceException("Failed to fetch exam details");
        }
    }

    private void verifyTeacherOrAdminRole(Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_TEACHER".equals(role)) {
            throw new UnauthorizedException("Only teachers and admins can access this resource");
        }
    }

    private void verifyExamOwnership(UUID examId, Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if ("ROLE_TEACHER".equals(role)) {
            UUID userId = JwtUtils.getUserId(auth);
            ExamDTO exam = getExamOrThrow(examId); // Changed from ExamDetailsDTO
            if (!exam.getTeacherId().equals(userId)) {
                throw new UnauthorizedException("Not authorized to access this exam's results");
            }
        }
        // Admins can access all
    }

    private String calculateGrade(Double obtainedMarks, Integer totalMarks) {
        if (obtainedMarks == null || totalMarks == null || totalMarks == 0) {
            return "N/A";
        }

        double percentage = (obtainedMarks / totalMarks) * 100;

        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B";
        if (percentage >= 60) return "C";
        if (percentage >= 50) return "D";
        return "F";
    }

    private boolean isSuspiciousActivity(AttemptDTO attempt) {
        return (attempt.getTabSwitches() != null && attempt.getTabSwitches() > 5) ||
                (attempt.getWebcamViolations() != null && attempt.getWebcamViolations() > 3);
    }
}
