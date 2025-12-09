## attempt-service/pom.xml
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
<artifactId>attempt-service</artifactId>
<dependencies>
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-data-jpa</artifactId>
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
<groupId>org.springframework.kafka</groupId>
<artifactId>spring-kafka</artifactId>
</dependency>
<dependency>
<groupId>org.postgresql</groupId>
<artifactId>postgresql</artifactId>
</dependency>
<dependency>
<groupId>com.oerms</groupId>
<artifactId>common-lib</artifactId>
</dependency>
</dependencies>
</project>
```

## AttemptServiceApplication.java
```java
package com.oerms.attempt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {"com.oerms.attempt", "com.oerms.common"})
@EnableDiscoveryClient
@EnableFeignClients
@EnableJpaAuditing
public class AttemptServiceApplication {
public static void main(String[] args) {
SpringApplication.run(AttemptServiceApplication.class, args);
}
}
```

## Attempt.java (Entity)
```java
package com.oerms.attempt.entity;

import com.oerms.common.entity.BaseEntity;
import com.oerms.common.enums.AttemptStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "attempts", schema = "oerms_attempt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attempt extends BaseEntity {

    @Column(nullable = false)
    private UUID examId;
    
    @Column(nullable = false)
    private UUID studentId;
    
    @Column(nullable = false)
    private LocalDateTime startedAt;
    
    private LocalDateTime expiresAt;
    
    private LocalDateTime submittedAt;
    
    @Column(nullable = false)
    private Integer durationSeconds;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Answer> answers;
    
    @Column(nullable = false)
    private Integer currentQuestionIndex = 0;
    
    @Column(nullable = false)
    private Integer attemptNumber = 1;
    
    private Integer timeSpentSeconds = 0;
    
    private String ipAddress;
    
    private String userAgent;
}
```

## Answer.java
```java
package com.oerms.attempt.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Answer implements Serializable {
private UUID questionId;
private String answer; // For subjective
private List<String> selectedOptions; // For MCQ
private LocalDateTime answeredAt;
private Integer timeSpentSeconds;
}
```

## AttemptRepository.java
```java
package com.oerms.attempt.repository;

import com.oerms.attempt.entity.Attempt;
import com.oerms.common.enums.AttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, UUID> {

    Page<Attempt> findByStudentIdAndDeletedFalse(UUID studentId, Pageable pageable);
    
    Page<Attempt> findByExamIdAndDeletedFalse(UUID examId, Pageable pageable);
    
    @Query("SELECT COUNT(a) FROM Attempt a WHERE a.studentId = :studentId AND a.examId = :examId AND a.deleted = false")
    Integer countByStudentIdAndExamId(UUID studentId, UUID examId);
    
    List<Attempt> findByStudentIdAndExamIdAndStatusAndDeletedFalse(
            UUID studentId, UUID examId, AttemptStatus status);
}
```

## AttemptService.java
```java
package com.oerms.attempt.service;

