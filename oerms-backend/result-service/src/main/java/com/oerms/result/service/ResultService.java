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
        Map<UUID, QuestionDTO> questionMap = questions.stream().collect(Collectors.toMap(QuestionDTO::getId, q -> q));

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
        boolean requiresManualGrading = questions.stream().anyMatch(q -> "ESSAY".equals(q.getType()) || "SHORT_ANSWER".equals(q.getType()));
        String grade = calculateGrade(obtainedMarks, totalMarks);
        boolean passed = exam.getPassingMarks() != null && obtainedMarks >= exam.getPassingMarks();

        ResultStatus initialStatus = determineInitialStatus(requiresManualGrading, exam.getShowResultsImmediately());

        Result result = buildResultEntity(attempt, exam, obtainedMarks, totalMarks, percentage, grade, passed, initialStatus, requiresManualGrading);
        resultRepository.save(result);
        log.info("Result created successfully: {}", result.getId());

        publishResultEvents(result);
        return resultMapper.toDTO(result);
    }

    private ResultStatus determineInitialStatus(boolean requiresManualGrading, boolean showResultsImmediately) {
        if (requiresManualGrading) {
            return ResultStatus.PENDING_GRADING;
        } else if (showResultsImmediately) {
            return ResultStatus.PUBLISHED;
        } else {
            return ResultStatus.DRAFT;
        }
    }

    private Result buildResultEntity(AttemptDTO attempt, ExamDTO exam, double obtainedMarks, int totalMarks, double percentage, String grade, boolean passed, ResultStatus status, boolean requiresManualGrading) {
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

    public List<QuestionDTO> fetchQuestionsForGrading(AttemptDTO attempt) {
        if (attempt.getAnswers() == null || attempt.getAnswers().isEmpty()) {
            return Collections.emptyList();
        }
        List<UUID> questionIds = attempt.getAnswers().stream().map(AttemptAnswerDTO::getQuestionId).collect(Collectors.toList());
        ApiResponse<List<QuestionDTO>> response = questionServiceClient.getQuestionsForGrading(questionIds);
        if (response != null && response.isSuccess() && response.getData() != null) {
            return response.getData();
        }
        return Collections.emptyList();
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
        return studentAnswer != null && correctAnswer != null && studentAnswer.trim().equalsIgnoreCase(correctAnswer.trim());
    }

    private boolean isMultipleAnswerCorrect(AttemptAnswerDTO answer, QuestionDTO question) {
        if (question.getCorrectAnswer() == null || question.getCorrectAnswer().isBlank()) {
            return false;
        }
        Set<String> correctOptions = Arrays.stream(question.getCorrectAnswer().split(",")).map(String::trim).collect(Collectors.toSet());
        Set<String> studentSelectedOptions = (answer.getSelectedOptions() != null) ? answer.getSelectedOptions().stream().map(String::trim).collect(Collectors.toSet()) : Collections.emptySet();
        return correctOptions.equals(studentSelectedOptions);
    }

    @Transactional
    public ResultDTO publishResult(UUID resultId, PublishResultRequest request, Authentication auth) {
        Result result = getResultEntity(resultId);
        verifyOwnership(result.getExamId(), auth);

        if (result.getStatus() == ResultStatus.PUBLISHED) throw new BadRequestException("Result is already published");
        if (result.getRequiresManualGrading() && result.getStatus() != ResultStatus.GRADED) throw new BadRequestException("Result requires manual grading before publishing");

        result.setStatus(ResultStatus.PUBLISHED);
        result.setPublishedAt(LocalDateTime.now());
        result.setPublishedBy(JwtUtils.getUserId(auth));
        if (request.getComments() != null) result.setTeacherComments(request.getComments());

        resultRepository.save(result);
        log.info("Result published successfully: {}", resultId);

        if (Boolean.TRUE.equals(request.getCalculateRankings())) calculateRankings(result.getExamId());
        publishResultEvents(result);
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
        if (request.getComments() != null) result.setTeacherComments(request.getComments());

        resultRepository.save(result);
        log.info("Result graded successfully: {} (Marks: {}/{})", resultId, result.getObtainedMarks(), result.getTotalMarks());
        publishResultEvents(result);
        return resultMapper.toDTO(result);
    }

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
        List<AttemptAnswerDTO> answers = (answersResponse != null && answersResponse.isSuccess()) ? answersResponse.getData() : Collections.emptyList();

        List<QuestionDTO> questions = Collections.emptyList();
        if (answers != null && !answers.isEmpty()) {
            List<UUID> questionIds = answers.stream().map(AttemptAnswerDTO::getQuestionId).collect(Collectors.toList());
            ApiResponse<List<QuestionDTO>> questionsResponse = questionServiceClient.getQuestionsForGrading(questionIds);
            if (questionsResponse != null && questionsResponse.isSuccess()) {
                questions = questionsResponse.getData();
            }
        }

        Map<UUID, QuestionDTO> questionMap = questions.stream().collect(Collectors.toMap(QuestionDTO::getId, q -> q));

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
        Result result = resultRepository.findByAttemptId(attemptId).orElseThrow(() -> new ResourceNotFoundException("Result not found for attempt: " + attemptId));
        return resultMapper.toDTO(result);
    }

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getMyResults(Pageable pageable, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        log.debug("Fetching results for student: {}", studentId);
        return resultRepository.findByStudentId(studentId, pageable).map(resultMapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getMyExamResults(UUID examId, Pageable pageable, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        log.debug("Fetching results for student: {} and exam: {}", studentId, examId);
        return resultRepository.findByStudentIdAndExamId(studentId, examId, pageable).map(resultMapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public Page<ResultSummaryDTO> getExamResults(UUID examId, Pageable pageable, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching results for exam: {}", examId);
        return resultRepository.findByExamId(examId, pageable).map(resultMapper::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getPendingGradingResults(Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching results pending grading");
        return resultRepository.findPendingGrading().stream().map(resultMapper::toSummaryDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getPendingGradingByExam(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching results pending grading for exam: {}", examId);
        return resultRepository.findPendingGradingByExam(examId).stream().map(resultMapper::toSummaryDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamResultStatisticsDTO getExamStatistics(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Calculating statistics for exam: {}", examId);
        ExamDTO exam = getExamOrThrow(examId);
        List<Result> publishedResults = resultRepository.findByExamIdAndStatus(examId, ResultStatus.PUBLISHED);

        if (publishedResults.isEmpty()) {
            return new ExamResultStatisticsDTO(); // Return empty stats
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
                .gradeDistribution(resultRepository.getGradeDistribution(examId).stream().collect(Collectors.toMap(obj -> (String) obj[0], obj -> (Long) obj[1])))
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
                .recentResults(resultRepository.findRecentResultsByStudent(studentId, PageRequest.of(0, 10)).stream().map(resultMapper::toSummaryDTO).collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getTopScorers(UUID examId, int limit, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching top {} scorers for exam: {}", limit, examId);
        return resultRepository.findTopScoresByExam(examId, PageRequest.of(0, limit)).stream().map(resultMapper::toSummaryDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getSuspiciousResults(Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        log.debug("Fetching suspicious results");
        return resultRepository.findSuspiciousResults().stream().map(resultMapper::toSummaryDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultSummaryDTO> getSuspiciousResultsByExam(UUID examId, Authentication auth) {
        verifyOwnership(examId, auth);
        log.debug("Fetching suspicious results for exam: {}", examId);
        return resultRepository.findSuspiciousResultsByExam(examId).stream().map(resultMapper::toSummaryDTO).collect(Collectors.toList());
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

    @Transactional
    public ResultDTO unpublishResult(UUID resultId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        Result result = getResultEntity(resultId);
        verifyOwnership(result.getExamId(), auth);
        if (result.getStatus() != ResultStatus.PUBLISHED) throw new BadRequestException("Result is not published");

        result.setStatus(result.getRequiresManualGrading() ? ResultStatus.PENDING_GRADING : ResultStatus.DRAFT);
        result.setPublishedAt(null);
        result.setPublishedBy(null);
        resultRepository.save(result);
        log.info("Result unpublished: {}", resultId);
        return resultMapper.toDTO(result);
    }

    @Transactional
    public void deleteResult(UUID resultId, Authentication auth) {
        if (!JwtUtils.getRole(auth).equals("ROLE_ADMIN")) throw new UnauthorizedException("Only admins can delete results");
        Result result = getResultEntity(resultId);
        if (result.getStatus() == ResultStatus.PUBLISHED) throw new BadRequestException("Cannot delete published result");
        resultRepository.delete(result);
        log.info("Result deleted: {}", resultId);
    }

    private Result getResultEntity(UUID resultId) {
        return resultRepository.findById(resultId).orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + resultId));
    }

    private ExamDTO getExamOrThrow(UUID examId) {
        try {
            ApiResponse<ExamDTO> response = examServiceClient.getExam(examId);
            if (response == null || response.getData() == null) throw new ResourceNotFoundException("Exam not found with id: " + examId);
            return response.getData();
        } catch (FeignException e) {
            log.error("Error fetching exam details for examId: {}: {}", examId, e.getMessage());
            throw new ServiceException("Failed to fetch exam details.");
        }
    }

    private void verifyTeacherOrAdminRole(Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_TEACHER")) throw new UnauthorizedException("Only teachers and admins can access this resource");
    }

    private void verifyOwnership(UUID examId, Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if (role.equals("ROLE_TEACHER")) {
            UUID userId = JwtUtils.getUserId(auth);
            ExamDTO exam = getExamOrThrow(examId);
            if (!exam.getTeacherId().equals(userId)) throw new UnauthorizedException("Not authorized to access this exam's results");
        }
    }
    
    private void verifyCanViewResult(Result result, Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if (role.equals("ROLE_STUDENT")) {
            UUID userId = JwtUtils.getUserId(auth);
            if (!result.getStudentId().equals(userId)) throw new UnauthorizedException("Not authorized to view this result");
            if (result.getStatus() != ResultStatus.PUBLISHED) throw new UnauthorizedException("Result is not yet published");
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
        return (attempt.getTabSwitches() != null && attempt.getTabSwitches() > 5) || (attempt.getWebcamViolations() != null && attempt.getWebcamViolations() > 3);
    }
}
