package com.oerms.attempt.service;

import com.oerms.attempt.client.*;
import com.oerms.attempt.dto.*;
import com.oerms.attempt.entity.*;
import com.oerms.common.enums.AttemptStatus;
import com.oerms.attempt.kafka.AttemptEventProducer;
import com.oerms.attempt.mapper.AttemptMapper;
import com.oerms.attempt.repository.*;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.ExamDTO;
import com.oerms.common.dto.StudentQuestionDTO;
import com.oerms.common.exception.*;
import com.oerms.common.util.JwtUtils;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

import static com.oerms.common.constant.Constants.Roles.ROLE_ADMIN;
import static com.oerms.common.constant.Constants.Roles.ROLE_TEACHER;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository answerRepository;
    private final AttemptMapper attemptMapper;
    private final ExamServiceClient examServiceClient;
    private final StudentQuestionServiceClient studentQuestionServiceClient;
    private final AttemptEventProducer eventProducer;

    @Transactional
    public AttemptResponse startAttempt(
            StartAttemptRequest request,
            String ipAddress,
            String userAgent,
            Authentication authentication) {

        UUID studentId = JwtUtils.getUserId(authentication);
        String studentName = JwtUtils.getUsername(authentication);

        try {
            // Check for existing IN_PROGRESS attempt with lock
            Optional<ExamAttempt> existingAttempt = attemptRepository
                    .findActiveAttemptForStudent(request.getExamId(), studentId);

            if (existingAttempt.isPresent()) {
                log.info("Returning existing IN_PROGRESS attempt for examId: {}, studentId: {}",
                        request.getExamId(), studentId);
                return attemptMapper.toResponse(existingAttempt.get());
            }

            ExamDTO exam = getExamOrThrow(request.getExamId());
            validateExamForAttempt(exam);

            long attemptCount = attemptRepository.countByExamIdAndStudentId(request.getExamId(), studentId);

            List<StudentQuestionDTO> questions = getExamQuestionsForStudentOrThrow(
                    request.getExamId(), exam.getShuffleQuestions());

            if (questions.isEmpty()) {
                throw new BadRequestException("Exam has no questions");
            }

            ExamAttempt attempt = createNewAttempt(
                    request, studentId, studentName, ipAddress, userAgent, exam, questions, attemptCount
            );

            attempt = attemptRepository.saveAndFlush(attempt);
            log.info("New attempt created: attemptId: {}, attemptNumber: {}", attempt.getId(), attempt.getAttemptNumber());
            return attemptMapper.toResponse(attempt);

        } catch (DataIntegrityViolationException ex) {
            // Race condition detected - another request created an IN_PROGRESS attempt
            log.warn("Race condition detected while starting attempt. Fetching existing attempt. examId: {}, studentId: {}",
                    request.getExamId(), studentId);

            ExamAttempt existing = attemptRepository
                    .findActiveAttemptForStudent(request.getExamId(), studentId)
                    .orElseThrow(() -> new ServiceException("Failed to retrieve attempt after race condition"));

            return attemptMapper.toResponse(existing);
        }
    }

    @Transactional
    @CacheEvict(value = "attempts", key = "#attemptId")
    public AttemptAnswerResponse saveAnswer(UUID attemptId, SaveAnswerRequest request,
                                            Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Saving answer for attemptId: {}, questionId: {}, studentId: {}",
                attemptId, request.getQuestionId(), studentId);

        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        // Don't allow saving answers if attempt is in final state
        if (attempt.isFinalState()) {
            log.warn("Attempt to save answer for finalized attemptId: {}. Status: {}. Returning existing answer.",
                    attemptId, attempt.getStatus());
            return answerRepository.findByAttemptIdAndQuestionId(attemptId, request.getQuestionId())
                    .map(attemptMapper::toAnswerResponse)
                    .orElseThrow(() -> new BadRequestException("Attempt is no longer active"));
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            log.warn("Attempt to save answer for non-active attemptId: {}. Status: {}.",
                    attemptId, attempt.getStatus());
            throw new BadRequestException("Cannot save answers for attempt with status: " + attempt.getStatus());
        }

        AttemptAnswer answer = answerRepository
                .findByAttemptIdAndQuestionId(attemptId, request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found in attempt: " + request.getQuestionId()));

        updateAnswerFields(answer, request);
        answerRepository.save(answer);

        attempt.updateAnsweredCount();
        attempt.updateFlaggedCount();
        attemptRepository.save(attempt);

        log.info("Answer saved successfully for attemptId: {}, questionId: {}", attemptId, request.getQuestionId());
        return attemptMapper.toAnswerResponse(answer);
    }

    @Transactional
    @CacheEvict(value = "attempts", key = "#request.attemptId")
    public AttemptResponse submitAttempt(SubmitAttemptRequest request, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.info("Attempt submission initiated for attemptId: {} by studentId: {}",
                request.getAttemptId(), studentId);

        try {
            // Use pessimistic write lock to prevent concurrent modifications
            ExamAttempt attempt = attemptRepository.findByIdWithLock(request.getAttemptId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Attempt not found with id: " + request.getAttemptId()));

            verifyAttemptOwnership(attempt, studentId);

            // Idempotency check - if already in final state, return current state
            if (attempt.isFinalState()) {
                log.info("Attempt already in final state: {}. Returning current state without modification.",
                        attempt.getStatus());
                return attemptMapper.toResponse(attempt);
            }

            // Validate that attempt can be submitted
            if (!attempt.canBeSubmitted()) {
                throw new BadRequestException(
                        "Cannot submit attempt with status: " + attempt.getStatus());
            }

            // Update attempt to SUBMITTED state
            attempt.setStatus(AttemptStatus.SUBMITTED);
            attempt.setSubmittedAt(LocalDateTime.now());
            attempt.setTimeTakenSeconds(attempt.calculateTimeTaken());
            attempt.setNotes(request.getNotes());
            attempt.setAutoSubmitted(false);

            log.info("Attempt {} marked as SUBMITTED.", attempt.getId());

            // Use saveAndFlush to ensure immediate persistence
            attempt = attemptRepository.saveAndFlush(attempt);
            log.info("Attempt submitted successfully for attemptId: {}.", attempt.getId());

            // Publish event after successful save
            eventProducer.publishAttemptSubmitted(attempt);

            return attemptMapper.toResponse(attempt);

        } catch (DataIntegrityViolationException ex) {
            // Handle race condition - another request may have submitted concurrently
            log.warn("Race condition detected during submit for attemptId: {}. Fetching current state.",
                    request.getAttemptId());

            // Fetch the current state without lock (to avoid deadlock)
            ExamAttempt attempt = attemptRepository.findById(request.getAttemptId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Attempt not found with id: " + request.getAttemptId()));

            verifyAttemptOwnership(attempt, studentId);

            log.info("Returning current attempt state after race condition. Status: {}", attempt.getStatus());
            return attemptMapper.toResponse(attempt);
        }
    }

    @Transactional
    public void autoSubmitExpiredAttempts() {
        List<ExamAttempt> stalledAttempts = attemptRepository.findStalledAttempts();

        if (stalledAttempts.isEmpty()) {
            log.info("No expired attempts to auto-submit.");
            return;
        }

        log.info("Found {} expired attempts to auto-submit.", stalledAttempts.size());

        for (ExamAttempt attempt : stalledAttempts) {
            try {
                log.warn("Auto-submitting attemptId: {} which started at {}",
                        attempt.getId(), attempt.getStartedAt());

                attempt.setStatus(AttemptStatus.AUTO_SUBMITTED);
                attempt.setSubmittedAt(LocalDateTime.now());
                attempt.setTimeTakenSeconds(attempt.calculateTimeTaken());
                attempt.setAutoSubmitted(true);

                attemptRepository.saveAndFlush(attempt);
                eventProducer.publishAttemptAutoSubmitted(attempt);

                log.info("Successfully auto-submitted attemptId: {}", attempt.getId());

            } catch (Exception ex) {
                log.error("Failed to auto-submit attemptId: {}. Error: {}",
                        attempt.getId(), ex.getMessage(), ex);
                // Continue with next attempt
            }
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "attempts", key = "#attemptId")
    public AttemptResponse getAttempt(UUID attemptId, Authentication authentication) {
        log.debug("Fetching attempt details for attemptId: {}", attemptId);
        ExamAttempt attempt = getAttemptEntity(attemptId);

        boolean isInternal = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("SCOPE_internal"));

        if (!isInternal) {
            UUID currentUserId = JwtUtils.getUserId(authentication);
            String role = JwtUtils.getRole(authentication);

            if (!attempt.getStudentId().equals(currentUserId) &&
                    !ROLE_ADMIN.equals(role) && !ROLE_TEACHER.equals(role)) {
                log.warn("Unauthorized attempt to view attemptId: {} by userId: {}",
                        attemptId, currentUserId);
                throw new UnauthorizedException("Not authorized to view this attempt");
            }
        }
        return attemptMapper.toResponse(attempt);
    }

    @Transactional(readOnly = true)
    public List<AttemptAnswerResponse> getAttemptAnswers(UUID attemptId, Authentication authentication) {
        log.debug("Fetching answers for attempt: {}", attemptId);
        ExamAttempt attempt = getAttemptEntity(attemptId);

        boolean isInternal = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("SCOPE_internal"));

        if (!isInternal) {
            UUID currentUserId = JwtUtils.getUserId(authentication);
            String role = JwtUtils.getRole(authentication);

            if (!attempt.getStudentId().equals(currentUserId) &&
                    !ROLE_ADMIN.equals(role) && !ROLE_TEACHER.equals(role)) {
                log.warn("Unauthorized attempt to view answers for attemptId: {} by userId: {}",
                        attemptId, currentUserId);
                throw new UnauthorizedException("Not authorized to view this attempt");
            }
        }
        return attempt.getAnswers().stream()
                .sorted(Comparator.comparingInt(AttemptAnswer::getQuestionOrder))
                .map(attemptMapper::toAnswerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getStudentAttempts(Pageable pageable, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Fetching attempts for student: {}", studentId);
        return attemptRepository.findByStudentId(studentId, pageable)
                .map(attemptMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getStudentExamAttempts(UUID examId, Pageable pageable,
                                                       Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Fetching attempts for student: {} and exam: {}", studentId, examId);
        return attemptRepository.findByExamIdAndStudentId(examId, studentId, pageable)
                .map(attemptMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Long getStudentAttemptsCount(Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Counting attempts for student: {}", studentId);
        return attemptRepository.countByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getExamAttempts(UUID examId, Pageable pageable,
                                                Authentication authentication) {
        log.debug("Fetching attempts for exam: {}", examId);
        verifyTeacherOrAdminRole(authentication);
        return attemptRepository.findByExamId(examId, pageable)
                .map(attemptMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Long getExamAttemptsCount(UUID examId, Authentication authentication) {
        log.debug("Counting attempts for exam: {}", examId);
        verifyTeacherOrAdminRole(authentication);
        return attemptRepository.countByExamId(examId);
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getStudentAttemptsAdmin(UUID studentId, Pageable pageable) {
        log.debug("Admin fetching attempts for student: {}", studentId);
        return attemptRepository.findByStudentId(studentId, pageable)
                .map(attemptMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getAllAttempts(Pageable pageable) {
        log.debug("Admin fetching all attempts");
        return attemptRepository.findAll(pageable)
                .map(attemptMapper::toSummary);
    }

    @Transactional
    public void recordTabSwitch(UUID attemptId, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        if (!attempt.isFinalState()) {
            attempt.incrementTabSwitches();
            attemptRepository.save(attempt);
            log.warn("Tab switch recorded for attemptId: {}. Total: {}",
                    attemptId, attempt.getTabSwitches());
        } else {
            log.debug("Ignoring tab switch for finalized attemptId: {}", attemptId);
        }
    }

    @Transactional
    public void recordWebcamViolation(UUID attemptId, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        if (!attempt.isFinalState()) {
            attempt.incrementWebcamViolations();
            attemptRepository.save(attempt);
            log.warn("Webcam violation recorded for attemptId: {}. Total: {}",
                    attemptId, attempt.getWebcamViolations());
        } else {
            log.debug("Ignoring webcam violation for finalized attemptId: {}", attemptId);
        }
    }

    // Private helper methods

    private ExamAttempt createNewAttempt(StartAttemptRequest request, UUID studentId,
                                         String studentName, String ipAddress,
                                         String userAgent, ExamDTO exam,
                                         List<StudentQuestionDTO> questions,
                                         long attemptCount) {
        ExamAttempt attempt = ExamAttempt.builder()
                .examId(request.getExamId())
                .examTitle(exam.getTitle())
                .studentId(studentId)
                .studentName(studentName)
                .attemptNumber((int) attemptCount + 1)
                .status(AttemptStatus.IN_PROGRESS)
                .totalQuestions(questions.size())
                .totalMarks(questions.stream()
                        .filter(q -> q.getMarks() != null)
                        .mapToInt(StudentQuestionDTO::getMarks)
                        .sum())
                .startedAt(LocalDateTime.now())
                .examDurationInMinutes(exam.getDuration())
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

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
        return attempt;
    }

    private ExamAttempt getAttemptEntity(UUID attemptId) {
        return attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attempt not found with id: " + attemptId));
    }

    private ExamDTO getExamOrThrow(UUID examId) {
        try {
            log.debug("Fetching exam details from exam-service for examId: {}", examId);
            ApiResponse<ExamDTO> response = examServiceClient.getExam(examId);
            if (response == null || !response.isSuccess() || response.getData() == null) {
                log.error("Invalid response from exam-service for examId: {}. Response: {}",
                        examId, response);
                throw new ResourceNotFoundException("Exam not found with id: " + examId);
            }
            return response.getData();
        } catch (FeignException e) {
            log.error("Feign error fetching exam details for examId: {}. Status: {}, Body: {}",
                    examId, e.status(), e.contentUTF8(), e);
            throw new ServiceException("Failed to fetch exam details. Please try again later.");
        }
    }

    private List<StudentQuestionDTO> getExamQuestionsForStudentOrThrow(UUID examId, boolean shuffle) {
        try {
            log.debug("Fetching student questions from question-service for examId: {}", examId);
            ApiResponse<List<StudentQuestionDTO>> response =
                    studentQuestionServiceClient.getExamQuestionsForStudent(examId, shuffle);
            if (response == null || !response.isSuccess() || response.getData() == null) {
                log.warn("No student questions found or invalid response for examId: {}", examId);
                return Collections.emptyList();
            }
            return response.getData();
        } catch (FeignException e) {
            log.error("Feign error fetching student questions for examId: {}. Status: {}, Body: {}",
                    examId, e.status(), e.contentUTF8(), e);
            throw new ServiceException("Failed to fetch exam questions. Please try again later.");
        }
    }

    private void validateExamForAttempt(ExamDTO exam) {
        if (!exam.getStatus().isAvailableForAttempt()) {
            throw new BadRequestException(
                    "Exam is not available for attempt. Current status: " + exam.getStatus());
        }
        if (!Boolean.TRUE.equals(exam.getIsActive())) {
            throw new BadRequestException("Exam is not active");
        }
        LocalDateTime now = LocalDateTime.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new BadRequestException(
                    "Exam has not started yet. Starts at: " + exam.getStartTime());
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new BadRequestException(
                    "Exam has ended. Ended at: " + exam.getEndTime());
        }
    }

    private void verifyAttemptOwnership(ExamAttempt attempt, UUID studentId) {
        if (!attempt.getStudentId().equals(studentId)) {
            log.warn("Ownership verification failed. Attempt {} belongs to student {}, " +
                            "but was accessed by student {}",
                    attempt.getId(), attempt.getStudentId(), studentId);
            throw new UnauthorizedException("Not authorized to access this attempt");
        }
    }

    private void verifyTeacherOrAdminRole(Authentication authentication) {
        String role = JwtUtils.getRole(authentication);
        if (!ROLE_ADMIN.equals(role) && !ROLE_TEACHER.equals(role)) {
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

    public void recordCustomViolation(UUID attemptId, String violationType,
                                      Authentication authentication) {
        // Implementation for custom violations if needed
        log.info("Custom violation recorded: {} for attemptId: {}", violationType, attemptId);
    }
}