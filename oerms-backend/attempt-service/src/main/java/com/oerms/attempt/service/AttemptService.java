package com.oerms.attempt.service;

import com.oerms.attempt.client.*;
import com.oerms.attempt.dto.*;
import com.oerms.attempt.entity.*;
import com.oerms.common.enums.AttemptStatus;
import com.oerms.common.enums.ExamStatus;
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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
        // Auto-submit attempts that haven't been updated in 24 hours
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        List<ExamAttempt> stalledAttempts = attemptRepository.findStalledAttempts(cutoffTime);

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
    public Long getStudentExamAttemptsCount(UUID examId, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Counting attempts for student: {} and exam: {}", studentId, examId);
        return attemptRepository.countByExamIdAndStudentId(examId, studentId);
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

    // Add these methods to AttemptService class

    // ==================== NEW IMPLEMENTATIONS ====================

    @Transactional
    public AttemptResponse pauseAttempt(UUID attemptId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Only IN_PROGRESS attempts can be paused");
        }

        attempt.setStatus(AttemptStatus.PAUSED);
        attempt.setPausedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        log.info("Attempt {} paused by student {}", attemptId, studentId);
        return attemptMapper.toResponse(attempt);
    }

    @Transactional
    public AttemptResponse resumeAttempt(UUID attemptId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        if (attempt.getStatus() != AttemptStatus.PAUSED) {
            throw new BadRequestException("Only PAUSED attempts can be resumed");
        }

        attempt.setStatus(AttemptStatus.IN_PROGRESS);
        attempt.setResumedAt(LocalDateTime.now());

        // Calculate pause duration and add to total time
        if (attempt.getPausedAt() != null) {
            long pauseDuration = java.time.Duration.between(
                    attempt.getPausedAt(), LocalDateTime.now()).toSeconds();
            attempt.addPauseDuration(pauseDuration);
        }

        attemptRepository.save(attempt);

        log.info("Attempt {} resumed by student {}", attemptId, studentId);
        return attemptMapper.toResponse(attempt);
    }

    @Transactional(readOnly = true)
    public AttemptStatusDTO getAttemptStatus(UUID attemptId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        LocalDateTime now = LocalDateTime.now();
        long elapsedSeconds = java.time.Duration.between(attempt.getStartedAt(), now).getSeconds();
        long examDurationSeconds = attempt.getExamDurationInMinutes() * 60L;
        long remainingSeconds = Math.max(0, examDurationSeconds - elapsedSeconds);

        return AttemptStatusDTO.builder()
                .attemptId(attemptId)
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .elapsedTimeSeconds(elapsedSeconds)
                .remainingTimeSeconds(remainingSeconds)
                .isExpired(remainingSeconds == 0)
                .canSubmit(attempt.canBeSubmitted())
                .build();
    }

    @Transactional(readOnly = true)
    public AttemptProgressDTO getAttemptProgress(UUID attemptId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        int totalQuestions = attempt.getTotalQuestions();
        int answeredCount = (int) attempt.getAnswers().stream()
                .filter(a -> a.getAnswerText() != null ||
                        (a.getSelectedOptions() != null && !a.getSelectedOptions().isEmpty()))
                .count();
        int unansweredCount = totalQuestions - answeredCount;
        int flaggedCount = (int) attempt.getAnswers().stream()
                .filter(a -> Boolean.TRUE.equals(a.getFlagged()))
                .count();

        double completionPercentage = totalQuestions > 0
                ? (double) answeredCount * 100 / totalQuestions
                : 0.0;

        return AttemptProgressDTO.builder()
                .attemptId(attemptId)
                .totalQuestions(totalQuestions)
                .answeredQuestions(answeredCount)
                .unansweredQuestions(unansweredCount)
                .flaggedQuestions(flaggedCount)
                .completionPercentage(completionPercentage)
                .build();
    }

    @Transactional
    public void saveProgress(UUID attemptId, SaveProgressRequest request, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        attempt.setLastActivityAt(LocalDateTime.now());
        if (request != null && request.getCurrentQuestionId() != null) {
            attempt.setCurrentQuestionId(request.getCurrentQuestionId());
        }
        attemptRepository.save(attempt);

        log.debug("Progress saved for attempt: {}", attemptId);
    }

    @Transactional
    public void clearAnswer(UUID attemptId, UUID questionId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        if (attempt.isFinalState()) {
            throw new BadRequestException("Cannot clear answers for finalized attempt");
        }

        AttemptAnswer answer = answerRepository.findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));

        answer.setAnswerText(null);
        answer.setSelectedOptions(new HashSet<>());
        answerRepository.save(answer);

        attempt.updateAnsweredCount();
        attemptRepository.save(attempt);

        log.info("Answer cleared for attempt: {}, question: {}", attemptId, questionId);
    }

    @Transactional
    public List<AttemptAnswerResponse> saveBulkAnswers(UUID attemptId,
                                                       List<SaveAnswerRequest> requests,
                                                       Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        if (attempt.isFinalState()) {
            throw new BadRequestException("Cannot save answers for finalized attempt");
        }

        List<AttemptAnswerResponse> responses = new ArrayList<>();

        for (SaveAnswerRequest request : requests) {
            try {
                AttemptAnswer answer = answerRepository
                        .findByAttemptIdAndQuestionId(attemptId, request.getQuestionId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Question not found: " + request.getQuestionId()));

                updateAnswerFields(answer, request);
                answerRepository.save(answer);
                responses.add(attemptMapper.toAnswerResponse(answer));

            } catch (Exception e) {
                log.error("Failed to save answer for question {}: {}",
                        request.getQuestionId(), e.getMessage());
            }
        }

        attempt.updateAnsweredCount();
        attempt.updateFlaggedCount();
        attemptRepository.save(attempt);

        log.info("Bulk saved {} answers for attempt: {}", responses.size(), attemptId);
        return responses;
    }

    @Transactional(readOnly = true)
    public AttemptAnswerResponse getAnswer(UUID attemptId, UUID questionId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        AttemptAnswer answer = answerRepository.findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));

        return attemptMapper.toAnswerResponse(answer);
    }

    @Transactional
    public void flagQuestion(UUID attemptId, UUID questionId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        AttemptAnswer answer = answerRepository.findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));

        answer.setFlagged(true);
        answerRepository.save(answer);

        attempt.updateFlaggedCount();
        attemptRepository.save(attempt);

        log.debug("Question flagged: {} in attempt: {}", questionId, attemptId);
    }

    @Transactional
    public void unflagQuestion(UUID attemptId, UUID questionId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        AttemptAnswer answer = answerRepository.findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));

        answer.setFlagged(false);
        answerRepository.save(answer);

        attempt.updateFlaggedCount();
        attemptRepository.save(attempt);

        log.debug("Question unflagged: {} in attempt: {}", questionId, attemptId);
    }

    @Transactional(readOnly = true)
    public List<UUID> getFlaggedQuestions(UUID attemptId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        return attempt.getAnswers().stream()
                .filter(a -> Boolean.TRUE.equals(a.getFlagged()))
                .map(AttemptAnswer::getQuestionId)
                .collect(Collectors.toList());
    }

    @Transactional
    public void sendHeartbeat(UUID attemptId, ProctoringHeartbeatRequest request, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        attempt.setLastActivityAt(LocalDateTime.now());

        // Store heartbeat data if needed
        if (request.getCurrentQuestionId() != null) {
            attempt.setCurrentQuestionId(request.getCurrentQuestionId());
        }

        attemptRepository.save(attempt);
        log.trace("Heartbeat received for attempt: {}", attemptId);
    }

    @Transactional
    public void uploadScreenshot(UUID attemptId, MultipartFile screenshot, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        // Store screenshot - would integrate with file storage service
        log.info("Screenshot uploaded for attempt: {}, size: {} bytes",
                attemptId, screenshot.getSize());
    }

    @Transactional
    public void uploadWebcamFrame(UUID attemptId, MultipartFile frame, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        // Store webcam frame - would integrate with file storage service
        log.info("Webcam frame uploaded for attempt: {}, size: {} bytes",
                attemptId, frame.getSize());
    }

    @Transactional(readOnly = true)
    public ProctoringSummaryDTO getProctoringSummary(UUID attemptId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);

        return ProctoringSummaryDTO.builder()
                .attemptId(attemptId)
                .totalTabSwitches(attempt.getTabSwitches())
                .totalWebcamViolations(attempt.getWebcamViolations())
                .totalViolations(attempt.getTabSwitches() + attempt.getWebcamViolations())
                .isSuspicious(attempt.getTabSwitches() > 5 || attempt.getWebcamViolations() > 3)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ViolationDetailDTO> getViolations(UUID attemptId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);

        List<ViolationDetailDTO> violations = new ArrayList<>();

        // Add tab switch violations
        for (int i = 0; i < attempt.getTabSwitches(); i++) {
            violations.add(ViolationDetailDTO.builder()
                    .type("TAB_SWITCH")
                    .severity("MEDIUM")
                    .description("Student switched browser tab")
                    .build());
        }

        // Add webcam violations
        for (int i = 0; i < attempt.getWebcamViolations(); i++) {
            violations.add(ViolationDetailDTO.builder()
                    .type("WEBCAM_VIOLATION")
                    .severity("HIGH")
                    .description("Face not detected or multiple faces")
                    .build());
        }

        return violations;
    }

    @Transactional(readOnly = true)
    public List<ProctoringEventDTO> getProctoringTimeline(UUID attemptId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);

        List<ProctoringEventDTO> timeline = new ArrayList<>();

        timeline.add(ProctoringEventDTO.builder()
                .eventType("ATTEMPT_STARTED")
                .timestamp(attempt.getStartedAt())
                .description("Exam attempt started")
                .build());

        if (attempt.getSubmittedAt() != null) {
            timeline.add(ProctoringEventDTO.builder()
                    .eventType("ATTEMPT_SUBMITTED")
                    .timestamp(attempt.getSubmittedAt())
                    .description("Exam attempt submitted")
                    .build());
        }

        return timeline;
    }

    @Transactional(readOnly = true)
    public AttemptAnalyticsDTO getExamAttemptAnalytics(UUID examId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        List<ExamAttempt> attempts = attemptRepository.findByExamId(examId);

        long totalAttempts = attempts.size();
        long completedAttempts = attempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED ||
                        a.getStatus() == AttemptStatus.AUTO_SUBMITTED)
                .count();

        double averageTime = attempts.stream()
                .filter(a -> a.getTimeTakenSeconds() != null)
                .mapToLong(ExamAttempt::getTimeTakenSeconds)
                .average()
                .orElse(0.0);

        double averageTabSwitches = attempts.stream()
                .mapToInt(ExamAttempt::getTabSwitches)
                .average()
                .orElse(0.0);

        return AttemptAnalyticsDTO.builder()
                .examId(examId)
                .totalAttempts(totalAttempts)
                .completedAttempts(completedAttempts)
                .inProgressAttempts(totalAttempts - completedAttempts)
                .averageCompletionTime(averageTime)
                .averageTabSwitches(averageTabSwitches)
                .build();
    }

    @Transactional(readOnly = true)
    public TimeBreakdownDTO getTimeBreakdown(UUID attemptId, Authentication auth) {
        ExamAttempt attempt = getAttemptEntity(attemptId);

        boolean isInternal = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("SCOPE_internal"));

        if (!isInternal) {
            UUID userId = JwtUtils.getUserId(auth);
            String role = JwtUtils.getRole(auth);

            if (!attempt.getStudentId().equals(userId) &&
                    !role.equals("ROLE_ADMIN") && !role.equals("ROLE_TEACHER")) {
                throw new UnauthorizedException("Not authorized");
            }
        }

        List<TimeBreakdownDTO.QuestionTimeDTO> questionTimes = attempt.getAnswers().stream()
                .map(answer -> TimeBreakdownDTO.QuestionTimeDTO.builder()
                        .questionId(answer.getQuestionId())
                        .questionOrder(answer.getQuestionOrder())
                        .timeSpentSeconds(answer.getTimeSpentSeconds() != null
                                ? answer.getTimeSpentSeconds()
                                : 0L)
                        .build())
                .collect(Collectors.toList());

        return TimeBreakdownDTO.builder()
                .attemptId(attemptId)
                .totalTimeSeconds(attempt.getTimeTakenSeconds() != null ? attempt.getTimeTakenSeconds().longValue() : 0L)
                .questionTimeBreakdown(questionTimes)
                .build();
    }

    @Transactional(readOnly = true)
    public CompletionStatsDTO getCompletionStats(UUID examId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        List<ExamAttempt> attempts = attemptRepository.findByExamId(examId);

        long completed = attempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED)
                .count();

        long autoSubmitted = attempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.AUTO_SUBMITTED)
                .count();

        long abandoned = attempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.IN_PROGRESS &&
                        a.getStartedAt().plusMinutes(a.getExamDurationInMinutes() + 30)
                                .isBefore(LocalDateTime.now()))
                .count();

        return CompletionStatsDTO.builder()
                .examId(examId)
                .totalAttempts((long) attempts.size())
                .completedCount(completed)
                .autoSubmittedCount(autoSubmitted)
                .abandonedCount(abandoned)
                .completionRate(attempts.size() > 0 ? (double) completed * 100 / attempts.size() : 0.0)
                .build();
    }

    @Transactional(readOnly = true)
    public Double getAverageCompletionTime(UUID examId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        return attemptRepository.findByExamId(examId).stream()
                .filter(a -> a.getTimeTakenSeconds() != null)
                .mapToLong(ExamAttempt::getTimeTakenSeconds)
                .average()
                .orElse(0.0);
    }

    @Transactional(readOnly = true)
    public CanStartAttemptDTO canStartAttempt(UUID examId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);

        ExamDTO exam = getExamOrThrow(examId);
        boolean canStart = true;
        List<String> reasons = new ArrayList<>();

        // Check exam status
        if (!ExamStatus.valueOf(exam.getStatus()).isAvailableForAttempt()) {
            canStart = false;
            reasons.add("Exam is not available");
        }

        // Check if already has IN_PROGRESS attempt
        Optional<ExamAttempt> existingAttempt = attemptRepository
                .findActiveAttemptForStudent(examId, studentId);
        if (existingAttempt.isPresent()) {
            canStart = false;
            reasons.add("You already have an active attempt");
        }

        // Check attempt limits
        if (exam.getMaxAttempts() != null && exam.getMaxAttempts() > 0) {
            long attemptCount = attemptRepository.countByExamIdAndStudentId(examId, studentId);
            if (attemptCount >= exam.getMaxAttempts()) {
                canStart = false;
                reasons.add("Maximum attempts reached");
            }
        }

        return CanStartAttemptDTO.builder()
                .canStart(canStart)
                .reasons(reasons)
                .build();
    }

    @Transactional(readOnly = true)
    public CanSubmitDTO canSubmit(UUID attemptId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        boolean canSubmit = attempt.canBeSubmitted();
        List<String> reasons = new ArrayList<>();

        if (attempt.isFinalState()) {
            canSubmit = false;
            reasons.add("Attempt already finalized");
        }

        if (attempt.getStatus() == AttemptStatus.PAUSED) {
            canSubmit = false;
            reasons.add("Resume attempt before submitting");
        }

        return CanSubmitDTO.builder()
                .canSubmit(canSubmit)
                .reasons(reasons)
                .build();
    }

    @Transactional(readOnly = true)
    public Integer getRemainingAttempts(UUID examId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        ExamDTO exam = getExamOrThrow(examId);

        if (exam.getMaxAttempts() == null || exam.getMaxAttempts() == 0) {
            return Integer.MAX_VALUE; // Unlimited attempts
        }

        long attemptCount = attemptRepository.countByExamIdAndStudentId(examId, studentId);
        return Math.max(0, exam.getMaxAttempts() - (int) attemptCount);
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getSuspiciousAttempts(Pageable pageable, Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        return attemptRepository.findSuspiciousAttempts(pageable)
                .map(attemptMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public List<AttemptSummary> getSuspiciousExamAttempts(UUID examId, Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        return attemptRepository.findSuspiciousAttemptsByExam(examId).stream()
                .map(attemptMapper::toSummary)
                .collect(Collectors.toList());
    }

    @Transactional
    public void flagAsSuspicious(UUID attemptId, FlagSuspiciousRequest request, Authentication auth) {
        verifyTeacherOrAdminRole(auth);
        ExamAttempt attempt = getAttemptEntity(attemptId);

        attempt.setFlaggedAsSuspicious(true);
        attempt.setSuspiciousReason(request.getReason());
        attemptRepository.save(attempt);

        log.warn("Attempt {} flagged as suspicious: {}", attemptId, request.getReason());
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> searchAttempts(UUID examId, UUID studentId, String status,
                                               Boolean suspicious, LocalDateTime startDate,
                                               LocalDateTime endDate, Pageable pageable,
                                               Authentication auth) {
        verifyTeacherOrAdminRole(auth);

        AttemptStatus attemptStatus = status != null ? AttemptStatus.valueOf(status) : null;

        return attemptRepository.searchAttempts(
                        examId, studentId, attemptStatus, suspicious, startDate, endDate, pageable)
                .map(attemptMapper::toSummary);
    }

    @Transactional
    public BulkOperationResultDTO bulkSubmit(List<UUID> attemptIds, Authentication auth) {
        if (!JwtUtils.getRole(auth).equals("ROLE_ADMIN")) {
            throw new UnauthorizedException("Only admins can bulk submit");
        }

        List<UUID> successful = new ArrayList<>();
        Map<UUID, String> failed = new HashMap<>();

        for (UUID attemptId : attemptIds) {
            try {
                ExamAttempt attempt = attemptRepository.findByIdWithLock(attemptId)
                        .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

                if (attempt.isFinalState()) {
                    failed.put(attemptId, "Already finalized");
                    continue;
                }

                attempt.setStatus(AttemptStatus.AUTO_SUBMITTED);
                attempt.setSubmittedAt(LocalDateTime.now());
                attempt.setTimeTakenSeconds(attempt.calculateTimeTaken());
                attempt.setAutoSubmitted(true);

                attemptRepository.save(attempt);
                eventProducer.publishAttemptAutoSubmitted(attempt);

                successful.add(attemptId);

            } catch (Exception e) {
                failed.put(attemptId, e.getMessage());
                log.error("Failed to bulk submit attempt {}: {}", attemptId, e.getMessage());
            }
        }

        return BulkOperationResultDTO.builder()
                .totalRequested(attemptIds.size())
                .successful(successful.size())
                .failed(failed.size())
                .successfulIds(successful)
                .failedItems(failed)
                .build();
    }

    @Transactional
    public BulkOperationResultDTO bulkDelete(List<UUID> attemptIds, Authentication auth) {
        if (!JwtUtils.getRole(auth).equals("ROLE_ADMIN")) {
            throw new UnauthorizedException("Only admins can bulk delete");
        }

        List<UUID> successful = new ArrayList<>();
        Map<UUID, String> failed = new HashMap<>();

        for (UUID attemptId : attemptIds) {
            try {
                ExamAttempt attempt = getAttemptEntity(attemptId);
                attemptRepository.delete(attempt);
                successful.add(attemptId);

            } catch (Exception e) {
                failed.put(attemptId, e.getMessage());
                log.error("Failed to bulk delete attempt {}: {}", attemptId, e.getMessage());
            }
        }

        return BulkOperationResultDTO.builder()
                .totalRequested(attemptIds.size())
                .successful(successful.size())
                .failed(failed.size())
                .successfulIds(successful)
                .failedItems(failed)
                .build();
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
        if (!ExamStatus.valueOf(exam.getStatus()).isAvailableForAttempt()) {
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
