package com.oerms.exam.service;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.exception.BadRequestException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.UnauthorizedException;
import com.oerms.exam.client.QuestionServiceClient;
import com.oerms.exam.dto.CreateExamRequest;
import com.oerms.exam.dto.ExamDTO;
import com.oerms.exam.dto.UpdateExamRequest;
import com.oerms.exam.entity.Exam;
import com.oerms.exam.entity.ExamStatus;
import com.oerms.exam.event.ExamEvent;
import com.oerms.exam.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamService {

    private final ExamRepository examRepository;
    private final KafkaTemplate<String, ExamEvent> kafkaTemplate;
    private final QuestionServiceClient questionServiceClient;
    
    private static final String EXAM_EVENTS_TOPIC = "exam-events";

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO createExam(CreateExamRequest request) {
        Long teacherId = getCurrentUserId();
        String teacherName = getCurrentUsername();
        
        // Validate passing marks
        if (request.getPassingMarks() > request.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot exceed total marks");
        }
        
        // Validate date range
        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getEndTime().isBefore(request.getStartTime())) {
                throw new BadRequestException("End time must be after start time");
            }
        }
        
        Exam exam = Exam.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .teacherId(teacherId)
            .teacherName(teacherName)
            .duration(request.getDuration())
            .totalMarks(request.getTotalMarks())
            .passingMarks(request.getPassingMarks())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .status(ExamStatus.DRAFT)
            .isActive(true)
            .allowMultipleAttempts(request.getAllowMultipleAttempts())
            .maxAttempts(request.getMaxAttempts())
            .shuffleQuestions(request.getShuffleQuestions())
            .showResultsImmediately(request.getShowResultsImmediately())
            .instructions(request.getInstructions())
            .build();
        
        exam = examRepository.save(exam);
        
        // Publish exam created event
        publishEvent("exam.created", exam);
        
        log.info("Exam created: {} by teacher: {}", exam.getId(), teacherId);
        return mapToDTO(exam);
    }

    @Cacheable(value = "exams", key = "#examId")
    public ExamDTO getExam(Long examId) {
        log.info("Fetching exam with ID: {}", examId);
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
        log.info("Exam fetched: {}", examId);
        return mapToDTO(exam);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO updateExam(Long examId, UpdateExamRequest request) {
        Long teacherId = getCurrentUserId();
        
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
        
        // Check ownership
        if (!exam.getTeacherId().equals(teacherId) && !isAdmin()) {
            throw new UnauthorizedException("You don't have permission to update this exam");
        }
        
        // Can only update DRAFT exams
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new BadRequestException("Only draft exams can be updated. Current status: " + exam.getStatus());
        }
        
        // Update fields
        if (request.getTitle() != null) exam.setTitle(request.getTitle());
        if (request.getDescription() != null) exam.setDescription(request.getDescription());
        if (request.getDuration() != null) exam.setDuration(request.getDuration());
        if (request.getTotalMarks() != null) exam.setTotalMarks(request.getTotalMarks());
        if (request.getPassingMarks() != null) {
            if (request.getPassingMarks() > exam.getTotalMarks()) {
                throw new BadRequestException("Passing marks cannot exceed total marks");
            }
            exam.setPassingMarks(request.getPassingMarks());
        }
        if (request.getStartTime() != null) exam.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) exam.setEndTime(request.getEndTime());
        if (request.getAllowMultipleAttempts() != null) exam.setAllowMultipleAttempts(request.getAllowMultipleAttempts());
        if (request.getMaxAttempts() != null) exam.setMaxAttempts(request.getMaxAttempts());
        if (request.getShuffleQuestions() != null) exam.setShuffleQuestions(request.getShuffleQuestions());
        if (request.getShowResultsImmediately() != null) exam.setShowResultsImmediately(request.getShowResultsImmediately());
        if (request.getInstructions() != null) exam.setInstructions(request.getInstructions());
        
        exam = examRepository.save(exam);
        
        log.info("Exam updated: {} by teacher: {}", examId, teacherId);
        return mapToDTO(exam);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public void deleteExam(Long examId) {
        Long teacherId = getCurrentUserId();
        
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
        
        // Check ownership (Admin can delete any exam)
        if (!exam.getTeacherId().equals(teacherId) && !isAdmin()) {
            throw new UnauthorizedException("You don't have permission to delete this exam");
        }
        
        // Can only delete DRAFT exams
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new BadRequestException("Only draft exams can be deleted. Use archive instead.");
        }
        
        examRepository.delete(exam);
        
        log.info("Exam deleted: {} by user: {}", examId, teacherId);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO publishExam(Long examId) {
        Long teacherId = getCurrentUserId();
        
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
        
        // Check ownership
        if (!exam.getTeacherId().equals(teacherId) && !isAdmin()) {
            throw new UnauthorizedException("You don't have permission to publish this exam");
        }
        
        // Can only publish DRAFT exams
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new BadRequestException("Only draft exams can be published. Current status: " + exam.getStatus());
        }
        
        // Check if exam has questions via Question Service
        ApiResponse<Long> response = questionServiceClient.getQuestionCount(examId);
        if (response == null || response.getData() == null || response.getData() == 0) {
            throw new BadRequestException("Cannot publish an exam with no questions.");
        }
        
        exam.setStatus(ExamStatus.PUBLISHED);
        exam = examRepository.save(exam);
        
        // Publish exam published event
        publishEvent("exam.published", exam);
        
        log.info("Exam published: {} by teacher: {}", examId, teacherId);
        return mapToDTO(exam);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO unpublishExam(Long examId) {
        Long teacherId = getCurrentUserId();
        
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
        
        // Check ownership
        if (!exam.getTeacherId().equals(teacherId) && !isAdmin()) {
            throw new UnauthorizedException("You don't have permission to unpublish this exam");
        }
        
        // Can only unpublish PUBLISHED exams
        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new BadRequestException("Only published exams can be unpublished");
        }
        
        exam.setStatus(ExamStatus.DRAFT);
        exam = examRepository.save(exam);
        
        log.info("Exam unpublished: {} by teacher: {}", examId, teacherId);
        return mapToDTO(exam);
    }

    @Transactional
    @CacheEvict(value = {"exams", "publishedExams", "teacherExams"}, allEntries = true)
    public ExamDTO archiveExam(Long examId) {
        Long teacherId = getCurrentUserId();
        
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
        
        // Check ownership
        if (!exam.getTeacherId().equals(teacherId) && !isAdmin()) {
            throw new UnauthorizedException("You don't have permission to archive this exam");
        }
        
        exam.setStatus(ExamStatus.ARCHIVED);
        exam.setIsActive(false);
        exam = examRepository.save(exam);
        
        log.info("Exam archived: {} by teacher: {}", examId, teacherId);
        return mapToDTO(exam);
    }

    @Cacheable(value = "teacherExams", key = "#teacherId + '-' + #pageable.pageNumber")
    public PageResponse<ExamDTO> getTeacherExams(Long teacherId, Pageable pageable) {
        Page<Exam> examsPage = examRepository.findByTeacherId(teacherId, pageable);
        return mapToPageResponse(examsPage);
    }

    @Cacheable(value = "publishedExams")
    public PageResponse<ExamDTO> getPublishedExams(Pageable pageable) {
        Page<Exam> examsPage = examRepository.findByStatusAndIsActive(
            ExamStatus.PUBLISHED, true, pageable);
        return mapToPageResponse(examsPage);
    }

    public List<ExamDTO> getActiveExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> exams = examRepository.findActiveExams(now);
        return exams.stream().map(this::mapToDTO).toList();
    }

    public List<ExamDTO> getOngoingExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> exams = examRepository.findOngoingExams(now);
        return exams.stream().map(this::mapToDTO).toList();
    }

    public Long getTeacherExamCount(Long teacherId) {
        return examRepository.countByTeacherId(teacherId);
    }

    public Long getPublishedExamCount() {
        return examRepository.countByStatus(ExamStatus.PUBLISHED);
    }

    private void publishEvent(String eventType, Exam exam) {
        ExamEvent event = ExamEvent.builder()
            .eventType(eventType)
            .examId(exam.getId())
            .teacherId(exam.getTeacherId())
            .title(exam.getTitle())
            .description(exam.getDescription())
            .duration(exam.getDuration())
            .totalMarks(exam.getTotalMarks())
            .passingMarks(exam.getPassingMarks())
            .startTime(exam.getStartTime())
            .endTime(exam.getEndTime())
            .status(exam.getStatus().name())
            .timestamp(LocalDateTime.now())
            .build();
        
        kafkaTemplate.send(EXAM_EVENTS_TOPIC, String.valueOf(exam.getId()), event);
        log.info("Published event: {} for exam: {}", eventType, exam.getId());
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            Object userIdClaim = jwt.getClaim("userId");
            if (userIdClaim instanceof Number) {
                return ((Number) userIdClaim).longValue();
            }
        }
        return null;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("sub");
        }
        return authentication != null ? authentication.getName() : null;
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    private ExamDTO mapToDTO(Exam exam) {
        return ExamDTO.builder()
            .id(exam.getId())
            .title(exam.getTitle())
            .description(exam.getDescription())
            .teacherId(exam.getTeacherId())
            .teacherName(exam.getTeacherName())
            .duration(exam.getDuration())
            .totalMarks(exam.getTotalMarks())
            .passingMarks(exam.getPassingMarks())
            .startTime(exam.getStartTime())
            .endTime(exam.getEndTime())
            .status(exam.getStatus())
            .isActive(exam.getIsActive())
            .allowMultipleAttempts(exam.getAllowMultipleAttempts())
            .maxAttempts(exam.getMaxAttempts())
            .shuffleQuestions(exam.getShuffleQuestions())
            .showResultsImmediately(exam.getShowResultsImmediately())
            .instructions(exam.getInstructions())
            .createdAt(exam.getCreatedAt())
            .updatedAt(exam.getUpdatedAt())
            .build();
    }

    private PageResponse<ExamDTO> mapToPageResponse(Page<Exam> page) {
        return PageResponse.<ExamDTO>builder()
            .content(page.getContent().stream().map(this::mapToDTO).toList())
            .pageNumber(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }
}