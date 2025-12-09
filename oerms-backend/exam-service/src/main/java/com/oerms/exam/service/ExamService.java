package com.oerms.exam.service;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.CreateExamRequest;
import com.oerms.common.dto.ExamDTO;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.dto.UpdateExamRequest;
import com.oerms.common.exception.BadRequestException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.UnauthorizedException;
import com.oerms.common.util.JwtUtils;
import com.oerms.exam.client.QuestionServiceClient;
import com.oerms.exam.dto.ExamStatisticsDTO;
import com.oerms.exam.dto.ExamWithQuestionsDTO;
import com.oerms.exam.dto.QuestionResponse;
import com.oerms.exam.dto.QuestionStatisticsDTO;
import com.oerms.exam.entity.Exam;
import com.oerms.common.enums.ExamStatus;
import com.oerms.exam.mapper.ExamMapper;
import com.oerms.exam.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamMapper examMapper;
    private final ExamEventPublisher eventPublisher;
    private final QuestionServiceClient questionServiceClient;

    // Inject self to enable AOP proxy for internal calls to @Cacheable methods
    private ExamService self;

    @Autowired
    public void setSelf(@Lazy ExamService self) {
        this.self = self;
    }

    // ---------------- Create Exam ----------------
    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO createExam(CreateExamRequest request, Authentication authentication) {
        UUID teacherId = JwtUtils.getUserId(authentication);
        String teacherName = JwtUtils.getUsername(authentication);

        validateExamRequest(request);

        Exam exam = examMapper.toEntity(request);
        exam.setTeacherId(teacherId);
        exam.setTeacherName(teacherName);

        exam = examRepository.save(exam);
        
        eventPublisher.publishExamCreated(exam);
        log.info("Exam created: {} by teacher: {}", exam.getId(), teacherId);
        
        return examMapper.toDTO(exam);
    }

    // ---------------- Get All Exams ----------------
    @Cacheable(value = "exams")
    public PageResponse<ExamDTO> getAllExams(Authentication authentication, Pageable pageable) {
        String role = JwtUtils.getRole(authentication);
        Page<Exam> examsPage;

        if ("ROLE_ADMIN".equals(role)) {
            examsPage = examRepository.findAll(pageable);
        } else {
            UUID teacherId = JwtUtils.getUserId(authentication);
            examsPage = examRepository.findByTeacherId(teacherId, pageable);
        }

        return examMapper.toPageResponse(examsPage);
    }

    // ---------------- Get Exam ----------------
    @Cacheable(value = "exams", key = "#examId")
    public ExamDTO getExam(UUID examId) {
        log.info("Get exam method called for: {} ", examId);
        Exam exam = findExamById(examId); // findExamById is not @Cacheable, so no self-invocation issue here
        log.info("Exam found: {}", exam);
        log.info("Exam Details:");
        log.info("Teacher's Id: {}", exam.getTeacherId());
        return examMapper.toDTO(exam);
    }

    // ---------------- Get Exam with Questions ----------------
    public ExamWithQuestionsDTO getExamWithQuestions(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        try {
            ApiResponse<List<QuestionResponse>> questionResponse = questionServiceClient.getExamQuestions(examId);
            ApiResponse<QuestionStatisticsDTO> statsResponse = questionServiceClient.getExamStatistics(examId);

            List<QuestionResponse> questions = extractQuestions(questionResponse, examId);
            QuestionStatisticsDTO statistics = extractStatistics(statsResponse);

            return ExamWithQuestionsDTO.builder()
                    .exam(examMapper.toDTO(exam))
                    .questions(questions)
                    .questionCount((long) questions.size())
                    .totalMarks(statistics != null ? statistics.getTotalMarks() : 0)
                    .statistics(statistics)
                    .build();

        } catch (Exception e) {
            log.error("Failed to fetch questions for exam: {}", examId, e);
            return buildEmptyExamWithQuestions(exam);
        }
    }

    // ---------------- Update Exam ----------------
    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO updateExam(UUID examId, UpdateExamRequest request, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new BadRequestException("Only draft exams can be updated. Current status: " + exam.getStatus());
        }

        validateUpdateRequest(request, exam);
        examMapper.updateEntityFromDTO(request, exam);

        exam = examRepository.save(exam);
        
        eventPublisher.publishExamUpdated(exam);
        log.info("Exam updated: {} by user: {}", examId, JwtUtils.getUserId(authentication));
        
        return examMapper.toDTO(exam);
    }

    // ---------------- Delete Exam ----------------
    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public void deleteExam(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new BadRequestException("Only draft exams can be deleted. Use archive instead.");
        }

        examRepository.delete(exam);
        
        eventPublisher.publishExamDeleted(exam);
        log.info("Exam deleted: {} by user: {}", examId, JwtUtils.getUserId(authentication));
    }

    // ---------------- Publish Exam ----------------
    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO publishExam(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new BadRequestException("Only draft exams can be published. Current status: " + exam.getStatus());
        }

        validateExamHasQuestions(examId);

        exam.setStatus(ExamStatus.PUBLISHED);
        exam = examRepository.save(exam);

        eventPublisher.publishExamPublished(exam);
        
        // If exam has start time, also publish scheduled event
        if (exam.getStartTime() != null) {
            eventPublisher.publishExamScheduled(exam);
        }
        
        log.info("Exam published: {} by teacher: {}", examId, JwtUtils.getUserId(authentication));
        return examMapper.toDTO(exam);
    }

    // ---------------- Validate Exam for Publishing ----------------
    public Boolean validateExamForPublish(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        if (exam.getStatus() != ExamStatus.DRAFT) {
            log.info("Exam {} cannot be published - not in DRAFT status", examId);
            return false;
        }

        try {
            ApiResponse<Long> response = questionServiceClient.getQuestionCount(examId);
            boolean hasQuestions = response != null && response.getData() != null && response.getData() > 0;
            log.info("Exam {} validation - has questions: {}", examId, hasQuestions);
            return hasQuestions;
        } catch (Exception e) {
            log.error("Failed to validate question count for exam: {}", examId, e);
            throw new BadRequestException("Failed to validate exam questions. Please ensure questions are added.");
        }
    }

    // ---------------- Get Exam Question Count ----------------
    public Long getExamQuestionCount(UUID examId) {
        try {
            ApiResponse<Long> response = questionServiceClient.getQuestionCount(examId);
            return (response != null && response.getData() != null) ? response.getData() : 0L;
        } catch (Exception e) {
            log.error("Failed to get question count for exam: {}", examId, e);
            return 0L;
        }
    }

    // ---------------- Unpublish Exam ----------------
    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO unpublishExam(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new BadRequestException("Only published exams can be unpublished");
        }

        exam.setStatus(ExamStatus.DRAFT);
        exam = examRepository.save(exam);

        eventPublisher.publishExamUnpublished(exam);
        log.info("Exam unpublished: {} by teacher: {}", examId, JwtUtils.getUserId(authentication));
        
        return examMapper.toDTO(exam);
    }

    // ---------------- Archive Exam ----------------
    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO archiveExam(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        exam.setStatus(ExamStatus.ARCHIVED);
        exam.setIsActive(false);
        exam = examRepository.save(exam);

        eventPublisher.publishExamArchived(exam);
        log.info("Exam archived: {} by teacher: {}", examId, JwtUtils.getUserId(authentication));
        
        return examMapper.toDTO(exam);
    }

    // ---------------- Cancel Exam ----------------
    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO cancelExam(UUID examId, String reason, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        if (exam.getStatus() == ExamStatus.DRAFT || exam.getStatus() == ExamStatus.ARCHIVED) {
            throw new BadRequestException("Cannot cancel draft or archived exams");
        }

        exam.setStatus(ExamStatus.CANCELLED);
        exam.setIsActive(false);
        exam = examRepository.save(exam);

        eventPublisher.publishExamCancelled(exam, reason);
        log.info("Exam cancelled: {} by teacher: {} - Reason: {}", examId, JwtUtils.getUserId(authentication), reason);
        
        return examMapper.toDTO(exam);
    }

    // ---------------- Start Exam (Student) ----------------
    @Transactional
    public ExamDTO startExam(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        UUID studentId = JwtUtils.getUserId(authentication);

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new BadRequestException("Exam is not available for taking");
        }

        LocalDateTime now = LocalDateTime.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new BadRequestException("Exam has not started yet");
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new BadRequestException("Exam has already ended");
        }

        eventPublisher.publishExamStarted(exam, studentId);
        log.info("Exam started: {} by student: {}", examId, studentId);
        
        return examMapper.toDTO(exam);
    }

    // ---------------- Complete Exam (Student) ----------------
    @Transactional
    public void completeExam(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        UUID studentId = JwtUtils.getUserId(authentication);

        eventPublisher.publishExamCompleted(exam, studentId);
        log.info("Exam completed: {} by student: {}", examId, studentId);
    }

    // ---------------- Get Teacher Exams ----------------
    @Cacheable(value = "teacherExams", key = "#teacherId + '-' + #pageable.pageNumber")
    public PageResponse<ExamDTO> getTeacherExams(UUID teacherId, Pageable pageable) {
        Page<Exam> examsPage = examRepository.findByTeacherId(teacherId, pageable);
        return examMapper.toPageResponse(examsPage);
    }

    // ---------------- Get Published Exams ----------------
    @Cacheable(value = "publishedExams")
    public PageResponse<ExamDTO> getPublishedExams(Pageable pageable) {
        Page<Exam> examsPage = examRepository.findByStatusAndIsActive(ExamStatus.PUBLISHED, true, pageable);
        return examMapper.toPageResponse(examsPage);
    }

    // ---------------- Get Active Exams ----------------
    public List<ExamDTO> getActiveExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> exams = examRepository.findActiveExams(now);
        return examMapper.toDTOList(exams);
    }

    // ---------------- Get Ongoing Exams ----------------
    public List<ExamDTO> getOngoingExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> exams = examRepository.findOngoingExams(now);
        return examMapper.toDTOList(exams);
    }

    // ---------------- Get My Exams ----------------
    public PageResponse<ExamDTO> getMyExams(Authentication authentication, Pageable pageable) {
        UUID teacherId = JwtUtils.getUserId(authentication);
        // Call through 'self' to ensure @Cacheable on getTeacherExams is applied
        return self.getTeacherExams(teacherId, pageable);
    }

    // ---------------- Counts ----------------
    public Long getTeacherExamCount(UUID teacherId) {
        return examRepository.countByTeacherId(teacherId);
    }

    public Long getMyExamCount(Authentication authentication) {
        UUID teacherId = JwtUtils.getUserId(authentication);
        return examRepository.countByTeacherId(teacherId);
    }

    public Long getPublishedExamCount() {
        return examRepository.countByStatus(ExamStatus.PUBLISHED);
    }

    // ---------------- Get Exam Statistics ----------------
    public ExamStatisticsDTO getExamStatistics(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        try {
            ApiResponse<QuestionStatisticsDTO> response = questionServiceClient.getExamStatistics(examId);

            if (response != null && response.isSuccess() && response.getData() != null) {
                QuestionStatisticsDTO questionStats = response.getData();
                return buildExamStatistics(exam, questionStats);
            }

            return buildEmptyExamStatistics(exam);

        } catch (Exception e) {
            log.error("Failed to fetch exam statistics: {}", examId, e);
            throw new BadRequestException("Failed to fetch exam statistics");
        }
    }

    // ---------------- Helper Methods ----------------

    private Exam findExamById(UUID examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
    }

    private void verifyExamOwnership(Exam exam, Authentication authentication) {
        UUID teacherId = JwtUtils.getUserId(authentication);
        String role = JwtUtils.getRole(authentication);

        if (!exam.getTeacherId().equals(teacherId) && !"ROLE_ADMIN".equals(role)) {
            throw new UnauthorizedException("You don't have permission to access this exam");
        }
    }

    private void validateExamRequest(CreateExamRequest request) {
        if (request.getPassingMarks() > request.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot exceed total marks");
        }
        if (request.getStartTime() != null && request.getEndTime() != null &&
                request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private void validateUpdateRequest(UpdateExamRequest request, Exam exam) {
        if (request.getPassingMarks() != null && request.getPassingMarks() > exam.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot exceed total marks");
        }
        if (request.getEndTime() != null && exam.getStartTime() != null &&
                request.getEndTime().isBefore(exam.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private void validateExamHasQuestions(UUID examId) {
        try {
            ApiResponse<Long> response = questionServiceClient.getQuestionCount(examId);
            if (response == null || response.getData() == null || response.getData() == 0) {
                throw new BadRequestException("Cannot publish an exam with no questions");
            }
            log.info("Exam {} has {} questions", examId, response.getData());
        } catch (Exception e) {
            log.error("Failed to validate question count for exam: {}", examId, e);
            throw new BadRequestException("Failed to validate exam questions. Please ensure questions are added.");
        }
    }

    private List<QuestionResponse> extractQuestions(ApiResponse<List<QuestionResponse>> response, UUID examId) {
        if (response != null && response.isSuccess() && response.getData() != null) {
            log.info("Successfully fetched {} questions for exam {}", response.getData().size(), examId);
            return response.getData();
        }
        log.warn("No questions found for exam {}", examId);
        return List.of();
    }

    private QuestionStatisticsDTO extractStatistics(ApiResponse<QuestionStatisticsDTO> response) {
        if (response != null && response.isSuccess() && response.getData() != null) {
            return response.getData();
        }
        return null;
    }

    private ExamWithQuestionsDTO buildEmptyExamWithQuestions(Exam exam) {
        return ExamWithQuestionsDTO.builder()
                .exam(examMapper.toDTO(exam))
                .questions(List.of())
                .questionCount(0L)
                .totalMarks(0)
                .statistics(null)
                .build();
    }

    private ExamStatisticsDTO buildExamStatistics(Exam exam, QuestionStatisticsDTO questionStats) {
        return ExamStatisticsDTO.builder()
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .totalQuestions(questionStats.getTotalQuestions())
                .totalMarks(questionStats.getTotalMarks())
                .mcqCount(questionStats.getMcqCount())
                .trueFalseCount(questionStats.getTrueFalseCount())
                .shortAnswerCount(questionStats.getShortAnswerCount())
                .essayCount(questionStats.getEssayCount())
                .easyCount(questionStats.getEasyCount())
                .mediumCount(questionStats.getMediumCount())
                .hardCount(questionStats.getHardCount())
                .status(exam.getStatus().name())
                .build();
    }

    private ExamStatisticsDTO buildEmptyExamStatistics(Exam exam) {
        return ExamStatisticsDTO.builder()
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .totalQuestions(0L)
                .totalMarks(0)
                .mcqCount(0L)
                .trueFalseCount(0L)
                .shortAnswerCount(0L)
                .essayCount(0L)
                .easyCount(0L)
                .mediumCount(0L)
                .hardCount(0L)
                .status(exam.getStatus().name())
                .build();
    }
}
