# EXAM SERVICE - COMPLETE IMPLEMENTATION

## pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
http://maven.apache.org/xsd/maven-4.0.0.xsd">
<modelVersion>4.0.0</modelVersion>
<parent>
<groupId>com.oerms</groupId>
<artifactId>oerms-parent</artifactId>
<version>1.0.0</version>
</parent>
<artifactId>exam-service</artifactId>
<version>1.0.0</version>

    <dependencies>
        <dependency>
            <groupId>com.oerms</groupId>
            <artifactId>common</artifactId>
            <version>1.0.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
    </dependencies>
</project>
```

## ExamServiceApplication.java
```java
package com.oerms.exam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {
"com.oerms.exam",
"com.oerms.common.exception"
})
@EnableDiscoveryClient
@EnableFeignClients
@EnableScheduling
public class ExamServiceApplication {
public static void main(String[] args) {
SpringApplication.run(ExamServiceApplication.class, args);
}
}
```

## SecurityConfig.java
```java
package com.oerms.exam.config;

import com.oerms.common.security.ResourceServerConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;

@Configuration
public class SecurityConfig extends ResourceServerConfig {

    @Override
    protected void configureAuthorization(
            AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry authorize) {
        authorize
            .requestMatchers("/actuator/**").permitAll()
            .requestMatchers("/api/exams/published").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
            .requestMatchers("/api/exams", "/api/exams/*/publish", "/api/exams/*/unpublish")
                .hasAnyRole("TEACHER", "ADMIN")
            .requestMatchers("/api/exams/teacher/**").hasAnyRole("TEACHER", "ADMIN")
            .requestMatchers("/api/exams/*/delete").hasRole("ADMIN")
            .anyRequest().authenticated();
    }
}
```

## Exam.java (Entity)
```java
package com.oerms.exam.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;
    
    @Column(name = "teacher_name")
    private String teacherName;
    
    @Column(nullable = false)
    private Integer duration; // in minutes
    
    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks;
    
    @Column(name = "passing_marks", nullable = false)
    private Integer passingMarks;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExamStatus status;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "allow_multiple_attempts")
    private Boolean allowMultipleAttempts = false;
    
    @Column(name = "max_attempts")
    private Integer maxAttempts = 1;
    
    @Column(name = "shuffle_questions")
    private Boolean shuffleQuestions = false;
    
    @Column(name = "show_results_immediately")
    private Boolean showResultsImmediately = false;
    
    @Column(name = "instructions", length = 5000)
    private String instructions;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ExamStatus.DRAFT;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

## ExamStatus.java (Enum)
```java
package com.oerms.exam.entity;

public enum ExamStatus {
DRAFT,          // Exam is being created
PUBLISHED,      // Exam is available for students
IN_PROGRESS,    // Exam is currently being taken
COMPLETED,      // Exam has ended
ARCHIVED        // Exam is archived
}
```

## ExamDTO.java
```java
package com.oerms.exam.dto;

import com.oerms.exam.entity.ExamStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDTO {
private Long id;
private String title;
private String description;
private Long teacherId;
private String teacherName;
private Integer duration;
private Integer totalMarks;
private Integer passingMarks;
private LocalDateTime startTime;
private LocalDateTime endTime;
private ExamStatus status;
private Boolean isActive;
private Boolean allowMultipleAttempts;
private Integer maxAttempts;
private Boolean shuffleQuestions;
private Boolean showResultsImmediately;
private String instructions;
private LocalDateTime createdAt;
private LocalDateTime updatedAt;
}
```

## CreateExamRequest.java
```java
package com.oerms.exam.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateExamRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration must not exceed 600 minutes (10 hours)")
    private Integer duration;
    
    @NotNull(message = "Total marks is required")
    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;
    
    @NotNull(message = "Passing marks is required")
    @Min(value = 0, message = "Passing marks cannot be negative")
    private Integer passingMarks;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    private Boolean allowMultipleAttempts = false;
    
    @Min(value = 1, message = "Max attempts must be at least 1")
    private Integer maxAttempts = 1;
    
    private Boolean shuffleQuestions = false;
    private Boolean showResultsImmediately = false;
    
    @Size(max = 5000, message = "Instructions must not exceed 5000 characters")
    private String instructions;
}
```

