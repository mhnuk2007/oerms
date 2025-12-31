package com.oerms.result.service;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.AttemptAnswerDTO;
import com.oerms.common.dto.AttemptDTO;
import com.oerms.common.dto.ExamDTO;
import com.oerms.common.dto.QuestionDTO;
import com.oerms.common.exception.BadRequestException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.ServiceException;
import com.oerms.common.exception.UnauthorizedException;
import com.oerms.common.util.JwtUtils;
import com.oerms.result.client.AttemptServiceClient;
import com.oerms.result.client.ExamServiceClient;
import com.oerms.result.client.QuestionServiceClient;
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
import org.springframework.util.StringUtils;

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
    private final QuestionServiceClient questionServiceClient;
    private final ResultEventProducer eventProducer;

    // ==================== CREATE OPERATIONS ====================

    @Transactional
    public ResultDTO createResultFromAttempt(AttemptDTO attempt) {
        log.info("Creating result from attempt: {}", attempt.getId());

        Optional<Result> existingResult = resultRepository.findByAttemptId(attempt.getId());
        if (existingResult.isPresent()) {
            log.warn("Result already exists for attempt: {}", attempt.getId());
            return resultMapper.toDTO(existingResult.get());
        }

        ExamDTO exam = getExamOrThrow(attempt.getExamId());
        List<QuestionDTO> questions = fetchQuestionsForGrading(attempt);
        Map<UUID, QuestionDTO> questionMap = questions.stream()
                .collect(Collectors.toMap(QuestionDTO::getId, q -> q));

        double obtainedMarks = 0.0;
        int totalMarks = 0;

        if (attempt.getAnswers() != null) {
            for (AttemptAnswerDTO answer : attempt.getAnswers()) {
                QuestionDTO question = questionMap.get(answer.getQuestionId());
                if (question != null) {
                    obtainedMarks += gradeSingleAnswer(answer, question);
                    totalMarks += (question.getMarks() != null ? question.getMarks() : 0);
                }
            }
        }

        if (attempt.getTotalMarks() != null && attempt.getTotalMarks() > 0) {
            totalMarks = attempt.getTotalMarks();
        }

        double percentage = (totalMarks > 0) ? (obtainedMarks / totalMarks) * 100 : 0.0;
        boolean requiresManualGrading = questions.stream()
                .anyMatch(q -> "ESSAY".equals(q.getType()) || "SHORT_ANSWER".equals(q.getType()));
        String grade = calculateGrade(obtainedMarks, totalMarks);
        boolean passed = exam.getPassingMarks() != null && obtainedMarks >= exam.getPassingMarks();

        ResultStatus initialStatus = determineInitialStatus(requiresManualGrading, exam.getShowResultsImmediately());

        Result result = buildResultEntity(attempt, obtainedMarks, totalMarks, percentage,
                grade, passed, initialStatus, requiresManualGrading);
        resultRepository.save(result);
        log.info("Result created successfully: {}", result.getId());

        publishResultEvents(result);
        return resultMapper.toDTO(result);
    }

    public List<QuestionDTO> fetchQuestionsForGrading(AttemptDTO attempt) {
        if (attempt.getAnswers() == null || attempt.getAnswers().isEmpty()) {
            return Collections.emptyList();
        }
        List<UUID> questionIds = attempt.getAnswers().stream()
                .map(AttemptAnswerDTO::getQuestionId)
                .collect(Collectors.toList());
        ApiResponse<List<QuestionDTO>> response = questionServiceClient.getQuestionsForGrading(questionIds);
        if (response != null && response.isSuccess() && response.getData() != null) {
            return response.getData();
        }
        return Collections.emptyList();
    }

    // ==================== READ OPERATIONS - BASIC ====================

    @Transactional(readOnly = true)
    public ResultDTO getResult(UUID resultId, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyCanViewResult(result, auth);
        return resultMapper.toDTO(result);
    }

    @Transactional(readOnly = true)
    public ResultDetailsResponse getResultDetails(UUID resultId, Authentication auth) {
        log.info("Fetching result details for resultId: {}", resultId);
        Result result = getResultEntity(resultId);
        verifyCanViewResult(result, auth);

        ApiResponse<List<AttemptAnswerDTO>> answersResponse = attemptServiceClient.getAttemptAnswers(result.getAttemptId());
        List<AttemptAnswerDTO> answers = (answersResponse != null && answersResponse.isSuccess())
                ? answersResponse.getData() : Collections.emptyList();

        List<QuestionDTO> questions = Collections.emptyList();
        if (answers != null && !answers.isEmpty()) {
            List<UUID> questionIds = answers.stream()
                    .map(AttemptAnswerDTO::getQuestionId)
                    .collect(Collectors.toList());
            ApiResponse<List<QuestionDTO>> questionsResponse = questionServiceClient.getQuestionsForGrading(questionIds);
            if (questionsResponse != null && questionsResponse.isSuccess()) {
                questions = questionsResponse.getData();
            }
        }

        Map<UUID, QuestionDTO> questionMap = questions.stream()
                .collect(Collectors.toMap(QuestionDTO::getId, q -> q));

        List<ResultQuestionDetailDTO> questionDetails = answers.stream()
                .sorted(Comparator.comparingInt(AttemptAnswerDTO::getQuestionOrder))
                .map(answer -> {
                    QuestionDTO question = questionMap.get(answer.getQuestionId());
                    double marksObtained = (question != null) ? gradeSingleAnswer(answer, question) : 0.0;
                    boolean isCorrect = marksObtained > 0;

                    return ResultQuestionDetailDTO.builder()
                            .questionId(answer.getQuestionId())
                            .questionText(question != null ? question.getQuestionText() : "Question not found")
                            .questionType(question != null ? question.getType() : null)
                            .options(question != null ? question.getOptions() : null)
                            .correctAnswer(question != null ? question.getCorrectAnswer() : null)
                            .explanation(question != null ? question.getExplanation() : null)
                            .studentSelectedOptions(answer.getSelectedOptions())
                            .studentAnswerText(answer.getAnswerText())
                            .isCorrect(isCorrect)
                            .marksAllocated(answer.getMarksAllocated())
                            .marksObtained(marksObtained)
                            .build();
                })
                .collect(Collectors.toList());

        return ResultDetailsResponse.builder()
                .resultId(result.getId())
                .examId(result.getExamId())
                .examTitle(result.getExamTitle())
                .studentId(result.getStudentId())
                .studentName(result.getStudentName())
                .totalMarks(result.getTotalMarks())
                .obtainedMarks(result.getObtainedMarks())
                .percentage(result.getPercentage())
                .grade(result.getGrade())
                .passed(result.getPassed())
                .status(result.getStatus())
                .submittedAt(result.getSubmittedAt())
                .publishedAt(result.getPublishedAt())
                .timeTakenSeconds(result.getTimeTakenSeconds())
                .questions(questionDetails)
                .build();
    }

    @Transactional(readOnly = true)
    public ResultDTO getResultByAttemptId(UUID attemptId) {
        log.debug("Fetching result for attempt: {}", attemptId);
        Result result = resultRepository.findByAttemptId(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found for attempt: " + attemptId));
        return resultMapper.toDTO(result);
    }

    @Transactional(readOnly = true)
    public List<ResultDTO> getResultsByIds(List<UUID> ids, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching {} results by IDs", ids.size());

        List<Result> results = resultRepository.findAllById(ids);
        return results.stream()
                .map(resultMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getAllResults(Pageable pageable, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching all results with pagination");
        return resultRepository.findAll(pageable).map(resultMapper::toSummaryDTO);
    }

    // ==================== READ OPERATIONS - STUDENT ====================

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getMyResults(Pageable pageable, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        log.debug("Fetching results for student: {}", studentId);
        return resultRepository.findByStudentId(studentId, pageable)
                .map(resultMapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getMyExamResults(UUID examId, Pageable pageable, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        log.debug("Fetching results for student: {} and exam: {}", studentId, examId);
        return resultRepository.findByStudentIdAndExamId(studentId, examId, pageable)
                .map(resultMapper::toSummaryDTO);
    }

    // ==================== READ OPERATIONS - EXAM ====================

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getExamResults(UUID examId, Pageable pageable, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching results for exam: {}", examId);
        return resultRepository.findByExamId(examId, pageable)
                .map(resultMapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getStudentExamResults(UUID examId, UUID studentId, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching results for exam: {} and student: {}", examId, studentId);

        List<Result> results = resultRepository.findByExamIdAndStudentId(examId, studentId);
        return results.stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    // ==================== READ OPERATIONS - BY STATUS ====================

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getResultsByStatus(ResultStatus status, Pageable pageable, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching results with status: {}", status);
        return resultRepository.findByStatus(status, pageable)
                .map(resultMapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getPendingGradingResults(Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching results pending grading");
        return resultRepository.findPendingGrading().stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getPendingGradingByExam(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching results pending grading for exam: {}", examId);
        return resultRepository.findPendingGradingByExam(examId).stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    // ==================== READ OPERATIONS - SEARCH & FILTER ====================

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> searchResults(ResultSearchCriteria criteria, Pageable pageable, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Searching results with criteria: {}", criteria);

        return resultRepository.searchResults(
                criteria.getStudentName(),
                criteria.getExamId(),
                criteria.getStatus(),
                criteria.getPassed(),
                criteria.getMinPercentage(),
                criteria.getMaxPercentage(),
                pageable
        ).map(resultMapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getResultsByDateRange(LocalDateTime startDate, LocalDateTime endDate,
                                                        Pageable pageable, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching results between {} and {}", startDate, endDate);

        return resultRepository.findBySubmittedAtBetween(startDate, endDate, pageable)
                .map(resultMapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getRecentResults(int limit, String activityType, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching recent {} results with activity type: {}", limit, activityType);

        Pageable pageable = PageRequest.of(0, limit);
        List<Result> results;

        switch (activityType.toUpperCase()) {
            case "GRADED":
                results = resultRepository.findRecentlyGraded(pageable);
                break;
            case "PUBLISHED":
                results = resultRepository.findRecentlyPublished(pageable);
                break;
            case "SUBMITTED":
            default:
                results = resultRepository.findRecentlySubmitted(pageable);
                break;
        }

        return results.stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    // ==================== READ OPERATIONS - STATISTICS ====================

    @Transactional(readOnly = true)
    public ExamResultStatisticsDTO getExamStatistics(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Calculating statistics for exam: {}", examId);
        ExamDTO exam = getExamOrThrow(examId);
        List<Result> publishedResults = resultRepository.findByExamIdAndStatus(examId, ResultStatus.PUBLISHED);

        if (publishedResults.isEmpty()) {
            return ExamResultStatisticsDTO.builder()
                    .examId(examId)
                    .examTitle(exam.getTitle())
                    .totalResults(0L)
                    .publishedResults(0L)
                    .build();
        }

        long passedCount = resultRepository.countByExamIdAndPassed(examId, true);
        double passRate = (double) passedCount * 100 / publishedResults.size();

        return ExamResultStatisticsDTO.builder()
                .examId(examId)
                .examTitle(exam.getTitle())
                .totalResults((long) resultRepository.countByExamId(examId))
                .publishedResults((long) publishedResults.size())
                .pendingGrading(resultRepository.countByExamIdAndStatus(examId, ResultStatus.PENDING_GRADING))
                .averageScore(resultRepository.getAverageScoreByExam(examId))
                .highestScore(resultRepository.getHighestScoreByExam(examId))
                .lowestScore(resultRepository.getLowestScoreByExam(examId))
                .averagePercentage(resultRepository.getAveragePercentageByExam(examId))
                .passedCount(passedCount)
                .failedCount(publishedResults.size() - passedCount)
                .passRate(passRate)
                .gradeDistribution(resultRepository.getGradeDistribution(examId).stream()
                        .collect(Collectors.toMap(obj -> (String) obj[0], obj -> (Long) obj[1])))
                .suspiciousResultsCount((long) resultRepository.findSuspiciousResultsByExam(examId).size())
                .build();
    }

    @Transactional(readOnly = true)
    public StudentStatisticsDTO getStudentStatistics(UUID studentId, Authentication auth) {
        verifyCanViewStudentStats(studentId, auth);
        log.debug("Calculating statistics for student: {}", studentId);
        return StudentStatisticsDTO.builder()
                .studentId(studentId)
                .totalResults(resultRepository.countByStudentId(studentId))
                .publishedResults(resultRepository.countByStudentIdAndStatus(studentId, ResultStatus.PUBLISHED))
                .averageScore(resultRepository.getStudentAverageScore(studentId))
                .recentResults(resultRepository.findRecentResultsByStudent(studentId, PageRequest.of(0, 10)).stream()
                        .map(resultMapper::toSummaryDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getGradeDistribution(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching grade distribution for exam: {}", examId);

        return resultRepository.getGradeDistribution(examId).stream()
                .collect(Collectors.toMap(obj -> (String) obj[0], obj -> (Long) obj[1]));
    }

    @Transactional(readOnly = true)
    public PublicationStatusDTO getPublicationStatus(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching publication status for exam: {}", examId);

        ExamDTO exam = getExamOrThrow(examId);
        long totalResults = resultRepository.countByExamId(examId);
        long publishedResults = resultRepository.countByExamIdAndStatus(examId, ResultStatus.PUBLISHED);
        long draftResults = resultRepository.countByExamIdAndStatus(examId, ResultStatus.DRAFT);
        long pendingGrading = resultRepository.countByExamIdAndStatus(examId, ResultStatus.PENDING_GRADING);
        long gradedResults = resultRepository.countByExamIdAndStatus(examId, ResultStatus.GRADED);
        long withheldResults = resultRepository.countByExamIdAndStatus(examId, ResultStatus.WITHHELD);

        long unpublishedResults = totalResults - publishedResults;
        double publicationRate = totalResults > 0 ? (double) publishedResults * 100 / totalResults : 0.0;

        return PublicationStatusDTO.builder()
                .examId(examId)
                .examTitle(exam.getTitle())
                .totalResults(totalResults)
                .publishedResults(publishedResults)
                .unpublishedResults(unpublishedResults)
                .draftResults(draftResults)
                .pendingGradingResults(pendingGrading)
                .gradedResults(gradedResults)
                .withheldResults(withheldResults)
                .publicationRate(publicationRate)
                .build();
    }

    @Transactional(readOnly = true)
    public PerformanceTrendDTO getStudentPerformanceTrend(UUID studentId, LocalDateTime startDate,
                                                          LocalDateTime endDate, Authentication auth) {
        verifyCanViewStudentStats(studentId, auth);
        log.debug("Calculating performance trend for student: {}", studentId);

        List<Result> results = resultRepository.findStudentResultsInDateRange(studentId, startDate, endDate);

        if (results.isEmpty()) {
            return PerformanceTrendDTO.builder()
                    .studentId(studentId)
                    .totalExams(0)
                    .overallAveragePercentage(0.0)
                    .overallAverageScore(0.0)
                    .trend("STABLE")
                    .dataPoints(Collections.emptyList())
                    .build();
        }

        List<PerformanceTrendDTO.TrendDataPoint> dataPoints = results.stream()
                .map(r -> PerformanceTrendDTO.TrendDataPoint.builder()
                        .examId(r.getExamId())
                        .examTitle(r.getExamTitle())
                        .obtainedMarks(r.getObtainedMarks())
                        .totalMarks(r.getTotalMarks())
                        .percentage(r.getPercentage())
                        .grade(r.getGrade())
                        .passed(r.getPassed())
                        .submittedAt(r.getSubmittedAt())
                        .build())
                .collect(Collectors.toList());

        double overallAvgPercentage = results.stream()
                .mapToDouble(Result::getPercentage)
                .average()
                .orElse(0.0);

        double overallAvgScore = results.stream()
                .mapToDouble(Result::getObtainedMarks)
                .average()
                .orElse(0.0);

        String trend = calculateTrend(results);

        return PerformanceTrendDTO.builder()
                .studentId(studentId)
                .studentName(results.get(0).getStudentName())
                .totalExams(results.size())
                .overallAveragePercentage(overallAvgPercentage)
                .overallAverageScore(overallAvgScore)
                .trend(trend)
                .dataPoints(dataPoints)
                .build();
    }

    // ==================== READ OPERATIONS - SPECIAL LISTS ====================

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getTopScorers(UUID examId, int limit, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching top {} scorers for exam: {}", limit, examId);
        return resultRepository.findTopScoresByExam(examId, PageRequest.of(0, limit)).stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getLowPerformers(UUID examId, double thresholdPercentage, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching low performers for exam: {} with threshold: {}%", examId, thresholdPercentage);

        return resultRepository.findLowPerformersByExam(examId, thresholdPercentage).stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getSuspiciousResults(Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching suspicious results");
        return resultRepository.findSuspiciousResults().stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getSuspiciousResultsByExam(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching suspicious results for exam: {}", examId);
        return resultRepository.findSuspiciousResultsByExam(examId).stream()
                .map(resultMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    // ==================== UPDATE OPERATIONS ====================

    @Transactional
    public ResultDTO publishResult(UUID resultId, PublishResultRequest request, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyOwnership(result.getExamId(), auth);

        if (result.getStatus() == ResultStatus.PUBLISHED) {
            throw new BadRequestException("Result is already published");
        }
        if (result.getRequiresManualGrading() && result.getStatus() != ResultStatus.GRADED) {
            throw new BadRequestException("Result requires manual grading before publishing");
        }

        result.setStatus(ResultStatus.PUBLISHED);
        result.setPublishedAt(LocalDateTime.now());
        result.setPublishedBy(JwtUtils.getUserId(auth));
        if (request.getComments() != null) {
            result.setTeacherComments(request.getComments());
        }

        resultRepository.save(result);
        log.info("Result published successfully: {}", resultId);

        if (Boolean.TRUE.equals(request.getCalculateRankings())) {
            calculateRankings(result.getExamId());
        }
        publishResultEvents(result);
        return resultMapper.toDTO(result);
    }

    @Transactional
    public ResultDTO unpublishResult(UUID resultId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        Result result = getResultEntity(resultId);
        verifyOwnership(result.getExamId(), auth);

        if (result.getStatus() != ResultStatus.PUBLISHED) {
            throw new BadRequestException("Result is not published");
        }

        result.setStatus(result.getRequiresManualGrading() ? ResultStatus.PENDING_GRADING : ResultStatus.DRAFT);
        result.setPublishedAt(null);
        result.setPublishedBy(null);
        resultRepository.save(result);
        log.info("Result unpublished: {}", resultId);
        return resultMapper.toDTO(result);
    }

    @Transactional
    public ResultDTO gradeResult(UUID resultId, GradeResultRequest request, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyOwnership(result.getExamId(), auth);

        if (request.getObtainedMarks() != null) {
            result.setObtainedMarks(request.getObtainedMarks());
            if (result.getTotalMarks() != null && result.getTotalMarks() > 0) {
                result.setPercentage((request.getObtainedMarks() / result.getTotalMarks()) * 100);
            }
            result.setGrade(calculateGrade(request.getObtainedMarks(), result.getTotalMarks()));
            ExamDTO exam = getExamOrThrow(result.getExamId());
            result.setPassed(request.getObtainedMarks() >= exam.getPassingMarks());
        }

        result.setGradedBy(JwtUtils.getUserId(auth));
        result.setGradedByName(JwtUtils.getUsername(auth));
        result.setGradedAt(LocalDateTime.now());
        result.setStatus(ResultStatus.GRADED);
        result.setRequiresManualGrading(false);
        if (request.getComments() != null) {
            result.setTeacherComments(request.getComments());
        }

        resultRepository.save(result);
        log.info("Result graded successfully: {} (Marks: {}/{})", resultId, result.getObtainedMarks(), result.getTotalMarks());
        publishResultEvents(result);
        return resultMapper.toDTO(result);
    }

    @Transactional
    public void calculateRankings(UUID examId) {
        log.info("Calculating rankings for exam: {}", examId);
        List<Result> publishedResults = resultRepository.findByExamIdAndStatus(examId, ResultStatus.PUBLISHED);
        if (publishedResults.isEmpty()) return;

        publishedResults.sort(Comparator.comparing(Result::getObtainedMarks).reversed());
        int rank = 1;
        for (int i = 0; i < publishedResults.size(); i++) {
            if (i > 0 && publishedResults.get(i).getObtainedMarks() < publishedResults.get(i - 1).getObtainedMarks()) {
                rank = i + 1;
            }
            publishedResults.get(i).setRank(rank);
        }
        resultRepository.saveAll(publishedResults);
        log.info("Rankings calculated for {} results", publishedResults.size());
    }

    // ==================== DELETE OPERATIONS ====================

    @Transactional
    public void deleteResult(UUID resultId, Authentication auth) {
        if (!JwtUtils.getRole(auth).equals("ROLE_ADMIN")) {
            throw new UnauthorizedException("Only admins can delete results");
        }
        Result result = getResultEntity(resultId);
        if (result.getStatus() == ResultStatus.PUBLISHED) {
            throw new BadRequestException("Cannot delete published result");
        }
        resultRepository.delete(result);
        log.info("Result deleted: {}", resultId);
    }

    // ==================== HELPER METHODS ====================

    private ResultStatus determineInitialStatus(boolean requiresManualGrading, boolean showResultsImmediately) {
        if (requiresManualGrading) {
            return ResultStatus.PENDING_GRADING;
        } else if (showResultsImmediately) {
            return ResultStatus.PUBLISHED;
        } else {
            return ResultStatus.DRAFT;
        }
    }

    private Result buildResultEntity(AttemptDTO attempt, double obtainedMarks,
                                     int totalMarks, double percentage, String grade, boolean passed,
                                     ResultStatus status, boolean requiresManualGrading) {
        Result result = Result.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .studentId(attempt.getStudentId())
                .studentName(attempt.getStudentName())
                .obtainedMarks(obtainedMarks)
                .totalMarks(totalMarks)
                .percentage(percentage)
                .grade(grade)
                .passed(passed)
                .totalQuestions(attempt.getTotalQuestions())
                .status(status)
                .requiresManualGrading(requiresManualGrading)
                .timeTakenSeconds(attempt.getTimeTakenSeconds() != null ? attempt.getTimeTakenSeconds().longValue() : null)
                .attemptNumber(attempt.getAttemptNumber())
                .tabSwitches(attempt.getTabSwitches())
                .webcamViolations(attempt.getWebcamViolations())
                .suspiciousActivity(isSuspiciousActivity(attempt))
                .submittedAt(attempt.getSubmittedAt())
                .autoSubmitted(attempt.getAutoSubmitted())
                .build();

        if (status == ResultStatus.PUBLISHED) {
            result.setPublishedAt(LocalDateTime.now());
        }
        return result;
    }

    private void publishResultEvents(Result result) {
        try {
            eventProducer.publishResultCreated(result);
            if (result.getStatus() == ResultStatus.PUBLISHED) {
                eventProducer.publishResultPublished(result);
            }
        } catch (Exception e) {
            log.error("Failed to publish result event for resultId: {}", result.getId(), e);
        }
    }

    private double gradeSingleAnswer(AttemptAnswerDTO answer, QuestionDTO question) {
        String questionType = question.getType();
        boolean isCorrect = false;

        if ("MCQ".equals(questionType) || "TRUE_FALSE".equals(questionType)) {
            String studentAnswer = answer.getAnswerText();
            if (!StringUtils.hasText(studentAnswer) && answer.getSelectedOptions() != null && answer.getSelectedOptions().size() == 1) {
                studentAnswer = answer.getSelectedOptions().iterator().next();
            }
            isCorrect = isTextAnswerCorrect(studentAnswer, question.getCorrectAnswer());
        } else if ("MULTIPLE_ANSWER".equals(questionType)) {
            isCorrect = isMultipleAnswerCorrect(answer, question);
        }

        return isCorrect && question.getMarks() != null ? question.getMarks().doubleValue() : 0.0;
    }

    private boolean isTextAnswerCorrect(String studentAnswer, String correctAnswer) {
        return studentAnswer != null && correctAnswer != null &&
                studentAnswer.trim().equalsIgnoreCase(correctAnswer.trim());
    }

    private boolean isMultipleAnswerCorrect(AttemptAnswerDTO answer, QuestionDTO question) {
        if (question.getCorrectAnswer() == null || question.getCorrectAnswer().isBlank()) {
            return false;
        }
        Set<String> correctOptions = Arrays.stream(question.getCorrectAnswer().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());
        Set<String> studentSelectedOptions = (answer.getSelectedOptions() != null)
                ? answer.getSelectedOptions().stream().map(String::trim).collect(Collectors.toSet())
                : Collections.emptySet();
        return correctOptions.equals(studentSelectedOptions);
    }

    private String calculateGrade(Double obtainedMarks, Integer totalMarks) {
        if (obtainedMarks == null || totalMarks == null || totalMarks == 0) return "N/A";
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

    private String calculateTrend(List<Result> results) {
        if (results.size() < 2) return "STABLE";

        // Calculate trend based on first half vs second half performance
        int midPoint = results.size() / 2;
        double firstHalfAvg = results.subList(0, midPoint).stream()
                .mapToDouble(Result::getPercentage)
                .average()
                .orElse(0.0);
        double secondHalfAvg = results.subList(midPoint, results.size()).stream()
                .mapToDouble(Result::getPercentage)
                .average()
                .orElse(0.0);

        double difference = secondHalfAvg - firstHalfAvg;
        if (difference > 5.0) return "IMPROVING";
        else if (difference < -5.0) return "DECLINING";
        else return "STABLE";
    }

    private Result getResultEntity(UUID resultId) {
        return resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + resultId));
    }

    private ExamDTO getExamOrThrow(UUID examId) {
        try {
            ApiResponse<ExamDTO> response = examServiceClient.getExam(examId);
            if (response == null || response.getData() == null) {
                throw new ResourceNotFoundException("Exam not found with id: " + examId);
            }
            return response.getData();
        } catch (FeignException e) {
            log.error("Error fetching exam details for examId: {}: {}", examId, e.getMessage());
            throw new ServiceException("Failed to fetch exam details.");
        }
    }

    private void verifyTeacherOrAdminRole(Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_TEACHER")) {
            throw new UnauthorizedException("Only teachers and admins can access this resource");
        }
    }

    private void verifyOwnership(UUID examId, Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if (role.equals("ROLE_TEACHER")) {
            UUID userId = JwtUtils.getUserId(auth);
            ExamDTO exam = getExamOrThrow(examId);
            if (!exam.getTeacherId().equals(userId)) {
                throw new UnauthorizedException("Not authorized to access this exam's results");
            }
        }
    }

    private void verifyCanViewResult(Result result, Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if (role.equals("ROLE_STUDENT")) {
            UUID userId = JwtUtils.getUserId(auth);
            if (!result.getStudentId().equals(userId)) {
                throw new UnauthorizedException("Not authorized to view this result");
            }
            if (result.getStatus() != ResultStatus.PUBLISHED) {
                throw new UnauthorizedException("Result is not yet published");
            }
        } else {
            verifyOwnership(result.getExamId(), auth);
        }
    }

    private void verifyCanViewStudentStats(UUID studentId, Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if (role.equals("ROLE_STUDENT") && !studentId.equals(JwtUtils.getUserId(auth))) {
            throw new UnauthorizedException("Not authorized to view this student's statistics");
        }
    }
// Add these methods to ResultService class

    // ==================== NEW ANALYTICS IMPLEMENTATIONS ====================

    @Transactional(readOnly = true)
    public ResultInsightsDTO getResultInsights(UUID resultId, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyCanViewResult(result, auth);

        // Calculate performance level
        String performanceLevel;
        if (result.getPercentage() >= 90) performanceLevel = "EXCELLENT";
        else if (result.getPercentage() >= 75) performanceLevel = "GOOD";
        else if (result.getPercentage() >= 60) performanceLevel = "AVERAGE";
        else if (result.getPercentage() >= 50) performanceLevel = "BELOW_AVERAGE";
        else performanceLevel = "NEEDS_IMPROVEMENT";

        // Generate recommendations
        List<String> recommendations = new ArrayList<>();
        if (result.getPercentage() < 60) {
            recommendations.add("Review fundamental concepts thoroughly");
            recommendations.add("Practice more questions in weak areas");
        }
        if (result.getTimeTakenSeconds() != null) {
            long avgTimePerQuestion = result.getTimeTakenSeconds() / result.getTotalQuestions();
            if (avgTimePerQuestion < 30) {
                recommendations.add("Take more time to read questions carefully");
            } else if (avgTimePerQuestion > 180) {
                recommendations.add("Work on improving time management");
            }
        }
        if (result.getSuspiciousActivity()) {
            recommendations.add("Maintain exam integrity and avoid suspicious behavior");
        }

        return ResultInsightsDTO.builder()
                .resultId(resultId)
                .performanceLevel(performanceLevel)
                .recommendations(recommendations)
                .strengthAreas(new ArrayList<>())
                .improvementAreas(new ArrayList<>())
                .comparedToAverage(0.0) // Would calculate from exam average
                .build();
    }

    @Transactional(readOnly = true)
    public StrengthWeaknessDTO getStrengthsWeaknesses(UUID resultId, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyCanViewResult(result, auth);

        // Fetch question-level performance
        ApiResponse<List<AttemptAnswerDTO>> answersResponse = attemptServiceClient.getAttemptAnswers(result.getAttemptId());
        List<AttemptAnswerDTO> answers = (answersResponse != null && answersResponse.isSuccess())
                ? answersResponse.getData() : Collections.emptyList();

        List<UUID> questionIds = answers.stream()
                .map(AttemptAnswerDTO::getQuestionId)
                .collect(Collectors.toList());

        ApiResponse<List<QuestionDTO>> questionsResponse = questionServiceClient.getQuestionsForGrading(questionIds);
        List<QuestionDTO> questions = (questionsResponse != null && questionsResponse.isSuccess())
                ? questionsResponse.getData() : Collections.emptyList();

        Map<UUID, QuestionDTO> questionMap = questions.stream()
                .collect(Collectors.toMap(QuestionDTO::getId, q -> q));

        // Analyze by topic/difficulty
        Map<String, List<Boolean>> topicPerformance = new HashMap<>();

        for (AttemptAnswerDTO answer : answers) {
            QuestionDTO question = questionMap.get(answer.getQuestionId());
            if (question != null && question.getTopic() != null) {
                boolean correct = gradeSingleAnswer(answer, question) > 0;
                topicPerformance.computeIfAbsent(question.getTopic(), k -> new ArrayList<>()).add(correct);
            }
        }

        List<StrengthWeaknessDTO.TopicPerformance> strengths = new ArrayList<>();
        List<StrengthWeaknessDTO.TopicPerformance> weaknesses = new ArrayList<>();

        for (Map.Entry<String, List<Boolean>> entry : topicPerformance.entrySet()) {
            long correct = entry.getValue().stream().filter(b -> b).count();
            double accuracy = (double) correct * 100 / entry.getValue().size();

            StrengthWeaknessDTO.TopicPerformance perf = StrengthWeaknessDTO.TopicPerformance.builder()
                    .topic(entry.getKey())
                    .questionsAttempted(entry.getValue().size())
                    .correctAnswers((int) correct)
                    .accuracy(accuracy)
                    .build();

            if (accuracy >= 75) {
                strengths.add(perf);
            } else if (accuracy < 50) {
                weaknesses.add(perf);
            }
        }

        return StrengthWeaknessDTO.builder()
                .resultId(resultId)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .build();
    }

    @Transactional(readOnly = true)
    public List<QuestionAnalysisDTO> getQuestionAnalysis(UUID resultId, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyCanViewResult(result, auth);

        ResultDetailsResponse details = getResultDetails(resultId, auth);

        return details.getQuestions().stream()
                .map(q -> QuestionAnalysisDTO.builder()
                        .questionId(q.getQuestionId())
                        .questionText(q.getQuestionText())
                        .isCorrect(q.getIsCorrect())
                        .marksObtained(q.getMarksObtained())
                        .marksAllocated(q.getMarksAllocated())
                        .studentAnswer(q.getStudentAnswerText())
                        .correctAnswer(q.getCorrectAnswer())
                        .explanation(q.getExplanation())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TimeEfficiencyDTO getTimeEfficiency(UUID resultId, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyCanViewResult(result, auth);

        if (result.getTimeTakenSeconds() == null) {
            return TimeEfficiencyDTO.builder()
                    .resultId(resultId)
                    .totalTimeSeconds(0L)
                    .averageTimePerQuestion(0.0)
                    .efficiencyRating("N/A")
                    .build();
        }

        double avgTimePerQuestion = (double) result.getTimeTakenSeconds() / result.getTotalQuestions();

        String efficiencyRating;
        if (avgTimePerQuestion < 60) efficiencyRating = "FAST";
        else if (avgTimePerQuestion < 120) efficiencyRating = "OPTIMAL";
        else if (avgTimePerQuestion < 180) efficiencyRating = "SLOW";
        else efficiencyRating = "VERY_SLOW";

        return TimeEfficiencyDTO.builder()
                .resultId(resultId)
                .totalTimeSeconds(result.getTimeTakenSeconds())
                .averageTimePerQuestion(avgTimePerQuestion)
                .efficiencyRating(efficiencyRating)
                .build();
    }

    @Transactional(readOnly = true)
    public ComparisonDTO compareWithAverage(UUID resultId, Authentication auth) {
        Result result = getResultEntity(resultId);
        UUID studentId = JwtUtils.getUserId(auth);

        if (!result.getStudentId().equals(studentId)) {
            throw new UnauthorizedException("Not authorized");
        }

        Double classAverage = resultRepository.getAveragePercentageByExam(result.getExamId());
        double difference = result.getPercentage() - (classAverage != null ? classAverage : 0.0);

        return ComparisonDTO.builder()
                .resultId(resultId)
                .studentPercentage(result.getPercentage())
                .classAverage(classAverage)
                .differenceFromAverage(difference)
                .performanceLevel(difference > 10 ? "ABOVE_AVERAGE" :
                        difference < -10 ? "BELOW_AVERAGE" : "AVERAGE")
                .build();
    }

    @Transactional(readOnly = true)
    public PercentileDTO getPercentile(UUID resultId, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyCanViewResult(result, auth);

        List<Result> examResults = resultRepository.findByExamIdAndStatus(
                result.getExamId(), ResultStatus.PUBLISHED);

        long betterThanCount = examResults.stream()
                .filter(r -> r.getObtainedMarks() < result.getObtainedMarks())
                .count();

        double percentile = examResults.size() > 0
                ? (double) betterThanCount * 100 / examResults.size()
                : 0.0;

        return PercentileDTO.builder()
                .resultId(resultId)
                .percentile(percentile)
                .rank(result.getRank())
                .totalStudents(examResults.size())
                .build();
    }

    @Transactional(readOnly = true)
    public MultiResultComparisonDTO compareMyResults(List<UUID> resultIds, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);

        List<Result> results = resultRepository.findAllById(resultIds);

        // Verify all results belong to student
        results.forEach(r -> {
            if (!r.getStudentId().equals(studentId)) {
                throw new UnauthorizedException("Not authorized to view result: " + r.getId());
            }
        });

        List<MultiResultComparisonDTO.ResultComparison> comparisons = results.stream()
                .map(r -> MultiResultComparisonDTO.ResultComparison.builder()
                        .resultId(r.getId())
                        .examTitle(r.getExamTitle())
                        .obtainedMarks(r.getObtainedMarks())
                        .totalMarks(r.getTotalMarks())
                        .percentage(r.getPercentage())
                        .grade(r.getGrade())
                        .submittedAt(r.getSubmittedAt())
                        .build())
                .collect(Collectors.toList());

        double averagePercentage = results.stream()
                .mapToDouble(Result::getPercentage)
                .average()
                .orElse(0.0);

        return MultiResultComparisonDTO.builder()
                .results(comparisons)
                .averagePercentage(averagePercentage)
                .totalExams(results.size())
                .build();
    }

    @Transactional(readOnly = true)
    public ProgressTrackingDTO getMyProgress(String subject, LocalDateTime since, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);

        LocalDateTime startDate = since != null ? since : LocalDateTime.now().minusMonths(3);

        List<Result> results = resultRepository.findStudentResultsInDateRange(studentId, startDate, LocalDateTime.now());

        if (subject != null && !subject.isBlank()) {
            results = results.stream()
                    .filter(r -> subject.equalsIgnoreCase(r.getExamTitle()) ||
                            (r.getExamTitle() != null && r.getExamTitle().contains(subject)))
                    .collect(Collectors.toList());
        }

        List<ProgressTrackingDTO.ProgressPoint> progressPoints = results.stream()
                .map(r -> ProgressTrackingDTO.ProgressPoint.builder()
                        .examTitle(r.getExamTitle())
                        .percentage(r.getPercentage())
                        .date(r.getSubmittedAt())
                        .passed(r.getPassed())
                        .build())
                .collect(Collectors.toList());

        double averagePercentage = results.stream()
                .mapToDouble(Result::getPercentage)
                .average()
                .orElse(0.0);

        String trend = calculateTrend(results);

        return ProgressTrackingDTO.builder()
                .studentId(studentId)
                .subject(subject)
                .sinceDate(startDate)
                .totalExams(results.size())
                .averagePercentage(averagePercentage)
                .trend(trend)
                .progressPoints(progressPoints)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, SubjectPerformanceDTO> getSubjectPerformance(Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);

        List<Result> results = resultRepository.findByStudentIdAndStatus(studentId, ResultStatus.PUBLISHED, Pageable.unpaged()).getContent();

        // Group by subject (extracted from exam title or would be separate field)
        Map<String, List<Result>> subjectResults = results.stream()
                .collect(Collectors.groupingBy(r -> extractSubject(r.getExamTitle())));

        Map<String, SubjectPerformanceDTO> performance = new HashMap<>();

        for (Map.Entry<String, List<Result>> entry : subjectResults.entrySet()) {
            List<Result> subjectResultList = entry.getValue();
            double avgPercentage = subjectResultList.stream()
                    .mapToDouble(Result::getPercentage)
                    .average()
                    .orElse(0.0);

            long passedCount = subjectResultList.stream()
                    .filter(Result::getPassed)
                    .count();

            performance.put(entry.getKey(), SubjectPerformanceDTO.builder()
                    .subject(entry.getKey())
                    .totalExams(subjectResultList.size())
                    .averagePercentage(avgPercentage)
                    .passedExams((int) passedCount)
                    .failedExams(subjectResultList.size() - (int) passedCount)
                    .build());
        }

        return performance;
    }

    @Transactional(readOnly = true)
    public List<ImprovementAreaDTO> getImprovementAreas(Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);

        List<Result> results = resultRepository.findByStudentIdAndStatus(studentId, ResultStatus.PUBLISHED, Pageable.unpaged()).getContent();

        // Identify subjects/topics with low performance
        Map<String, List<Double>> subjectScores = results.stream()
                .collect(Collectors.groupingBy(
                        r -> extractSubject(r.getExamTitle()),
                        Collectors.mapping(Result::getPercentage, Collectors.toList())
                ));

        List<ImprovementAreaDTO> improvements = new ArrayList<>();

        for (Map.Entry<String, List<Double>> entry : subjectScores.entrySet()) {
            double avgScore = entry.getValue().stream()
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);

            if (avgScore < 60) {
                improvements.add(ImprovementAreaDTO.builder()
                        .area(entry.getKey())
                        .currentPerformance(avgScore)
                        .targetPerformance(75.0)
                        .priority(avgScore < 40 ? "HIGH" : avgScore < 50 ? "MEDIUM" : "LOW")
                        .recommendations(List.of(
                                "Review fundamental concepts",
                                "Practice more questions",
                                "Seek additional help if needed"
                        ))
                        .build());
            }
        }

        return improvements;
    }

    // ==================== EXAM-LEVEL ANALYTICS ====================

    @Transactional(readOnly = true)
    public ExamAnalyticsDTO getExamAnalytics(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);

        ExamResultStatisticsDTO stats = getExamStatistics(examId, auth);
        List<Result> results = resultRepository.findByExamIdAndStatus(examId, ResultStatus.PUBLISHED);

        // Calculate distribution
        Map<String, Long> performanceBands = new HashMap<>();
        performanceBands.put("90-100", results.stream().filter(r -> r.getPercentage() >= 90).count());
        performanceBands.put("80-89", results.stream().filter(r -> r.getPercentage() >= 80 && r.getPercentage() < 90).count());
        performanceBands.put("70-79", results.stream().filter(r -> r.getPercentage() >= 70 && r.getPercentage() < 80).count());
        performanceBands.put("60-69", results.stream().filter(r -> r.getPercentage() >= 60 && r.getPercentage() < 70).count());
        performanceBands.put("50-59", results.stream().filter(r -> r.getPercentage() >= 50 && r.getPercentage() < 60).count());
        performanceBands.put("Below 50", results.stream().filter(r -> r.getPercentage() < 50).count());

        return ExamAnalyticsDTO.builder()
                .examId(examId)
                .statistics(stats)
                .performanceBands(performanceBands)
                .totalParticipants(results.size())
                .build();
    }

    @Transactional(readOnly = true)
    public ParticipationMetricsDTO getParticipationMetrics(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);

        long totalResults = resultRepository.countByExamId(examId);
        long publishedResults = resultRepository.countByExamIdAndStatus(examId, ResultStatus.PUBLISHED);
        long pendingGrading = resultRepository.countByExamIdAndStatus(examId, ResultStatus.PENDING_GRADING);

        // Would also get enrolled student count from exam/course service
        long enrolledStudents = 100; // Placeholder

        double participationRate = enrolledStudents > 0
                ? (double) totalResults * 100 / enrolledStudents
                : 0.0;

        return ParticipationMetricsDTO.builder()
                .examId(examId)
                .enrolledStudents((int) enrolledStudents)
                .participatedStudents((int) totalResults)
                .participationRate(participationRate)
                .completedResults((int) publishedResults)
                .pendingGrading((int) pendingGrading)
                .build();
    }

    @Transactional(readOnly = true)
    public ScoreDistributionDTO getScoreDistribution(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);

        List<Result> results = resultRepository.findByExamIdAndStatus(examId, ResultStatus.PUBLISHED);

        Map<Integer, Long> scoreRanges = new TreeMap<>();
        for (int i = 0; i <= 100; i += 10) {
            int finalI = i;
            long count = results.stream()
                    .filter(r -> r.getPercentage() >= finalI && r.getPercentage() < finalI + 10)
                    .count();
            scoreRanges.put(i, count);
        }

        List<Double> allScores = results.stream()
                .map(Result::getPercentage)
                .sorted()
                .collect(Collectors.toList());

        double median = 0.0;
        if (!allScores.isEmpty()) {
            int middle = allScores.size() / 2;
            median = allScores.size() % 2 == 0
                    ? (allScores.get(middle - 1) + allScores.get(middle)) / 2.0
                    : allScores.get(middle);
        }

        return ScoreDistributionDTO.builder()
                .examId(examId)
                .scoreRanges(scoreRanges)
                .median(median)
                .standardDeviation(calculateStandardDeviation(allScores))
                .build();
    }

    private double calculateStandardDeviation(List<Double> values) {
        if (values.isEmpty()) return 0.0;

        double mean = values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = values.stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .average()
                .orElse(0.0);

        return Math.sqrt(variance);
    }

    private String extractSubject(String examTitle) {
        // Simple extraction - would be more sophisticated in production
        if (examTitle == null) return "Unknown";
        String[] words = examTitle.split("\\s+");
        return words.length > 0 ? words[0] : "Unknown";
    }

    // Export and reporting methods would integrate with file generation services

    @Transactional
    public void notifyStudent(UUID resultId, NotificationRequest request, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyOwnership(result.getExamId(), auth);

        // Integrate with notification service
        eventProducer.publishResultPublished(result);

        log.info("Notification sent to student {} for result {}", result.getStudentId(), resultId);
    }

    @Transactional
    public NotificationResultDTO notifyAllStudents(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);

        List<Result> results = resultRepository.findByExamIdAndStatus(examId, ResultStatus.PUBLISHED);

        int successCount = 0;
        for (Result result : results) {
            try {
                eventProducer.publishResultPublished(result);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to notify student {} for result {}",
                        result.getStudentId(), result.getId(), e);
            }
        }

        return NotificationResultDTO.builder()
                .totalNotifications(results.size())
                .successfulNotifications(successCount)
                .failedNotifications(results.size() - successCount)
                .sentAt(LocalDateTime.now())
                .build();
    }
}
