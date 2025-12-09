package com.oerms.attempt.service;

import com.oerms.attempt.client.*;
import com.oerms.attempt.dto.*;
import com.oerms.attempt.entity.*;
import com.oerms.attempt.enums.AttemptStatus;
import com.oerms.attempt.kafka.AttemptEventProducer;
import com.oerms.attempt.mapper.AttemptMapper;
import com.oerms.attempt.repository.*;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.ExamDTO;
import com.oerms.common.dto.QuestionDTO;
import com.oerms.common.dto.StudentQuestionDTO;
import com.oerms.common.exception.*;
import com.oerms.common.util.JwtUtils;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
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
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository answerRepository;
    private final AttemptMapper attemptMapper;
    private final ExamServiceClient examServiceClient;
    private final QuestionServiceClient questionServiceClient;
    private final AttemptEventProducer eventProducer;

    /**
     * Starts a new exam attempt
     */
    @Transactional
    public AttemptResponse startAttempt(StartAttemptRequest request, String ipAddress,
                                        String userAgent, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        String studentName = JwtUtils.getUsername(authentication);

        log.info("=== START ATTEMPT INITIATED ===");
        log.info("Exam ID: {}, Student ID: {}, Student Name: {}", request.getExamId(), studentId, studentName);

        // Get exam details
        ExamDTO exam = getExamOrThrow(request.getExamId());
        log.info("Fetched exam details: title={}, status={}, isActive={}",
                exam.getTitle(), exam.getStatus(), exam.getIsActive());

        // Validate exam
        validateExamForAttempt(exam);
        log.info("Exam validation passed for attempt");

        // Check for active attempt
        Optional<ExamAttempt> activeAttempt = attemptRepository
                .findByExamIdAndStudentIdAndStatus(request.getExamId(), studentId, AttemptStatus.IN_PROGRESS);
        if (activeAttempt.isPresent()) {
            log.warn("Student already has an active attempt: {}", activeAttempt.get().getId());
            return attemptMapper.toResponse(activeAttempt.get());
        }
        log.info("No active attempt found for student, proceeding to create new attempt");

        // Check max attempts
        long attemptCount = attemptRepository.countByExamIdAndStudentId(request.getExamId(), studentId);
        log.info("Current attempt count for this exam: {}", attemptCount);

        // Get questions for the student
        List<StudentQuestionDTO> questions = getExamQuestionsForStudentOrThrow(request.getExamId(), exam.getShuffleQuestions());
        log.info("Fetched {} questions for exam", questions.size());

        if (questions.isEmpty()) {
            log.error("Exam has no questions. Cannot start attempt.");
            throw new BadRequestException("Exam has no questions");
        }

        // Create attempt entity
        ExamAttempt attempt = ExamAttempt.builder()
                .examId(request.getExamId())
                .examTitle(exam.getTitle())
                .studentId(studentId)
                .studentName(studentName)
                .attemptNumber((int) attemptCount + 1)
                .status(AttemptStatus.IN_PROGRESS)
                .totalQuestions(questions.size())
                .totalMarks(questions.stream().mapToInt(StudentQuestionDTO::getMarks).sum())
                .startedAt(LocalDateTime.now())
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        log.info("Attempt entity prepared: {}", attempt);

        // Create answer placeholders
        for (int i = 0; i < questions.size(); i++) {
            StudentQuestionDTO question = questions.get(i);
            AttemptAnswer answer = AttemptAnswer.builder()
                    .questionId(question.getId())
                    .questionOrder(i)
                    .marksAllocated(question.getMarks())
                    .flagged(false)
                    .selectedOptions(new HashSet<>())
                    .build();
            attempt.addAnswer(answer);
        }
        log.info("Answer placeholders created: {}", attempt.getAnswers().size());

        // Save attempt
        try {
            attempt = attemptRepository.save(attempt);
            log.info("Attempt saved successfully with ID: {}", attempt.getId());
        } catch (Exception e) {
            log.error("Failed to save attempt to database", e);
            throw new ServiceException("Failed to save attempt. Please try again.");
        }

        // Publish event
        try {
            eventProducer.publishAttemptStarted(attempt);
            log.info("Attempt started event published for attempt ID: {}", attempt.getId());
        } catch (Exception e) {
            log.error("Failed to publish attempt started event", e);
        }

        log.info("=== START ATTEMPT COMPLETED ===");
        return attemptMapper.toResponse(attempt);
    }

    /**
     * Saves or updates an answer
     */
    @Transactional
    @CacheEvict(value = "attempts", key = "#attemptId")
    public AttemptAnswerResponse saveAnswer(UUID attemptId, SaveAnswerRequest request,
                                            Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);

        log.debug("Saving answer for attempt: {}, question: {}", attemptId, request.getQuestionId());

        ExamAttempt attempt = getAttemptEntity(attemptId);

        // Verify ownership
        verifyAttemptOwnership(attempt, studentId);

        // Check status
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Cannot save answer for non-active attempt");
        }

        // Find answer
        AttemptAnswer answer = answerRepository
                .findByAttemptIdAndQuestionId(attemptId, request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found in attempt"));

        // Update answer
        updateAnswerFields(answer, request);
        answer = answerRepository.save(answer);

        // Update attempt statistics
        attempt.updateAnsweredCount();
        attempt.updateFlaggedCount();
        attemptRepository.save(attempt);

        log.debug("Answer saved successfully for attempt: {}", attemptId);

        // Publish event
        try {
            eventProducer.publishAnswerSaved(attempt, answer);
        } catch (Exception e) {
            log.error("Failed to publish answer saved event", e);
        }

        return attemptMapper.toAnswerResponse(answer);
    }

    /**
     * Submits an attempt
     */
    @Transactional
    @CacheEvict(value = "attempts", key = "#request.attemptId")
    public AttemptResponse submitAttempt(SubmitAttemptRequest request, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);

        log.info("Submitting attempt: {} by student: {}", request.getAttemptId(), studentId);

        ExamAttempt attempt = getAttemptEntity(request.getAttemptId());

        // Verify ownership
        verifyAttemptOwnership(attempt, studentId);

        // Check status
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Attempt already submitted");
        }

        // Update attempt
        attempt.setStatus(AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setTimeTakenSeconds(attempt.calculateTimeTaken());
        attempt.setNotes(request.getNotes());
        attempt.setAutoSubmitted(false);

        // Auto-grade objective questions
        autoGradeAttempt(attempt);

        attempt = attemptRepository.save(attempt);
        log.info("Attempt submitted successfully: {} (Score: {}/{})",
                attempt.getId(), attempt.getObtainedMarks(), attempt.getTotalMarks());

        // Publish event
        try {
            eventProducer.publishAttemptSubmitted(attempt);
        } catch (Exception e) {
            log.error("Failed to publish attempt submitted event", e);
        }

        return attemptMapper.toResponse(attempt);
    }

    /**
     * Auto-submit expired attempts (scheduled task)
     */
    @Transactional
    public void autoSubmitExpiredAttempts() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(6);
        List<ExamAttempt> stalledAttempts = attemptRepository.findStalledAttempts(cutoff);

        log.info("Auto-submitting {} expired attempts", stalledAttempts.size());

        for (ExamAttempt attempt : stalledAttempts) {
            attempt.setStatus(AttemptStatus.AUTO_SUBMITTED);
            attempt.setSubmittedAt(LocalDateTime.now());
            attempt.setAutoSubmitted(true);
            autoGradeAttempt(attempt);
            attemptRepository.save(attempt);

            try {
                eventProducer.publishAttemptAutoSubmitted(attempt);
            } catch (Exception e) {
                log.error("Failed to publish auto-submit event for attempt: {}", attempt.getId(), e);
            }
        }
    }

    /**
     * Gets attempt details
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "attempts", key = "#attemptId")
    public AttemptResponse getAttempt(UUID attemptId, Authentication authentication) {
        log.debug("Fetching attempt: {}", attemptId);

        ExamAttempt attempt = getAttemptEntity(attemptId);
        UUID currentUserId = JwtUtils.getUserId(authentication);
        String role = JwtUtils.getRole(authentication);

        // Check access
        if (!attempt.getStudentId().equals(currentUserId) &&
                !"ROLE_ADMIN".equals(role) && !"ROLE_TEACHER".equals(role)) {
            throw new UnauthorizedException("Not authorized to view this attempt");
        }

        return attemptMapper.toResponse(attempt);
    }

    /**
     * Gets all answers for an attempt
     */
    @Transactional(readOnly = true)
    public List<AttemptAnswerResponse> getAttemptAnswers(UUID attemptId, Authentication authentication) {
        log.debug("Fetching answers for attempt: {}", attemptId);

        ExamAttempt attempt = getAttemptEntity(attemptId);
        UUID currentUserId = JwtUtils.getUserId(authentication);
        String role = JwtUtils.getRole(authentication);

        // Check access
        if (!attempt.getStudentId().equals(currentUserId) &&
                !"ROLE_ADMIN".equals(role) && !"ROLE_TEACHER".equals(role)) {
            throw new UnauthorizedException("Not authorized to view this attempt");
        }

        return attempt.getAnswers().stream()
                .sorted(Comparator.comparingInt(AttemptAnswer::getQuestionOrder))
                .map(attemptMapper::toAnswerResponse)
                .collect(Collectors.toList());
    }

    /**
     * Gets student's own attempts
     */
    @Transactional(readOnly = true)
    public Page<AttemptSummary> getStudentAttempts(Pageable pageable, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Fetching attempts for student: {}", studentId);

        Page<ExamAttempt> attempts = attemptRepository.findByStudentId(studentId, pageable);
        return attempts.map(attemptMapper::toSummary);
    }

    /**
     * Gets student's attempts for specific exam
     */
    @Transactional(readOnly = true)
    public Page<AttemptSummary> getStudentExamAttempts(UUID examId, Pageable pageable,
                                                       Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Fetching attempts for student: {} and exam: {}", studentId, examId);

        Page<ExamAttempt> attempts = attemptRepository.findByExamIdAndStudentId(examId, studentId, pageable);
        return attempts.map(attemptMapper::toSummary);
    }

    /**
     * Gets count of student's attempts
     */
    @Transactional(readOnly = true)
    public Long getStudentAttemptsCount(Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Counting attempts for student: {}", studentId);

        return attemptRepository.countByStudentId(studentId);
    }

    /**
     * Gets all attempts for an exam (teacher/admin)
     */
    @Transactional(readOnly = true)
    public Page<AttemptSummary> getExamAttempts(UUID examId, Pageable pageable,
                                                Authentication authentication) {
        log.debug("Fetching attempts for exam: {}", examId);

        verifyTeacherOrAdminRole(authentication);

        Page<ExamAttempt> attempts = attemptRepository.findByExamId(examId, pageable);
        return attempts.map(attemptMapper::toSummary);
    }

    /**
     * Gets count of attempts for an exam
     */
    @Transactional(readOnly = true)
    public Long getExamAttemptsCount(UUID examId, Authentication authentication) {
        log.debug("Counting attempts for exam: {}", examId);

        verifyTeacherOrAdminRole(authentication);

        return attemptRepository.countByExamId(examId);
    }

    /**
     * Gets attempts for a specific student (admin only)
     */
    @Transactional(readOnly = true)
    public Page<AttemptSummary> getStudentAttemptsAdmin(UUID studentId, Pageable pageable) {
        log.debug("Admin fetching attempts for student: {}", studentId);

        Page<ExamAttempt> attempts = attemptRepository.findByStudentId(studentId, pageable);
        return attempts.map(attemptMapper::toSummary);
    }

    /**
     * Gets all attempts (admin only)
     */
    @Transactional(readOnly = true)
    public Page<AttemptSummary> getAllAttempts(Pageable pageable) {
        log.debug("Admin fetching all attempts");

        Page<ExamAttempt> attempts = attemptRepository.findAll(pageable);
        return attempts.map(attemptMapper::toSummary);
    }

    /**
     * Gets exam attempt statistics
     */
    @Transactional(readOnly = true)
    public ExamAttemptStatistics getExamAttemptStatistics(UUID examId, Authentication authentication) {
        log.debug("Calculating statistics for exam: {}", examId);

        verifyTeacherOrAdminRole(authentication);

        ExamDTO exam = getExamOrThrow(examId);
        List<ExamAttempt> attempts = attemptRepository.findAllByExamId(examId);

        if (attempts.isEmpty()) {
            return ExamAttemptStatistics.builder()
                    .examId(examId)
                    .examTitle(exam.getTitle())
                    .totalAttempts(0L)
                    .completedAttempts(0L)
                    .inProgressAttempts(0L)
                    .autoSubmittedAttempts(0L)
                    .passedCount(0L)
                    .failedCount(0L)
                    .averageScore(0.0)
                    .highestScore(0.0)
                    .lowestScore(0.0)
                    .averageTimeSpent(0.0)
                    .build();
        }

        long completed = attempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED || a.getStatus() == AttemptStatus.AUTO_SUBMITTED)
                .count();

        long inProgress = attempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.IN_PROGRESS)
                .count();

        long autoSubmitted = attempts.stream()
                .filter(a -> Boolean.TRUE.equals(a.getAutoSubmitted()))
                .count();

        List<ExamAttempt> gradedAttempts = attempts.stream()
                .filter(a -> a.getObtainedMarks() != null)
                .collect(Collectors.toList());

        Double averageScore = gradedAttempts.isEmpty() ? 0.0 :
                gradedAttempts.stream()
                        .mapToDouble(ExamAttempt::getObtainedMarks)
                        .average()
                        .orElse(0.0);

        Double highestScore = gradedAttempts.isEmpty() ? 0.0 :
                gradedAttempts.stream()
                        .mapToDouble(ExamAttempt::getObtainedMarks)
                        .max()
                        .orElse(0.0);

        Double lowestScore = gradedAttempts.isEmpty() ? 0.0 :
                gradedAttempts.stream()
                        .mapToDouble(ExamAttempt::getObtainedMarks)
                        .min()
                        .orElse(0.0);

        Double averageTimeSpent = attempts.stream()
                .filter(a -> a.getTimeTakenSeconds() != null)
                .mapToDouble(a -> a.getTimeTakenSeconds() / 60.0)
                .average()
                .orElse(0.0);

        long passed = gradedAttempts.stream()
                .filter(a -> exam.getPassingMarks() != null && a.getObtainedMarks() >= exam.getPassingMarks())
                .count();

        long failed = gradedAttempts.stream()
                .filter(a -> exam.getPassingMarks() != null && a.getObtainedMarks() < exam.getPassingMarks())
                .count();

        return ExamAttemptStatistics.builder()
                .examId(examId)
                .examTitle(exam.getTitle())
                .totalAttempts((long) attempts.size())
                .completedAttempts(completed)
                .inProgressAttempts(inProgress)
                .autoSubmittedAttempts(autoSubmitted)
                .averageScore(averageScore)
                .highestScore(highestScore)
                .lowestScore(lowestScore)
                .averageTimeSpent(averageTimeSpent)
                .passedCount(passed)
                .failedCount(failed)
                .build();
    }

    /**
     * Records tab switch violation
     */
    @Transactional
    public void recordTabSwitch(UUID attemptId, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        ExamAttempt attempt = getAttemptEntity(attemptId);

        verifyAttemptOwnership(attempt, studentId);

        attempt.incrementTabSwitches();
        attemptRepository.save(attempt);
        log.warn("Tab switch recorded for attempt: {} (Total: {})", attemptId, attempt.getTabSwitches());
    }

    /**
     * Records webcam violation
     */
    @Transactional
    public void recordWebcamViolation(UUID attemptId, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        ExamAttempt attempt = getAttemptEntity(attemptId);

        verifyAttemptOwnership(attempt, studentId);

        attempt.incrementWebcamViolations();
        attemptRepository.save(attempt);
        log.warn("Webcam violation recorded for attempt: {} (Total: {})",
                attemptId, attempt.getWebcamViolations());
    }

    /**
     * Records custom violation
     */
    @Transactional
    public void recordCustomViolation(UUID attemptId, String violationType, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        ExamAttempt attempt = getAttemptEntity(attemptId);

        verifyAttemptOwnership(attempt, studentId);

        log.warn("Custom violation '{}' recorded for attempt: {}", violationType, attemptId);
        attemptRepository.save(attempt);
    }

    // ==================== Helper Methods ====================

    private ExamAttempt getAttemptEntity(UUID attemptId) {
        return attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));
    }

    /**
     * Fetches exam details from exam-service
     * Handles Feign exceptions properly
     */
    private ExamDTO getExamOrThrow(UUID examId) {
        try {
            ApiResponse<ExamDTO> response = examServiceClient.getExam(examId);
            if (response == null || !response.isSuccess() || response.getData() == null) {
                throw new ResourceNotFoundException("Exam not found with id: " + examId);
            }
            return response.getData();
        } catch (FeignException.NotFound e) {
            log.error("Exam not found: {}", examId);
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        } catch (FeignException e) {
            log.error("Error fetching exam details for exam {}: {}", examId, e.getMessage());
            throw new ServiceException("Failed to fetch exam details. Please try again later.");
        }
    }

    /**
     * Fetches exam questions from question-service for a student.
     * Handles Feign exceptions properly.
     */
    private List<StudentQuestionDTO> getExamQuestionsForStudentOrThrow(UUID examId, boolean shuffle) {
        try {
            ApiResponse<List<StudentQuestionDTO>> response = questionServiceClient.getExamQuestionsForStudent(examId, shuffle);
            if (response == null || !response.isSuccess() || response.getData() == null) {
                return Collections.emptyList();
            }
            return response.getData();
        } catch (FeignException.NotFound e) {
            log.error("Questions not found for exam: {}", examId);
            return Collections.emptyList();
        } catch (FeignException e) {
            log.error("Error fetching exam questions for exam {}: {}", examId, e.getMessage());
            throw new ServiceException("Failed to fetch exam questions. Please try again later.");
        }
    }

    /**
     * Validates if exam is available for attempting
     * Aligns with exam-service status model (DRAFT, PUBLISHED, ARCHIVED, CANCELLED)
     */
    private void validateExamForAttempt(ExamDTO exam) {
        // Check if exam is available for attempt based on its status
        if (!exam.getStatus().isAvailableForAttempt()) {
            throw new BadRequestException("Exam is not available for attempt. Current status: " + exam.getStatus());
        }

        // Check if exam is active
        if (!Boolean.TRUE.equals(exam.getIsActive())) {
            throw new BadRequestException("Exam is not active");
        }

        LocalDateTime now = LocalDateTime.now();

        // Check start time
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new BadRequestException("Exam has not started yet. Starts at: " + exam.getStartTime());
        }

        // Check end time
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new BadRequestException("Exam has ended. Ended at: " + exam.getEndTime());
        }
    }

    private void verifyAttemptOwnership(ExamAttempt attempt, UUID studentId) {
        if (!attempt.getStudentId().equals(studentId)) {
            throw new UnauthorizedException("Not authorized to access this attempt");
        }
    }

    private void verifyTeacherOrAdminRole(Authentication authentication) {
        String role = JwtUtils.getRole(authentication);
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_TEACHER".equals(role)) {
            throw new UnauthorizedException("Only teachers and admins can access this resource");
        }
    }

    private void updateAnswerFields(AttemptAnswer answer, SaveAnswerRequest request) {
        if (request.getSelectedOptions() != null) {
            answer.setSelectedOptions(request.getSelectedOptions());
        }
        if (request.getAnswerText() != null) {
            answer.setAnswerText(request.getAnswerText());
        }
        if (request.getFlagged() != null) {
            answer.setFlagged(request.getFlagged());
        }
        if (request.getTimeSpentSeconds() != null) {
            answer.setTimeSpentSeconds(request.getTimeSpentSeconds());
        }
    }

    /**
     * Auto-grades objective questions (MCQ, MULTIPLE_SELECT, TRUE_FALSE)
     * Subjective questions (SHORT_ANSWER, ESSAY) require manual grading
     */
    private void autoGradeAttempt(ExamAttempt attempt) {
        log.debug("Auto-grading attempt: {}", attempt.getId());

        List<UUID> questionIds = attempt.getAnswers().stream()
                .map(AttemptAnswer::getQuestionId)
                .collect(Collectors.toList());

        try {
            // Fetch all questions at once
            Map<UUID, QuestionDTO> questionMap = new HashMap<>();
            for (UUID questionId : questionIds) {
                try {
                    ApiResponse<QuestionDTO> response = questionServiceClient.getQuestion(questionId);
                    if (response != null && response.isSuccess() && response.getData() != null) {
                        questionMap.put(questionId, response.getData());
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch question: {}", questionId, e);
                }
            }

            if (questionMap.isEmpty()) {
                log.warn("No questions found for auto-grading attempt: {}", attempt.getId());
                return;
            }

            double totalMarks = 0.0;

            for (AttemptAnswer answer : attempt.getAnswers()) {
                QuestionDTO question = questionMap.get(answer.getQuestionId());
                if (question == null) continue;

                String questionType = question.getQuestionType();

                // Auto-grade MCQ (Single Correct Answer)
                if ("MCQ".equals(questionType)) {
                    if (answer.getAnswerText() != null && !answer.getAnswerText().trim().isEmpty()) {
                        boolean isCorrect = answer.getAnswerText().trim()
                                .equalsIgnoreCase(question.getCorrectAnswer() != null ? question.getCorrectAnswer().trim() : "");

                        answer.setIsCorrect(isCorrect);
                        answer.setMarksObtained(isCorrect ? answer.getMarksAllocated().doubleValue() : 0.0);
                        totalMarks += answer.getMarksObtained();
                    } else {
                        answer.setIsCorrect(false);
                        answer.setMarksObtained(0.0);
                    }
                }
                // Auto-grade TRUE_FALSE
                else if ("TRUE_FALSE".equals(questionType)) {
                    if (answer.getAnswerText() != null && question.getCorrectAnswer() != null) {
                        boolean isCorrect = answer.getAnswerText().trim()
                                .equalsIgnoreCase(question.getCorrectAnswer().trim());

                        answer.setIsCorrect(isCorrect);
                        answer.setMarksObtained(isCorrect ? answer.getMarksAllocated().doubleValue() : 0.0);
                        totalMarks += answer.getMarksObtained();
                    } else {
                        answer.setIsCorrect(false);
                        answer.setMarksObtained(0.0);
                    }
                }
                // SHORT_ANSWER and ESSAY require manual grading
                else if ("SHORT_ANSWER".equals(questionType) || "ESSAY".equals(questionType)) {
                    // Leave for manual grading
                    answer.setIsCorrect(null);
                    answer.setMarksObtained(null);
                }
            }

            attempt.setObtainedMarks(totalMarks);
            if (attempt.getTotalMarks() > 0) {
                attempt.setPercentage((totalMarks / attempt.getTotalMarks()) * 100);
            }
            attempt.updateAnsweredCount();

            log.debug("Auto-grading completed. Marks: {}/{}", totalMarks, attempt.getTotalMarks());

        } catch (Exception e) {
            log.error("Error during auto-grading for attempt: {}", attempt.getId(), e);
        }
    }
}
