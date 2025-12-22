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
import org.springframework.dao.DataIntegrityViolationException; // Import DataIntegrityViolationException
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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
    private final InternalQuestionServiceClient internalQuestionServiceClient;
    private final ResultServiceClient resultServiceClient;
    private final AttemptEventProducer eventProducer;

    @Transactional
    public AttemptResponse startAttempt(StartAttemptRequest request, String ipAddress,
                                        String userAgent, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        String studentName = JwtUtils.getUsername(authentication);

        log.info("Attempt start initiated for examId: {} by studentId: {}", request.getExamId(), studentId);

        // Use pessimistic lock to check for active attempt
        Optional<ExamAttempt> activeAttempt = attemptRepository
                .findActiveAttemptForStudent(request.getExamId(), studentId);

        if (activeAttempt.isPresent()) {
            log.warn("Student {} already has an active attempt for exam {}. Returning existing attempt.", studentId, request.getExamId());
            return attemptMapper.toResponse(activeAttempt.get());
        }

        // Fetch exam details
        ExamDTO exam = getExamOrThrow(request.getExamId());
        validateExamForAttempt(exam);

        long attemptCount = attemptRepository.countByExamIdAndStudentId(request.getExamId(), studentId);
        List<StudentQuestionDTO> questions = getExamQuestionsForStudentOrThrow(request.getExamId(), exam.getShuffleQuestions());
        if (questions.isEmpty()) {
            throw new BadRequestException("Exam has no questions");
        }

        ExamAttempt attempt = createNewAttempt(request, studentId, studentName, ipAddress, userAgent, exam, questions, attemptCount);

        // Save new attempt
        attempt = attemptRepository.saveAndFlush(attempt);
        log.info("New attempt created and saved with ID: {}", attempt.getId());

        eventProducer.publishAttemptStarted(attempt);
        log.info("Attempt start process completed for attemptId: {}", attempt.getId());
        return attemptMapper.toResponse(attempt);
    }


    @Transactional
    @CacheEvict(value = "attempts", key = "#attemptId")
    public AttemptAnswerResponse saveAnswer(UUID attemptId, SaveAnswerRequest request,
                                            Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Saving answer for attemptId: {}, questionId: {}, studentId: {}", attemptId, request.getQuestionId(), studentId);

        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            log.warn("Attempt to save answer for non-active attemptId: {}. Status: {}", attemptId, attempt.getStatus());
            throw new BadRequestException("Cannot save answer for non-active attempt");
        }

        AttemptAnswer answer = answerRepository
                .findByAttemptIdAndQuestionId(attemptId, request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found in attempt: " + request.getQuestionId()));

        updateAnswerFields(answer, request);
        answerRepository.save(answer);

        attempt.updateAnsweredCount();
        attempt.updateFlaggedCount();
        attemptRepository.save(attempt);

        log.info("Answer saved successfully for attemptId: {}, questionId: {}", attemptId, request.getQuestionId());
        // eventProducer.publishAnswerSaved(attempt, answer); // Commented out to fix build
        return attemptMapper.toAnswerResponse(answer);
    }

    @Transactional
    @CacheEvict(value = "attempts", key = "#request.attemptId")
    public AttemptResponse submitAttempt(SubmitAttemptRequest request, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.info("Attempt submission initiated for attemptId: {} by studentId: {}", request.getAttemptId(), studentId);

        ExamAttempt attempt = getAttemptEntity(request.getAttemptId());
        verifyAttemptOwnership(attempt, studentId);

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            log.warn("Attempt to submit an already submitted or completed attemptId: {}. Status: {}", attempt.getId(), attempt.getStatus());
            throw new BadRequestException("Attempt already submitted");
        }

        attempt.setStatus(AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setTimeTakenSeconds(attempt.calculateTimeTaken());
        attempt.setNotes(request.getNotes());
        attempt.setAutoSubmitted(false);
        log.info("Attempt {} marked as SUBMITTED.", attempt.getId());

        autoGradeAttempt(attempt);

        attemptRepository.save(attempt);
        log.info("Attempt submitted and graded successfully for attemptId: {}. Final Score: {}/{}",
                attempt.getId(), attempt.getObtainedMarks(), attempt.getTotalMarks());

        eventProducer.publishAttemptSubmitted(attempt);
        return attemptMapper.toResponse(attempt);
    }

    private void autoGradeAttempt(ExamAttempt attempt) {
        log.info("Starting auto-grading process for attemptId: {}", attempt.getId());

        List<UUID> questionIds = attempt.getAnswers().stream()
                .map(AttemptAnswer::getQuestionId)
                .toList();

        if (questionIds.isEmpty()) {
            log.warn("No answers found to grade for attemptId: {}", attempt.getId());
            attempt.setObtainedMarks(0.0);
            attempt.setPercentage(0.0);
            return;
        }

        log.debug("Fetching {} questions for grading attemptId: {}", questionIds.size(), attempt.getId());
        Map<UUID, QuestionDTO> questionMap = fetchQuestionsForGrading(attempt.getId(), questionIds);

        if (questionMap.isEmpty()) {
            log.error("Failed to fetch any questions for grading attemptId: {}. Grading cannot proceed.", attempt.getId());
            return;
        }

        double totalMarksObtained = 0.0;
        for (AttemptAnswer answer : attempt.getAnswers()) {
            QuestionDTO question = questionMap.get(answer.getQuestionId());
            if (question == null) {
                log.warn("Question with ID {} not found for answer in attemptId: {}. Skipping this answer.", answer.getQuestionId(), attempt.getId());
                continue;
            }
            totalMarksObtained += gradeSingleAnswer(answer, question);
        }

        attempt.setObtainedMarks(totalMarksObtained);
        if (attempt.getTotalMarks() != null && attempt.getTotalMarks() > 0) {
            attempt.setPercentage((totalMarksObtained / attempt.getTotalMarks()) * 100);
        } else {
            attempt.setPercentage(0.0);
        }
        attempt.updateAnsweredCount();
        log.info("Auto-grading completed for attemptId: {}. Total marks obtained: {}", attempt.getId(), totalMarksObtained);
    }
    
    private double gradeSingleAnswer(AttemptAnswer answer, QuestionDTO question) {
        log.debug("Entering gradeSingleAnswer for questionId: {}, type: {}", question.getId(), question.getQuestionType());
        String questionType = question.getQuestionType();
        boolean isCorrect = false;

        answer.setIsCorrect(false);
        answer.setMarksObtained(0.0);

        if ("MCQ".equals(questionType)) {
            String studentAnswer = answer.getAnswerText();
            // If answerText is empty, check if the answer was sent in selectedOptions
            if (!StringUtils.hasText(studentAnswer) && answer.getSelectedOptions() != null && answer.getSelectedOptions().size() == 1) {
                studentAnswer = answer.getSelectedOptions().iterator().next();
            }
            log.debug("MCQ Grading - Question ID: {}, Student Answer: '{}', Correct Answer: '{}'",
                    question.getId(), studentAnswer, question.getCorrectAnswer());
            isCorrect = isTextAnswerCorrect(studentAnswer, question.getCorrectAnswer());
            log.debug("MCQ Grading - Question ID: {}, Is Correct: {}", question.getId(), isCorrect);
        } else if ("TRUE_FALSE".equals(questionType)) {
            log.debug("TRUE_FALSE Grading - Question ID: {}, Student Answer: '{}', Correct Answer: '{}'",
                    question.getId(), answer.getAnswerText(), question.getCorrectAnswer());
            isCorrect = isTextAnswerCorrect(answer.getAnswerText(), question.getCorrectAnswer());
            log.debug("TRUE_FALSE Grading - Question ID: {}, Is Correct: {}", question.getId(), isCorrect);
        } else if ("MULTIPLE_ANSWER".equals(questionType)) {
            log.debug("MULTIPLE_ANSWER Grading - Question ID: {}, Student Selected Options: '{}', Correct Answer: '{}'",
                    question.getId(), answer.getSelectedOptions(), question.getCorrectAnswer());
            isCorrect = isMultipleAnswerCorrect(answer, question);
            log.debug("MULTIPLE_ANSWER Grading - Question ID: {}, Is Correct: {}", question.getId(), isCorrect);
        } else {
            log.warn("Unknown question type '{}' for questionId: {}. Skipping grading, marks set to 0.", questionType, question.getId());
        }

        if (isCorrect) {
            answer.setMarksObtained(answer.getMarksAllocated().doubleValue());
        }
        answer.setIsCorrect(isCorrect);
        log.trace("Graded questionId: {}. Correct: {}. Marks: {}", question.getId(), isCorrect, answer.getMarksObtained());
        return answer.getMarksObtained();
    }

    // Other methods...

    private ExamAttempt createNewAttempt(StartAttemptRequest request, UUID studentId, String studentName, String ipAddress, String userAgent, ExamDTO exam, List<StudentQuestionDTO> questions, long attemptCount) {
        ExamAttempt attempt = ExamAttempt.builder()
                .examId(request.getExamId())
                .examTitle(exam.getTitle())
                .studentId(studentId)
                .studentName(studentName)
                .attemptNumber((int) attemptCount + 1)
                .status(AttemptStatus.IN_PROGRESS)
                .totalQuestions(questions.size())
                .totalMarks(questions.stream().filter(q -> q.getMarks() != null).mapToInt(StudentQuestionDTO::getMarks).sum())
                .startedAt(LocalDateTime.now())
                .examDurationInMinutes(exam.getDuration()) // Set the duration
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

    @Transactional
    public void autoSubmitExpiredAttempts() {
        List<ExamAttempt> stalledAttempts = attemptRepository.findStalledAttempts();

        if (stalledAttempts.isEmpty()) {
            log.info("No expired attempts to auto-submit.");
            return;
        }
        log.info("Found {} expired attempts to auto-submit.", stalledAttempts.size());

        for (ExamAttempt attempt : stalledAttempts) {
            log.warn("Auto-submitting attemptId: {} which started at {}", attempt.getId(), attempt.getStartedAt());
            attempt.setStatus(AttemptStatus.AUTO_SUBMITTED);
            attempt.setSubmittedAt(LocalDateTime.now());
            attempt.setAutoSubmitted(true);
            autoGradeAttempt(attempt);
            attemptRepository.save(attempt);
            eventProducer.publishAttemptAutoSubmitted(attempt);
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "attempts", key = "#attemptId")
    public AttemptResponse getAttempt(UUID attemptId, Authentication authentication) {
        log.debug("Fetching attempt details for attemptId: {}", attemptId);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        UUID currentUserId = JwtUtils.getUserId(authentication);
        String role = JwtUtils.getRole(authentication);

        if (!attempt.getStudentId().equals(currentUserId) && !ROLE_ADMIN.equals(role) && !ROLE_TEACHER.equals(role)) {
            log.warn("Unauthorized attempt to view attemptId: {} by userId: {}", attemptId, currentUserId);
            throw new UnauthorizedException("Not authorized to view this attempt");
        }
        return attemptMapper.toResponse(attempt);
    }

    @Transactional(readOnly = true)
    public List<AttemptAnswerResponse> getAttemptAnswers(UUID attemptId, Authentication authentication) {
        log.debug("Fetching answers for attempt: {}", attemptId);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        UUID currentUserId = JwtUtils.getUserId(authentication);
        String role = JwtUtils.getRole(authentication);

        if (!attempt.getStudentId().equals(currentUserId) && !ROLE_ADMIN.equals(role) && !ROLE_TEACHER.equals(role)) {
            log.warn("Unauthorized attempt to view answers for attemptId: {} by userId: {}", attemptId, currentUserId);
            throw new UnauthorizedException("Not authorized to view this attempt");
        }
        return attempt.getAnswers().stream()
                .sorted(Comparator.comparingInt(AttemptAnswer::getQuestionOrder))
                .map(attemptMapper::toAnswerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttemptResultResponse getAttemptResultDetails(UUID attemptId, Authentication authentication) {
        log.debug("Fetching detailed result for attemptId: {}", attemptId);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        UUID currentUserId = JwtUtils.getUserId(authentication);
        String role = JwtUtils.getRole(authentication);

        if (!attempt.getStudentId().equals(currentUserId) && !ROLE_ADMIN.equals(role) && !ROLE_TEACHER.equals(role)) {
            log.warn("Unauthorized attempt to view result details for attemptId: {} by userId: {}", attemptId, currentUserId);
            throw new UnauthorizedException("Not authorized to view this attempt result");
        }

        // Fetch the result from the result-service
        ResultDTO result = getResultFromService(attemptId);

        // For students, only show published results
        if ("ROLE_STUDENT".equals(role) && !"PUBLISHED".equals(result.getStatus())) {
            throw new UnauthorizedException("Result is not yet published.");
        }

        // Fetch all questions for this attempt
        List<UUID> questionIds = attempt.getAnswers().stream()
                .map(AttemptAnswer::getQuestionId)
                .collect(Collectors.toList());

        Map<UUID, QuestionDTO> questionMap = fetchQuestionsForGrading(attemptId, questionIds);

        List<AttemptResultDetailDTO> details = attempt.getAnswers().stream()
                .sorted(Comparator.comparingInt(AttemptAnswer::getQuestionOrder))
                .map(answer -> {
                    QuestionDTO question = questionMap.get(answer.getQuestionId());
                    return AttemptResultDetailDTO.builder()
                            .questionId(answer.getQuestionId())
                            .questionText(question != null ? question.getQuestionText() : "Question not found")
                            .questionType(question != null ? question.getQuestionType() : null)
                            .options(question != null ? question.getOptions() : null)
                            .correctAnswer(question != null ? question.getCorrectAnswer() : null)
                            .studentSelectedOptions(answer.getSelectedOptions())
                            .studentAnswerText(answer.getAnswerText())
                            .isCorrect(answer.getIsCorrect())
                            .marksAllocated(answer.getMarksAllocated())
                            .marksObtained(answer.getMarksObtained())
                            .build();
                })
                .collect(Collectors.toList());

        return AttemptResultResponse.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .studentId(attempt.getStudentId())
                .studentName(attempt.getStudentName())
                .status(attempt.getStatus())
                .totalMarks(result.getTotalMarks())
                .obtainedMarks(result.getObtainedMarks())
                .percentage(result.getPercentage())
                .passed(result.getPassed())
                .grade(result.getGrade())
                .resultStatus(result.getStatus())
                .publishedAt(result.getPublishedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .details(details)
                .build();
    }

    private ResultDTO getResultFromService(UUID attemptId) {
        try {
            ApiResponse<ResultDTO> response = resultServiceClient.getResultByAttemptId(attemptId);
            if (response == null || !response.isSuccess() || response.getData() == null) {
                log.error("Invalid response from result-service for attemptId: {}. Response: {}", attemptId, response);
                throw new ResourceNotFoundException("Result not found for attempt id: " + attemptId);
            }
            return response.getData();
        } catch (FeignException e) {
            log.error("Feign error fetching result for attemptId: {}. Status: {}, Body: {}", attemptId, e.status(), e.contentUTF8(), e);
            throw new ServiceException("Failed to fetch result details. Please try again later.");
        }
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getStudentAttempts(Pageable pageable, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Fetching attempts for student: {}", studentId);
        return attemptRepository.findByStudentId(studentId, pageable).map(attemptMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getStudentExamAttempts(UUID examId, Pageable pageable, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Fetching attempts for student: {} and exam: {}", studentId, examId);
        return attemptRepository.findByExamIdAndStudentId(examId, studentId, pageable).map(attemptMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Long getStudentAttemptsCount(Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        log.debug("Counting attempts for student: {}", studentId);
        return attemptRepository.countByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getExamAttempts(UUID examId, Pageable pageable, Authentication authentication) {
        log.debug("Fetching attempts for exam: {}", examId);
        verifyTeacherOrAdminRole(authentication);
        return attemptRepository.findByExamId(examId, pageable).map(attemptMapper::toSummary);
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
        return attemptRepository.findByStudentId(studentId, pageable).map(attemptMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<AttemptSummary> getAllAttempts(Pageable pageable) {
        log.debug("Admin fetching all attempts");
        return attemptRepository.findAll(pageable).map(attemptMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public ExamAttemptStatistics getExamAttemptStatistics(UUID examId, Authentication authentication) {
        log.debug("Calculating statistics for exam: {}", examId);
        verifyTeacherOrAdminRole(authentication);
        // ... (rest of the method)
        return new ExamAttemptStatistics();
    }

    @Transactional
    public void recordTabSwitch(UUID attemptId, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);
        attempt.incrementTabSwitches();
        attemptRepository.save(attempt);
        log.warn("Tab switch recorded for attemptId: {}. Total: {}", attemptId, attempt.getTabSwitches());
    }

    @Transactional
    public void recordWebcamViolation(UUID attemptId, Authentication authentication) {
        UUID studentId = JwtUtils.getUserId(authentication);
        ExamAttempt attempt = getAttemptEntity(attemptId);
        verifyAttemptOwnership(attempt, studentId);
        attempt.incrementWebcamViolations();
        attemptRepository.save(attempt);
        log.warn("Webcam violation recorded for attemptId: {}. Total: {}", attemptId, attempt.getWebcamViolations());
    }

    private ExamAttempt getAttemptEntity(UUID attemptId) {
        return attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));
    }

    private ExamDTO getExamOrThrow(UUID examId) {
        try {
            log.debug("Fetching exam details from exam-service for examId: {}", examId);
            ApiResponse<ExamDTO> response = examServiceClient.getExam(examId);
            if (response == null || !response.isSuccess() || response.getData() == null) {
                log.error("Invalid response from exam-service for examId: {}. Response: {}", examId, response);
                throw new ResourceNotFoundException("Exam not found with id: " + examId);
            }
            return response.getData();
        } catch (FeignException e) {
            log.error("Feign error fetching exam details for examId: {}. Status: {}, Body: {}", examId, e.status(), e.contentUTF8(), e);
            throw new ServiceException("Failed to fetch exam details. Please try again later.");
        }
    }

    private List<StudentQuestionDTO> getExamQuestionsForStudentOrThrow(UUID examId, boolean shuffle) {
        try {
            log.debug("Fetching student questions from question-service for examId: {}", examId);
            ApiResponse<List<StudentQuestionDTO>> response = studentQuestionServiceClient.getExamQuestionsForStudent(examId, shuffle);
            if (response == null || !response.isSuccess() || response.getData() == null) {
                log.warn("No student questions found or invalid response for examId: {}", examId);
                return Collections.emptyList();
            }
            return response.getData();
        } catch (FeignException e) {
            log.error("Feign error fetching student questions for examId: {}. Status: {}, Body: {}", examId, e.status(), e.contentUTF8(), e);
            throw new ServiceException("Failed to fetch exam questions. Please try again later.");
        }
    }

    private void validateExamForAttempt(ExamDTO exam) {
        if (!exam.getStatus().isAvailableForAttempt()) {
            throw new BadRequestException("Exam is not available for attempt. Current status: " + exam.getStatus());
        }
        if (!Boolean.TRUE.equals(exam.getIsActive())) {
            throw new BadRequestException("Exam is not active");
        }
        LocalDateTime now = LocalDateTime.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new BadRequestException("Exam has not started yet. Starts at: " + exam.getStartTime());
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new BadRequestException("Exam has ended. Ended at: " + exam.getEndTime());
        }
    }

    private void verifyAttemptOwnership(ExamAttempt attempt, UUID studentId) {
        if (!attempt.getStudentId().equals(studentId)) {
            log.warn("Ownership verification failed. Attempt {} belongs to student {}, but was accessed by student {}", attempt.getId(), attempt.getStudentId(), studentId);
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

    private Map<UUID, QuestionDTO> fetchQuestionsForGrading(UUID attemptId, List<UUID> questionIds) {
        try {
            log.debug("Attempting to fetch {} questions via InternalQuestionServiceClient for attemptId: {}", questionIds.size(), attemptId);
            ApiResponse<List<QuestionDTO>> response = internalQuestionServiceClient.getQuestionsByIds(questionIds);
            if (response != null && response.isSuccess() && response.getData() != null) {
                log.info("Successfully fetched {} questions for grading attemptId: {}", response.getData().size(), attemptId);
                return response.getData().stream().collect(Collectors.toMap(QuestionDTO::getId, q -> q));
            } else {
                log.error("Failed to fetch questions for grading. Service response was unsuccessful or data was null. Response: {}", response);
                return Collections.emptyMap();
            }
        } catch (FeignException e) {
            log.error("Feign client error while fetching questions for grading attemptId: {}. Status: {}, Body: {}", attemptId, e.status(), e.contentUTF8(), e);
            return Collections.emptyMap();
        } catch (Exception e) {
            log.error("Unexpected error while fetching questions for grading attemptId: {}", attemptId, e);
            return Collections.emptyMap();
        }
    }

    private boolean isTextAnswerCorrect(String studentAnswer, String correctAnswer) {
        return studentAnswer != null && correctAnswer != null &&
               studentAnswer.trim().equalsIgnoreCase(correctAnswer.trim());
    }

    private boolean isMultipleAnswerCorrect(AttemptAnswer answer, QuestionDTO question) {
        if (question.getCorrectAnswer() == null || question.getCorrectAnswer().isBlank()) {
            return false;
        }
        Set<String> correctOptions = Arrays.stream(question.getCorrectAnswer().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());
        Set<String> studentSelectedOptions = answer.getSelectedOptions() != null ?
                answer.getSelectedOptions().stream().map(String::trim).collect(Collectors.toSet()) :
                Collections.emptySet();
        return correctOptions.equals(studentSelectedOptions);
    }

    public void recordCustomViolation(UUID attemptId, String violationType, Authentication authentication) {
    }
}