## UpdateExamRequest.java
```java
package com.oerms.exam.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateExamRequest {

    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration must not exceed 600 minutes")
    private Integer duration;
    
    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;
    
    @Min(value = 0, message = "Passing marks cannot be negative")
    private Integer passingMarks;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    private Boolean allowMultipleAttempts;
    
    @Min(value = 1, message = "Max attempts must be at least 1")
    private Integer maxAttempts;
    
    private Boolean shuffleQuestions;
    private Boolean showResultsImmediately;
    
    @Size(max = 5000, message = "Instructions must not exceed 5000 characters")
    private String instructions;
}
```

## ExamEvent.java
```java
package com.oerms.exam.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamEvent {
private String eventType; // exam.created, exam.published, exam.completed
private Long examId;
private Long teacherId;
private String title;
private String description;
private Integer duration;
private Integer totalMarks;
private Integer passingMarks;
private LocalDateTime startTime;
private LocalDateTime endTime;
private String status;
private LocalDateTime timestamp;
}
```

## ExamRepository.java
```java
package com.oerms.exam.repository;

import com.oerms.exam.entity.Exam;
import com.oerms.exam.entity.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    Page<Exam> findByTeacherId(Long teacherId, Pageable pageable);
    
    Page<Exam> findByStatus(ExamStatus status, Pageable pageable);
    
    Page<Exam> findByStatusAndIsActive(ExamStatus status, Boolean isActive, Pageable pageable);
    
    List<Exam> findByTeacherIdAndStatus(Long teacherId, ExamStatus status);
    
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' AND e.isActive = true " +
           "AND (e.startTime IS NULL OR e.startTime <= :now) " +
           "AND (e.endTime IS NULL OR e.endTime >= :now)")
    List<Exam> findActiveExams(@Param("now") LocalDateTime now);
    
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
           "AND e.endTime IS NOT NULL AND e.endTime < :now")
    List<Exam> findExpiredExams(@Param("now") LocalDateTime now);
    
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
           "AND e.startTime IS NOT NULL AND e.startTime <= :now " +
           "AND e.endTime IS NOT NULL AND e.endTime >= :now")
    List<Exam> findOngoingExams(@Param("now") LocalDateTime now);
    
    Optional<Exam> findByIdAndTeacherId(Long id, Long teacherId);
    
    Long countByTeacherId(Long teacherId);
    
    Long countByStatus(ExamStatus status);
}
```

## ExamService.java
```java
package com.oerms.exam.service;

import com.oerms.common.dto.PageResponse;
import com.oerms.common.exception.BadRequestException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.UnauthorizedException;
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
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
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
        
        // Validate exam is ready to publish
        // TODO: Check if exam has questions via Question Service
        
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
```

## ExamScheduler.java (Auto-complete expired exams)
```java
package com.oerms.exam.scheduler;

import com.oerms.exam.entity.Exam;
import com.oerms.exam.entity.ExamStatus;
import com.oerms.exam.event.ExamEvent;
import com.oerms.exam.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExamScheduler {

    private final ExamRepository examRepository;
    private final KafkaTemplate<String, ExamEvent> kafkaTemplate;
    
    private static final String EXAM_EVENTS_TOPIC = "exam-events";

    /**
     * Auto-complete expired exams
     * Runs every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    @Transactional
    public void autoCompleteExpiredExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> expiredExams = examRepository.findExpiredExams(now);
        
        for (Exam exam : expiredExams) {
            exam.setStatus(ExamStatus.COMPLETED);
            examRepository.save(exam);
            
            // Publish exam completed event
            publishEvent("exam.completed", exam);
            
            log.info("Auto-completed expired exam: {}", exam.getId());
        }
        
        if (!expiredExams.isEmpty()) {
            log.info("Auto-completed {} expired exams", expiredExams.size());
        }
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
    }
}
```