import com.oerms.attempt.dto.*;
import com.oerms.attempt.entity.Answer;
import com.oerms.attempt.entity.Attempt;
import com.oerms.attempt.repository.AttemptRepository;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.enums.AttemptStatus;
import com.oerms.common.exception.BusinessException;
import com.oerms.common.exception.ConflictException;
import com.oerms.common.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final ExamServiceClient examServiceClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @Transactional
    public AttemptDto startAttempt(UUID examId, UUID studentId, HttpServletRequest request) {
        // Get exam details
        ExamDto exam = examServiceClient.getExamById(examId);
        
        // Validate exam timing
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime())) {
            throw new BusinessException("Exam has not started yet");
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new BusinessException("Exam has ended");
        }
        
        // Check if student has active attempt
        List<Attempt> activeAttempts = attemptRepository
                .findByStudentIdAndExamIdAndStatusAndDeletedFalse(
                        studentId, examId, AttemptStatus.IN_PROGRESS);
        
        if (!activeAttempts.isEmpty()) {
            throw new ConflictException("You already have an active attempt for this exam");
        }
        
        // Check allowed attempts
        Integer attemptCount = attemptRepository.countByStudentIdAndExamId(studentId, examId);
        if (attemptCount >= exam.getAllowedAttempts()) {
            throw new ConflictException("Maximum number of attempts reached");
        }
        
        // Create new attempt
        Attempt attempt = Attempt.builder()
                .examId(examId)
                .studentId(studentId)
                .startedAt(now)
                .expiresAt(now.plusSeconds(exam.getDurationSeconds()))
                .durationSeconds(exam.getDurationSeconds())
                .status(AttemptStatus.IN_PROGRESS)
                .answers(new ArrayList<>())
                .currentQuestionIndex(0)
                .attemptNumber(attemptCount + 1)
                .ipAddress(getClientIp(request))
                .userAgent(request.getHeader("User-Agent"))
                .build();
        
        attempt = attemptRepository.save(attempt);
        
        // Publish event
        kafkaTemplate.send("exam.attempts.started", attempt.getId().toString());
        
        log.info("Attempt started for exam: {} by student: {}", examId, studentId);
        
        return mapToDto(attempt);
    }
    
    @Transactional
    public void saveAnswers(UUID attemptId, SaveAnswersRequest request) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BusinessException("Cannot save answers for a completed attempt");
        }
        
        if (LocalDateTime.now().isAfter(attempt.getExpiresAt())) {
            throw new BusinessException("Attempt has expired");
        }
        
        // Update answers
        List<Answer> currentAnswers = attempt.getAnswers();
        if (currentAnswers == null) {
            currentAnswers = new ArrayList<>();
        }
        
        for (Answer newAnswer : request.getAnswers()) {
            // Remove existing answer for this question
            currentAnswers.removeIf(a -> a.getQuestionId().equals(newAnswer.getQuestionId()));
            currentAnswers.add(newAnswer);
        }
        
        attempt.setAnswers(currentAnswers);
        attempt.setCurrentQuestionIndex(request.getCurrentQuestionIndex());
        
        attemptRepository.save(attempt);
        log.info("Answers saved for attempt: {}", attemptId);
    }
    
    @Transactional
    public SubmitAttemptResponse submitAttempt(UUID attemptId, List<Answer> finalAnswers) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BusinessException("Attempt is already submitted");
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // Update final answers if provided
        if (finalAnswers != null && !finalAnswers.isEmpty()) {
            attempt.setAnswers(finalAnswers);
        }
        
        attempt.setSubmittedAt(now);
        attempt.setStatus(AttemptStatus.SUBMITTED);
        attempt.setTimeSpentSeconds(
                (int) java.time.Duration.between(attempt.getStartedAt(), now).getSeconds());
        
        attempt = attemptRepository.save(attempt);
        
        // Publish event for grading
        kafkaTemplate.send("exam.attempts.submitted", attempt.getId().toString());
        
        log.info("Attempt submitted: {}", attemptId);
        
        return SubmitAttemptResponse.builder()
                .message("Exam submitted successfully")
                .attemptId(attempt.getId())
                .submittedAt(attempt.getSubmittedAt())
                .status(attempt.getStatus())
                .build();
    }
    
    @Transactional(readOnly = true)
    public AttemptDto getAttemptById(UUID id) {
        Attempt attempt = attemptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        return mapToDto(attempt);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<AttemptDto> getStudentAttempts(UUID studentId, int page, int size) {
        Page<Attempt> attemptPage = attemptRepository.findByStudentIdAndDeletedFalse(
                studentId, PageRequest.of(page, size));
        
        return PageResponse.<AttemptDto>builder()
                .content(attemptPage.getContent().stream().map(this::mapToDto).toList())
                .totalElements(attemptPage.getTotalElements())
                .totalPages(attemptPage.getTotalPages())
                .size(attemptPage.getSize())
                .number(attemptPage.getNumber())
                .build();
    }
    
    @Transactional(readOnly = true)
    public PageResponse<AttemptDto> getExamAttempts(UUID examId, int page, int size) {
        Page<Attempt> attemptPage = attemptRepository.findByExamIdAndDeletedFalse(
                examId, PageRequest.of(page, size));
        
        return PageResponse.<AttemptDto>builder()
                .content(attemptPage.getContent().stream().map(this::mapToDto).toList())
                .totalElements(attemptPage.getTotalElements())
                .totalPages(attemptPage.getTotalPages())
                .size(attemptPage.getSize())
                .number(attemptPage.getNumber())
                .build();
    }
    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
    
    private AttemptDto mapToDto(Attempt attempt) {
        return AttemptDto.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .studentId(attempt.getStudentId())
                .startedAt(attempt.getStartedAt())
                .expiresAt(attempt.getExpiresAt())
                .submittedAt(attempt.getSubmittedAt())
                .durationSeconds(attempt.getDurationSeconds())
                .status(attempt.getStatus())
                .currentQuestionIndex(attempt.getCurrentQuestionIndex())
                .attemptNumber(attempt.getAttemptNumber())
                .timeSpentSeconds(attempt.getTimeSpentSeconds())
                .build();
    }
}
```

## AttemptController.java
```java
package com.oerms.attempt.controller;

