package com.oerms.exam.service;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.AttemptResponse;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.dto.StartAttemptRequest;
import com.oerms.exam.client.AttemptServiceClient;
import com.oerms.exam.client.TeacherQuestionServiceClient;
import com.oerms.exam.dto.*;
import com.oerms.common.exception.BadRequestException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.ServiceException;
import com.oerms.common.exception.UnauthorizedException;
import com.oerms.common.util.JwtUtils;
import com.oerms.exam.entity.Exam;
import com.oerms.exam.enums.ExamStatus;
import com.oerms.exam.mapper.ExamMapper;
import com.oerms.exam.repository.ExamRepository;
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
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamMapper examMapper;
    private final ExamEventPublisher eventPublisher;
    private final TeacherQuestionServiceClient teacherQuestionServiceClient;
    private final AttemptServiceClient attemptServiceClient;

    private static final String ROLE_ADMIN = "ROLE_ADMIN";

    // ==================== CRUD Operations ====================

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

    @Cacheable(value = "exams")
    public PageResponse<ExamDTO> getAllExams(Authentication authentication, Pageable pageable) {
        String role = JwtUtils.getRole(authentication);
        Page<Exam> examsPage;

        if (ROLE_ADMIN.equals(role)) {
            examsPage = examRepository.findAll(pageable);
        } else {
            UUID teacherId = JwtUtils.getUserId(authentication);
            examsPage = examRepository.findByTeacherId(teacherId, pageable);
        }

        return examMapper.toPageResponse(examsPage);
    }

    @Cacheable(value = "exams", key = "#examId")
    public ExamDTO getExam(UUID examId) {
        log.info("Get exam method called for: {} ", examId);
        Exam exam = findExamById(examId);
        log.info("Exam found: {}", exam);
        return examMapper.toDTO(exam);
    }

    public ExamWithQuestionsDTO getExamWithQuestions(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        try {
            ApiResponse<List<QuestionResponse>> questionResponse = teacherQuestionServiceClient.getExamQuestions(examId);
            ApiResponse<QuestionStatisticsDTO> statsResponse = teacherQuestionServiceClient.getExamStatistics(examId);

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

    // ==================== Exam Status Management ====================

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

        if (exam.getStartTime() != null) {
            eventPublisher.publishExamScheduled(exam);
        }

        log.info("Exam published: {} by teacher: {}", examId, JwtUtils.getUserId(authentication));
        return examMapper.toDTO(exam);
    }

    public Boolean validateExamForPublish(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, authentication);

        if (exam.getStatus() != ExamStatus.DRAFT) {
            log.info("Exam {} cannot be published - not in DRAFT status", examId);
            return false;
        }

        try {
            ApiResponse<Long> response = teacherQuestionServiceClient.getQuestionCount(examId);
            boolean hasQuestions = response != null && response.getData() != null && response.getData() > 0;
            log.info("Exam {} validation - has questions: {}", examId, hasQuestions);
            return hasQuestions;
        } catch (Exception e) {
            log.error("Failed to validate question count for exam: {}", examId, e);
            throw new BadRequestException("Failed to validate exam questions. Please ensure questions are added.");
        }
    }

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

    // ==================== Student Exam Lifecycle ====================

    @Transactional
    public ExamStartResponse startExam(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        UUID studentId = JwtUtils.getUserId(authentication);

        log.info("Starting exam {} for student {}", examId, studentId);

        validateExamIsStartable(exam);

        try {
            AttemptResponse attempt = createExamAttempt(examId);
            log.info("Successfully created attempt {} for exam {} by student {}", attempt.getId(), examId, studentId);

            eventPublisher.publishExamStarted(exam, studentId);

            return ExamStartResponse.builder()
                    .exam(examMapper.toDTO(exam))
                    .attempt(attempt)
                    .build();
        } catch (FeignException e) {
            throw handleStartAttemptFeignException(e, examId);
        } catch (Exception e) {
            log.error("Unexpected error starting exam {}: {}", examId, e.getMessage(), e);
            throw new ServiceException("An unexpected error occurred while starting the exam");
        }
    }

    @Transactional
    public void completeExam(UUID examId, Authentication authentication) {
        Exam exam = findExamById(examId);
        UUID studentId = JwtUtils.getUserId(authentication);

        eventPublisher.publishExamCompleted(exam, studentId);
        log.info("Exam completed: {} by student: {}", examId, studentId);
    }

    public ExamAvailabilityDTO checkExamAvailability(UUID examId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        Exam exam = findExamById(examId);

        boolean isAvailable = true;
        List<String> reasons = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            isAvailable = false;
            reasons.add("Exam is not published");
        }

        if (!Boolean.TRUE.equals(exam.getIsActive())) {
            isAvailable = false;
            reasons.add("Exam is not active");
        }

        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            isAvailable = false;
            reasons.add("Exam has not started yet");
        }

        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            isAvailable = false;
            reasons.add("Exam has ended");
        }

        if (exam.getMaxAttempts() != null && exam.getMaxAttempts() > 0) {
            try {
                ApiResponse<Long> response = attemptServiceClient.getStudentExamAttemptsCount(examId, studentId);
                if (response != null && response.getData() != null && response.getData() >= exam.getMaxAttempts()) {
                    isAvailable = false;
                    reasons.add("Maximum attempts reached");
                }
            } catch (Exception e) {
                log.warn("Failed to check attempt count for exam {}: {}", examId, e.getMessage());
            }
        }

        return ExamAvailabilityDTO.builder()
                .examId(examId)
                .isAvailable(isAvailable)
                .reasons(reasons)
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .duration(exam.getDuration())
                .build();
    }

    public Page<ExamDTO> getMyAvailableExams(Pageable pageable, Authentication auth) {
        LocalDateTime now = LocalDateTime.now();
        Page<Exam> availableExams = examRepository.findAvailableExamsForStudent(now, pageable);
        return availableExams.map(examMapper::toDTO);
    }

    public PrerequisiteCheckDTO checkPrerequisites(UUID examId, Authentication auth) {
        UUID studentId = JwtUtils.getUserId(auth);
        Exam exam = findExamById(examId);

        List<UUID> prerequisiteIds = exam.getPrerequisiteExamIds();
        if (prerequisiteIds == null || prerequisiteIds.isEmpty()) {
            return PrerequisiteCheckDTO.builder()
                    .allPrerequisitesMet(true)
                    .prerequisites(Collections.emptyList())
                    .build();
        }

        List<PrerequisiteCheckDTO.PrerequisiteStatus> statuses = new ArrayList<>();
        boolean allMet = true;

        for (UUID prereqId : prerequisiteIds) {
            try {
                ApiResponse<Boolean> completionCheck = attemptServiceClient.hasCompletedExam(prereqId, studentId);
                boolean completed = completionCheck != null && Boolean.TRUE.equals(completionCheck.getData());

                if (!completed) {
                    allMet = false;
                }

                Exam prereqExam = findExamById(prereqId);
                statuses.add(PrerequisiteCheckDTO.PrerequisiteStatus.builder()
                        .examId(prereqId)
                        .examTitle(prereqExam.getTitle())
                        .completed(completed)
                        .build());
            } catch (Exception e) {
                log.error("Error checking prerequisite {}: {}", prereqId, e.getMessage());
                allMet = false;
            }
        }

        return PrerequisiteCheckDTO.builder()
                .allPrerequisitesMet(allMet)
                .prerequisites(statuses)
                .build();
    }


    // ==================== Query & Search Operations ====================

    @Cacheable(value = "teacherExams", key = "#teacherId + '-' + #pageable.pageNumber")
    public PageResponse<ExamDTO> getTeacherExams(UUID teacherId, Pageable pageable) {
        Page<Exam> examsPage = examRepository.findByTeacherId(teacherId, pageable);
        return examMapper.toPageResponse(examsPage);
    }

    @Cacheable(value = "publishedExams")
    public PageResponse<ExamDTO> getPublishedExams(Pageable pageable) {
        Page<Exam> examsPage = examRepository.findByStatusAndIsActive(ExamStatus.PUBLISHED, true, pageable);
        return examMapper.toPageResponse(examsPage);
    }

    public List<ExamDTO> getActiveExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> exams = examRepository.findActiveExams(now);
        return examMapper.toDTOList(exams);
    }

    public List<ExamDTO> getOngoingExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> exams = examRepository.findOngoingExams(now);
        return examMapper.toDTOList(exams);
    }

    public Page<ExamDTO> searchExams(String title, String subject, ExamStatus status, UUID teacherId,
                                     Integer minDuration, Integer maxDuration, LocalDateTime startDate,
                                     LocalDateTime endDate, Integer minTotalMarks, Integer maxTotalMarks,
                                     Boolean isActive, Pageable pageable, Authentication auth) {
        Page<Exam> exams = examRepository.searchExams(
                title, subject, status, teacherId, minDuration, maxDuration,
                startDate, endDate, minTotalMarks, maxTotalMarks, isActive, pageable);

        return exams.map(examMapper::toDTO);
    }

    public List<ExamDTO> getUpcomingExams(int daysAhead, Authentication auth) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = now.plusDays(daysAhead);

        List<Exam> exams = examRepository.findUpcomingExams(now, endDate);
        return examMapper.toDTOList(exams);
    }

    public List<ExamDTO> getExamsEndingSoon(int hoursAhead, Authentication auth) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endTime = now.plusHours(hoursAhead);

        List<Exam> exams = examRepository.findExamsEndingSoon(now, endTime);
        return examMapper.toDTOList(exams);
    }

    public Page<ExamDTO> getExamsBySubject(String subject, Pageable pageable, Authentication auth) {
        Page<Exam> exams = examRepository.findBySubject(subject, pageable);
        return exams.map(examMapper::toDTO);
    }

    // ==================== Exam Duplication & Templates ====================

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO duplicateExam(UUID examId, DuplicateExamRequest request, Authentication auth) {
        Exam originalExam = findExamById(examId);
        verifyExamOwnership(originalExam, auth);

        UUID teacherId = JwtUtils.getUserId(auth);
        String teacherName = JwtUtils.getUsername(auth);

        Exam duplicatedExam = new Exam();
        duplicatedExam.setTitle(request != null && request.getNewTitle() != null
                ? request.getNewTitle()
                : originalExam.getTitle() + " (Copy)");
        duplicatedExam.setDescription(originalExam.getDescription());
        duplicatedExam.setSubject(originalExam.getSubject());
        duplicatedExam.setDuration(originalExam.getDuration());
        duplicatedExam.setTotalMarks(originalExam.getTotalMarks());
        duplicatedExam.setPassingMarks(originalExam.getPassingMarks());
        duplicatedExam.setInstructions(originalExam.getInstructions());
        duplicatedExam.setShuffleQuestions(originalExam.getShuffleQuestions());
        duplicatedExam.setShuffleOptions(originalExam.getShuffleOptions());
        duplicatedExam.setShowResultsImmediately(originalExam.getShowResultsImmediately());
        duplicatedExam.setAllowReview(originalExam.getAllowReview());
        duplicatedExam.setTeacherId(teacherId);
        duplicatedExam.setTeacherName(teacherName);
        duplicatedExam.setStatus(ExamStatus.DRAFT);
        duplicatedExam.setIsActive(true);

        duplicatedExam = examRepository.save(duplicatedExam);

        try {
            teacherQuestionServiceClient.duplicateExamQuestions(examId, duplicatedExam.getId());
        } catch (Exception e) {
            log.error("Failed to duplicate questions for exam: {}", examId, e);
        }

        log.info("Exam duplicated: {} to {}", examId, duplicatedExam.getId());
        return examMapper.toDTO(duplicatedExam);
    }

    @Transactional
    public ExamTemplateDTO createTemplate(UUID examId, CreateTemplateRequest request, Authentication auth) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, auth);

        exam.setIsTemplate(true);
        exam.setTemplateName(request.getTemplateName());
        exam.setTemplateDescription(request.getDescription());
        examRepository.save(exam);

        return ExamTemplateDTO.builder()
                .id(exam.getId())
                .templateName(request.getTemplateName())
                .description(request.getDescription())
                .subject(exam.getSubject())
                .duration(exam.getDuration())
                .totalMarks(exam.getTotalMarks())
                .createdBy(exam.getTeacherId())
                .createdAt(exam.getCreatedAt())
                .build();
    }

    public Page<ExamTemplateDTO> getTemplates(Pageable pageable, Authentication auth) {
        Page<Exam> templates = examRepository.findByIsTemplate(true, pageable);

        return templates.map(exam -> ExamTemplateDTO.builder()
                .id(exam.getId())
                .templateName(exam.getTemplateName())
                .description(exam.getTemplateDescription())
                .subject(exam.getSubject())
                .duration(exam.getDuration())
                .totalMarks(exam.getTotalMarks())
                .createdBy(exam.getTeacherId())
                .createdAt(exam.getCreatedAt())
                .build());
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO createFromTemplate(UUID templateId, CreateFromTemplateRequest request, Authentication auth) {
        Exam template = findExamById(templateId);

        if (!Boolean.TRUE.equals(template.getIsTemplate())) {
            throw new BadRequestException("Specified exam is not a template");
        }

        UUID teacherId = JwtUtils.getUserId(auth);
        String teacherName = JwtUtils.getUsername(auth);

        Exam newExam = new Exam();
        newExam.setTitle(request.getTitle());
        newExam.setDescription(template.getDescription());
        newExam.setSubject(template.getSubject());
        newExam.setDuration(request.getDuration() != null ? request.getDuration() : template.getDuration());
        newExam.setTotalMarks(template.getTotalMarks());
        newExam.setPassingMarks(template.getPassingMarks());
        newExam.setInstructions(template.getInstructions());
        newExam.setShuffleQuestions(template.getShuffleQuestions());
        newExam.setShuffleOptions(template.getShuffleOptions());
        newExam.setShowResultsImmediately(template.getShowResultsImmediately());
        newExam.setAllowReview(template.getAllowReview());
        newExam.setStartTime(request.getStartTime());
        newExam.setEndTime(request.getEndTime());
        newExam.setTeacherId(teacherId);
        newExam.setTeacherName(teacherName);
        newExam.setStatus(ExamStatus.DRAFT);
        newExam.setIsActive(true);

        newExam = examRepository.save(newExam);

        try {
            teacherQuestionServiceClient.duplicateExamQuestions(templateId, newExam.getId());
        } catch (Exception e) {
            log.error("Failed to copy questions from template: {}", templateId, e);
        }

        log.info("Exam created from template: {} to {}", templateId, newExam.getId());
        return examMapper.toDTO(newExam);
    }

    // ==================== Scheduling & Management ====================

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO updateSchedule(UUID examId, UpdateScheduleRequest request, Authentication auth) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, auth);

        if (request.getStartTime() != null) {
            exam.setStartTime(request.getStartTime());
        }

        if (request.getEndTime() != null) {
            if (exam.getStartTime() != null && request.getEndTime().isBefore(exam.getStartTime())) {
                throw new BadRequestException("End time cannot be before start time");
            }
            exam.setEndTime(request.getEndTime());
        }

        exam = examRepository.save(exam);
        eventPublisher.publishExamScheduled(exam);

        log.info("Exam schedule updated: {}", examId);
        return examMapper.toDTO(exam);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO extendDeadline(UUID examId, int extraMinutes, Authentication auth) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, auth);

        if (exam.getEndTime() == null) {
            throw new BadRequestException("Exam does not have an end time set");
        }

        LocalDateTime newEndTime = exam.getEndTime().plusMinutes(extraMinutes);
        exam.setEndTime(newEndTime);

        exam = examRepository.save(exam);
        log.info("Exam deadline extended: {} by {} minutes", examId, extraMinutes);

        return examMapper.toDTO(exam);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO updateDuration(UUID examId, int durationMinutes, Authentication auth) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, auth);

        if (durationMinutes <= 0) {
            throw new BadRequestException("Duration must be positive");
        }

        exam.setDuration(durationMinutes);
        exam = examRepository.save(exam);

        log.info("Exam duration updated: {} to {} minutes", examId, durationMinutes);
        return examMapper.toDTO(exam);
    }

    // ==================== Bulk Operations ====================

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public void bulkPublish(List<UUID> examIds, Authentication auth) {
        List<Exam> examsToPublish = examRepository.findAllById(examIds);
        for (Exam exam : examsToPublish) {
            try {
                verifyExamOwnership(exam, auth);
                if (exam.getStatus() != ExamStatus.DRAFT) {
                    log.warn("Cannot publish exam {} with status {}", exam.getId(), exam.getStatus());
                    continue;
                }
                validateExamHasQuestions(exam.getId());
                exam.setStatus(ExamStatus.PUBLISHED);
                eventPublisher.publishExamPublished(exam);
                log.info("Bulk published exam: {}", exam.getId());
            } catch (Exception e) {
                log.error("Failed to publish exam {} in bulk: {}", exam.getId(), e.getMessage());
            }
        }
        examRepository.saveAll(examsToPublish);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public void bulkArchive(List<UUID> examIds, Authentication auth) {
        List<Exam> examsToArchive = examRepository.findAllById(examIds);
        for (Exam exam : examsToArchive) {
            try {
                verifyExamOwnership(exam, auth);
                exam.setStatus(ExamStatus.ARCHIVED);
                exam.setIsActive(false);
                eventPublisher.publishExamArchived(exam);
                log.info("Bulk archived exam: {}", exam.getId());
            } catch (Exception e) {
                log.error("Failed to archive exam {} in bulk: {}", exam.getId(), e.getMessage());
            }
        }
        examRepository.saveAll(examsToArchive);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public void bulkDelete(List<UUID> examIds, Authentication auth) {
        String role = JwtUtils.getRole(auth);
        if (!ROLE_ADMIN.equals(role)) {
            throw new UnauthorizedException("Only admins can perform bulk delete operations.");
        }
        List<Exam> examsToDelete = examRepository.findAllById(examIds);
        for (Exam exam : examsToDelete) {
            if (exam.getStatus() != ExamStatus.DRAFT) {
                log.warn("Cannot delete exam {} with status {}", exam.getId(), exam.getStatus());
                continue;
            }
            eventPublisher.publishExamDeleted(exam);
            log.info("Bulk deleted exam: {}", exam.getId());
        }
        examRepository.deleteAll(examsToDelete);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public void bulkUpdateStatus(BulkStatusUpdateRequest request, Authentication auth) {
        List<Exam> examsToUpdate = examRepository.findAllById(request.getExamIds());
        for (Exam exam : examsToUpdate) {
            try {
                verifyExamOwnership(exam, auth);
                exam.setStatus(request.getNewStatus());
                if (request.getNewStatus() == ExamStatus.ARCHIVED || request.getNewStatus() == ExamStatus.CANCELLED) {
                    exam.setIsActive(false);
                }
                log.info("Bulk updated exam {} to status: {}", exam.getId(), request.getNewStatus());
            } catch (Exception e) {
                log.error("Failed to update status for exam {} in bulk: {}", exam.getId(), e.getMessage());
            }
        }
        examRepository.saveAll(examsToUpdate);
    }

    // ==================== Validation & Verification ====================

    public List<ExamConflictDTO> checkConflicts(UUID examId, Authentication auth) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, auth);

        if (exam.getStartTime() == null || exam.getEndTime() == null) {
            return Collections.emptyList();
        }

        List<Exam> conflictingExams = examRepository.findConflictingExams(
                exam.getStartTime(), exam.getEndTime(), exam.getId());

        return conflictingExams.stream()
                .map(conflictExam -> ExamConflictDTO.builder()
                        .examId(conflictExam.getId())
                        .examTitle(conflictExam.getTitle())
                        .startTime(conflictExam.getStartTime())
                        .endTime(conflictExam.getEndTime())
                        .conflictType("TIME_OVERLAP")
                        .build())
                .collect(Collectors.toList());
    }

    public ExamReadinessDTO checkReadiness(UUID examId, Authentication auth) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, auth);

        List<String> issues = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        try {
            ApiResponse<Long> response = teacherQuestionServiceClient.getQuestionCount(examId);
            long questionCount = response != null && response.getData() != null ? response.getData() : 0;

            if (questionCount == 0) {
                issues.add("No questions added to the exam");
            } else if (questionCount < 5) {
                warnings.add("Exam has less than 5 questions");
            }
        } catch (Exception e) {
            issues.add("Unable to verify question count");
        }

        if (exam.getStartTime() == null) {
            warnings.add("No start time set");
        }

        if (exam.getEndTime() == null) {
            warnings.add("No end time set");
        }

        if (exam.getPassingMarks() == null || exam.getPassingMarks() == 0) {
            warnings.add("Passing marks not set");
        }

        if (exam.getPassingMarks() != null && exam.getTotalMarks() != null
                && exam.getPassingMarks() > exam.getTotalMarks()) {
            issues.add("Passing marks exceed total marks");
        }

        if (exam.getInstructions() == null || exam.getInstructions().isBlank()) {
            warnings.add("No instructions provided");
        }

        boolean isReady = issues.isEmpty();

        return ExamReadinessDTO.builder()
                .examId(examId)
                .isReady(isReady)
                .issues(issues)
                .warnings(warnings)
                .canPublish(isReady && exam.getStatus() == ExamStatus.DRAFT)
                .build();
    }

    public Boolean validateConfiguration(UUID examId, Authentication auth) {
        Exam exam = findExamById(examId);
        verifyExamOwnership(exam, auth);

        if (exam.getTitle() == null || exam.getTitle().isBlank()) {
            return false;
        }

        if (exam.getDuration() == null || exam.getDuration() <= 0) {
            return false;
        }

        if (exam.getTotalMarks() == null || exam.getTotalMarks() <= 0) {
            return false;
        }

        if (exam.getStartTime() != null && exam.getEndTime() != null) {
            if (exam.getEndTime().isBefore(exam.getStartTime())) {
                return false;
            }
        }

        return exam.getPassingMarks() == null || exam.getTotalMarks() == null || exam.getPassingMarks() <= exam.getTotalMarks();
    }

    // ==================== Exam Statistics ====================

    public int getExamQuestionCount(UUID examId) {
        try {
            ApiResponse<Long> response = teacherQuestionServiceClient.getQuestionCount(examId);
            return (response != null && response.getData() != null) ? response.getData().intValue() : 0;
        } catch (Exception e) {
            log.error("Failed to get question count for exam: {}", examId, e);
            return 0;
        }
    }

    public ExamStatisticsDTO getExamStatistics(UUID examId) {
        Exam exam = findExamById(examId);

        try {
            ApiResponse<QuestionStatisticsDTO> response = teacherQuestionServiceClient.getExamStatistics(examId);

            return Optional.ofNullable(response)
                    .filter(ApiResponse::isSuccess)
                    .map(ApiResponse::getData)
                    .map(stats -> buildExamStatistics(exam, stats))
                    .orElseGet(() -> buildEmptyExamStatistics(exam));

        } catch (Exception e) {
            log.error("Failed to fetch exam statistics: {}", examId, e);
            throw new BadRequestException("Failed to fetch exam statistics");
        }
    }

    // ==================== Helper Methods ====================

    private Exam findExamById(UUID examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
    }

    private void verifyExamOwnership(Exam exam, Authentication authentication) {
        UUID teacherId = JwtUtils.getUserId(authentication);
        String role = JwtUtils.getRole(authentication);

        if (!exam.getTeacherId().equals(teacherId) && !ROLE_ADMIN.equals(role)) {
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
            ApiResponse<Long> response = teacherQuestionServiceClient.getQuestionCount(examId);
            if (response == null || response.getData() == null || response.getData() == 0) {
                throw new BadRequestException("Cannot publish an exam with no questions");
            }
            log.info("Exam {} has {} questions", examId, response.getData());
        } catch (Exception e) {
            log.error("Failed to validate question count for exam: {}", examId, e);
            throw new BadRequestException("Failed to validate exam questions. Please ensure questions are added.");
        }
    }

    private RuntimeException handleStartAttemptFeignException(FeignException e, UUID examId) {
        log.error("Feign error during start of exam {}: Status={}, Body={}", examId, e.status(), e.contentUTF8(), e);
        if (e instanceof FeignException.Unauthorized) {
            return new UnauthorizedException("Not authorized to start this exam");
        }
        if (e instanceof FeignException.BadRequest) {
            String errorMsg = e.contentUTF8() != null && !e.contentUTF8().isBlank()
                    ? e.contentUTF8()
                    : "Invalid request to start exam";
            return new BadRequestException(errorMsg);
        }
        if (e instanceof FeignException.ServiceUnavailable) {
            return new ServiceException("Exam attempt service is temporarily unavailable. Please try again.");
        }
        return new ServiceException("Failed to start exam attempt. Please try again later.");
    }

    private void validateExamIsStartable(Exam exam) {
        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            log.warn("Exam {} is not published. Current status: {}", exam.getId(), exam.getStatus());
            throw new BadRequestException("Exam is not available for taking. Status: " + exam.getStatus());
        }
        if (!Boolean.TRUE.equals(exam.getIsActive())) {
            log.warn("Exam {} is not active", exam.getId());
            throw new BadRequestException("Exam is not active");
        }
        LocalDateTime now = LocalDateTime.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            log.warn("Exam {} has not started yet. Starts at: {}", exam.getId(), exam.getStartTime());
            throw new BadRequestException("Exam has not started yet. Starts at: " + exam.getStartTime());
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            log.warn("Exam {} has ended. Ended at: {}", exam.getId(), exam.getEndTime());
            throw new BadRequestException("Exam has ended. Ended at: " + exam.getEndTime());
        }
    }

    private AttemptResponse createExamAttempt(UUID examId) {
        log.debug("Calling attempt service to create attempt for exam {}", examId);
        StartAttemptRequest attemptRequest = new StartAttemptRequest();
        attemptRequest.setExamId(examId);
        ApiResponse<AttemptResponse> attemptResponse = attemptServiceClient.startAttempt(attemptRequest);

        return Optional.ofNullable(attemptResponse)
                .filter(ApiResponse::isSuccess)
                .map(ApiResponse::getData)
                .orElseThrow(() -> {
                    String errorMsg = Optional.ofNullable(attemptResponse)
                            .map(ApiResponse::getMessage)
                            .orElse("Unknown error");
                    log.error("Attempt service returned error for exam {}: {}", examId, errorMsg);
                    return new ServiceException("Failed to create exam attempt: " + errorMsg);
                });
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
                .totalQuestions(Optional.ofNullable(questionStats.getTotalQuestions()).orElse(0L))
                .totalMarks(Optional.ofNullable(questionStats.getTotalMarks()).orElse(0))
                .mcqCount(Optional.ofNullable(questionStats.getMcqCount()).orElse(0L))
                .trueFalseCount(Optional.ofNullable(questionStats.getTrueFalseCount()).orElse(0L))
                .shortAnswerCount(Optional.ofNullable(questionStats.getShortAnswerCount()).orElse(0L))
                .essayCount(Optional.ofNullable(questionStats.getEssayCount()).orElse(0L))
                .easyCount(Optional.ofNullable(questionStats.getEasyCount()).orElse(0L))
                .mediumCount(Optional.ofNullable(questionStats.getMediumCount()).orElse(0L))
                .hardCount(Optional.ofNullable(questionStats.getHardCount()).orElse(0L))
                .status(exam.getStatus() != null ? exam.getStatus().name() : null)
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