## ExamController.java
```java
package com.oerms.exam.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.PageResponse;
import com.oerms.exam.dto.CreateExamRequest;
import com.oerms.exam.dto.ExamDTO;
import com.oerms.exam.dto.UpdateExamRequest;
import com.oerms.exam.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> createExam(
            @Valid @RequestBody CreateExamRequest request) {
        ExamDTO exam = examService.createExam(request);
        return new ResponseEntity<>(
            ApiResponse.success("Exam created successfully", exam),
            HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamDTO>> getExam(@PathVariable Long id) {
        ExamDTO exam = examService.getExam(id);
        return ResponseEntity.ok(ApiResponse.success(exam));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExamRequest request) {
        ExamDTO exam = examService.updateExam(id, request);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", exam));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", null));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> publishExam(@PathVariable Long id) {
        ExamDTO exam = examService.publishExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam published successfully", exam));
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> unpublishExam(@PathVariable Long id) {
        ExamDTO exam = examService.unpublishExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam unpublished successfully", exam));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> archiveExam(@PathVariable Long id) {
        ExamDTO exam = examService.archiveExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam archived successfully", exam));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getTeacherExams(
            @PathVariable Long teacherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        PageResponse<ExamDTO> exams = examService.getTeacherExams(
            teacherId, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getPublishedExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        PageResponse<ExamDTO> exams = examService.getPublishedExams(
            PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getActiveExams() {
        List<ExamDTO> exams = examService.getActiveExams();
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @GetMapping("/ongoing")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getOngoingExams() {
        List<ExamDTO> exams = examService.getOngoingExams();
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @GetMapping("/teacher/{teacherId}/count")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getTeacherExamCount(@PathVariable Long teacherId) {
        Long count = examService.getTeacherExamCount(teacherId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/published/count")
    public ResponseEntity<ApiResponse<Long>> getPublishedExamCount() {
        Long count = examService.getPublishedExamCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
```

## RedisConfig.java
```java
package com.oerms.exam.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}
```

## KafkaConfig.java
```java
package com.oerms.exam.config;

import com.oerms.exam.event.ExamEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, ExamEvent> examEventProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, ExamEvent> examEventKafkaTemplate() {
        return new KafkaTemplate<>(examEventProducerFactory());
    }

    @Bean
    public NewTopic examEventsTopic() {
        return new NewTopic("exam-events", 3, (short) 1);
    }
}
```

## FeignClientConfig.java
```java
package com.oerms.exam.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                requestTemplate.header("Authorization", "Bearer " + jwt.getTokenValue());
            }
        };
    }
}
```

## application.yml
```yaml
spring:
  application:
    name: exam-service

  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_exam
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000

  jpa:
    hibernate:
      ddl-auto: update
      show-sql: false
      properties:
        hibernate:
          dialect: org.hibernate.dialect.PostgreSQLDialect
          format_sql: true

  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: 6379
      timeout: 60000

  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      properties:
        spring.json.add.type.headers: false

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9000

server:
  port: 9002

eureka:
  client:
    service-url:
      defaultZone: http://eureka:eureka123@localhost:8761/eureka/
  instance:
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 30

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always

logging:
  level:
    com.oerms.exam: DEBUG
    org.springframework.security: INFO
    org.springframework.kafka: INFO

feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 5000
```

## ExamServiceTest.java (Sample Test)
```java
package com.oerms.exam.service;

import com.oerms.exam.dto.CreateExamRequest;
import com.oerms.exam.dto.ExamDTO;
import com.oerms.exam.entity.Exam;
import com.oerms.exam.entity.ExamStatus;
import com.oerms.exam.repository.ExamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private ExamService examService;

    private Exam testExam;
    private CreateExamRequest createRequest;

    @BeforeEach
    void setUp() {
        testExam = Exam.builder()
            .id(1L)
            .title("Test Exam")
            .description("Test Description")
            .teacherId(1L)
            .duration(60)
            .totalMarks(100)
            .passingMarks(40)
            .status(ExamStatus.DRAFT)
            .isActive(true)
            .build();

        createRequest = new CreateExamRequest();
        createRequest.setTitle("Test Exam");
        createRequest.setDuration(60);
        createRequest.setTotalMarks(100);
        createRequest.setPassingMarks(40);
    }

    @Test
    void testGetExam_Success() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));

        ExamDTO result = examService.getExam(1L);

        assertNotNull(result);
        assertEquals("Test Exam", result.getTitle());
        verify(examRepository, times(1)).findById(1L);
    }

    @Test
    void testPublishExam_Success() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(testExam));
        when(examRepository.save(any(Exam.class))).thenReturn(testExam);

        ExamDTO result = examService.publishExam(1L);

        assertEquals(ExamStatus.PUBLISHED, result.getStatus());
        verify(kafkaTemplate, times(1)).send(anyString(), anyString(), any());
    }
}
```