import com.oerms.attempt.dto.*;
import com.oerms.attempt.entity.Answer;
import com.oerms.attempt.service.AttemptService;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;
    
    @PostMapping("/exams/{examId}/attempts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttemptDto>> startAttempt(
            @PathVariable UUID examId,
            @RequestHeader("X-User-Id") UUID studentId,
            HttpServletRequest request) {
        AttemptDto attempt = attemptService.startAttempt(examId, studentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attempt started successfully", attempt));
    }
    
    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<ApiResponse<AttemptDto>> getAttemptById(@PathVariable UUID attemptId) {
        AttemptDto attempt = attemptService.getAttemptById(attemptId);
        return ResponseEntity.ok(ApiResponse.success(attempt));
    }
    
    @PatchMapping("/attempts/{attemptId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<String>> saveAnswers(
            @PathVariable UUID attemptId,
            @Valid @RequestBody SaveAnswersRequest request) {
        attemptService.saveAnswers(attemptId, request);
        return ResponseEntity.ok(ApiResponse.success("Answers saved successfully", "OK"));
    }
    
    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<SubmitAttemptResponse>> submitAttempt(
            @PathVariable UUID attemptId,
            @RequestBody(required = false) SubmitAttemptRequest request) {
        List<Answer> answers = request != null ? request.getAnswers() : null;
        SubmitAttemptResponse response = attemptService.submitAttempt(attemptId, answers);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/students/{studentId}/attempts")
    public ResponseEntity<ApiResponse<PageResponse<AttemptDto>>> getStudentAttempts(
            @PathVariable UUID studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<AttemptDto> attempts = attemptService.getStudentAttempts(studentId, page, size);
        return ResponseEntity.ok(ApiResponse.success(attempts));
    }
    
    @GetMapping("/exams/{examId}/attempts")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<PageResponse<AttemptDto>>> getExamAttempts(
            @PathVariable UUID examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageResponse<AttemptDto> attempts = attemptService.getExamAttempts(examId, page, size);
        return ResponseEntity.ok(ApiResponse.success(attempts));
    }
}
```

## application.yml (attempt-service)
```yaml
server:
port: 8086

spring:
application:
name: attempt-service
datasource:
url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/oerms}
username: ${DATABASE_USERNAME:postgres}
password: ${DATABASE_PASSWORD:postgres}
jpa:
hibernate:
ddl-auto: validate
properties:
hibernate:
default_schema: oerms_attempt
flyway:
enabled: true
baseline-on-migrate: true
schemas: oerms_attempt
kafka:
bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
producer:
key-serializer: org.apache.kafka.common.serialization.StringSerializer
value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

eureka:
client:
service-url:
defaultZone: http://localhost:8761/eureka/
```

## V1__init_attempt_schema.sql
```sql
-- File: src/main/resources/db/migration/V1__init_attempt_schema.sql

CREATE SCHEMA IF NOT EXISTS oerms_attempt;

CREATE TABLE IF NOT EXISTS oerms_attempt.attempts (
id UUID PRIMARY KEY,
exam_id UUID NOT NULL,
student_id UUID NOT NULL,
started_at TIMESTAMP NOT NULL,
expires_at TIMESTAMP,
submitted_at TIMESTAMP,
duration_seconds INTEGER NOT NULL,
status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
answers JSONB,
current_question_index INTEGER NOT NULL DEFAULT 0,
attempt_number INTEGER NOT NULL DEFAULT 1,
time_spent_seconds INTEGER DEFAULT 0,
ip_address VARCHAR(50),
user_agent VARCHAR(500),
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
created_by VARCHAR(255),
updated_by VARCHAR(255),
deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_attempts_exam ON oerms_attempt.attempts(exam_id);
CREATE INDEX idx_attempts_student ON oerms_attempt.attempts(student_id);
CREATE INDEX idx_attempts_status ON oerms_attempt.attempts(status);
```