## API Documentation Examples
```
# Exam Service API Examples

## 1. Create Exam (Teacher/Admin)
POST /api/exams
Authorization: Bearer {token}
Content-Type: application/json

{
"title": "Spring Boot Advanced",
"description": "Advanced concepts in Spring Boot",
"duration": 90,
"totalMarks": 100,
"passingMarks": 40,
"startTime": "2024-02-01T10:00:00",
"endTime": "2024-02-01T11:30:00",
"allowMultipleAttempts": false,
"maxAttempts": 1,
"shuffleQuestions": true,
"showResultsImmediately": false,
"instructions": "Read all questions carefully before answering."
}

Response: 201 Created
{
"success": true,
"message": "Exam created successfully",
"data": {
"id": 1,
"title": "Spring Boot Advanced",
"status": "DRAFT",
...
}
}

## 2. Get Exam Details
GET /api/exams/1
Authorization: Bearer {token}

Response: 200 OK
{
"success": true,
"data": {
"id": 1,
"title": "Spring Boot Advanced",
"description": "Advanced concepts in Spring Boot",
"teacherId": 1,
"teacherName": "john_doe",
"duration": 90,
"totalMarks": 100,
"passingMarks": 40,
"status": "DRAFT",
...
}
}

## 3. Update Exam (Draft only)
PUT /api/exams/1
Authorization: Bearer {token}
Content-Type: application/json

{
"title": "Spring Boot Expert Level",
"duration": 120,
"totalMarks": 150
}

Response: 200 OK

## 4. Publish Exam
POST /api/exams/1/publish
Authorization: Bearer {token}

Response: 200 OK
{
"success": true,
"message": "Exam published successfully",
"data": {
"id": 1,
"status": "PUBLISHED",
...
}
}

## 5. Get Published Exams (Student view)
GET /api/exams/published?page=0&size=10
Authorization: Bearer {token}

Response: 200 OK
{
"success": true,
"data": {
"content": [...],
"pageNumber": 0,
"pageSize": 10,
"totalElements": 25,
"totalPages": 3,
"last": false
}
}

## 6. Get Teacher's Exams
GET /api/exams/teacher/1?page=0&size=10&sortBy=createdAt&sortDir=DESC
Authorization: Bearer {token}

Response: 200 OK

## 7. Get Active Exams (Currently available)
GET /api/exams/active
Authorization: Bearer {token}

Response: 200 OK
{
"success": true,
"data": [
{
"id": 1,
"title": "Java Fundamentals",
"status": "PUBLISHED",
"startTime": "2024-01-20T10:00:00",
"endTime": "2024-01-20T12:00:00"
}
]
}

## 8. Archive Exam
POST /api/exams/1/archive
Authorization: Bearer {token}

Response: 200 OK

## 9. Delete Exam (Admin only, Draft only)
DELETE /api/exams/1
Authorization: Bearer {token}

Response: 200 OK
{
"success": true,
"message": "Exam deleted successfully"
}

## 10. Get Exam Count
GET /api/exams/teacher/1/count
Authorization: Bearer {token}

Response: 200 OK
{
"success": true,
"data": 15
}
```

## README.md
```markdown
# Exam Service

## Overview
Manages exam lifecycle: creation, publishing, completion, and archiving.

## Features
- ✅ Create and manage exams (CRUD)
- ✅ Publish/unpublish exams
- ✅ Auto-complete expired exams
- ✅ Role-based access control
- ✅ Redis caching
- ✅ Kafka event publishing
- ✅ Scheduled tasks

## Status Flow
DRAFT → PUBLISHED → COMPLETED → ARCHIVED

## API Endpoints
See API Documentation Examples above

## Configuration
- Port: 9002
- Database: oerms_exam
- Cache: Redis (30 min TTL)
- Events: Kafka (exam-events topic)

## Running
```bash
cd exam-service
mvn spring-boot:run
```

## Testing
```bash
mvn test
```
```
