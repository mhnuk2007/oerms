package com.oerms.exam.entity;

import com.oerms.common.entity.BaseEntity;
import com.oerms.exam.enums.ExamStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "exams", indexes = {
        @Index(name = "idx_teacher_id", columnList = "teacher_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_start_time", columnList = "start_time"),
        @Index(name = "idx_end_time", columnList = "end_time"),
        @Index(name = "idx_is_active", columnList = "is_active"),
        @Index(name = "idx_subject", columnList = "subject"),
        @Index(name = "idx_is_template", columnList = "is_template")
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exam extends BaseEntity {

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "teacher_id", nullable = false)
    private UUID teacherId;

    @Column(name = "teacher_name", length = 255)
    private String teacherName;

    @Column(length = 100)
    private String subject;

    @Column(nullable = false)
    private Integer duration; // in minutes

    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks;

    @Column(name = "passing_marks")
    private Integer passingMarks;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ExamStatus status = ExamStatus.DRAFT;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "allow_multiple_attempts")
    private Boolean allowMultipleAttempts = false;

    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Builder.Default
    @Column(name = "shuffle_questions")
    private Boolean shuffleQuestions = false;

    @Builder.Default
    @Column(name = "shuffle_options")
    private Boolean shuffleOptions = false;

    @Builder.Default
    @Column(name = "show_results_immediately")
    private Boolean showResultsImmediately = false;

    @Builder.Default
    @Column(name = "allow_review")
    private Boolean allowReview = true;

    @Column(name = "instructions", length = 5000)
    private String instructions;

    // Template-related fields
    @Builder.Default
    @Column(name = "is_template")
    private Boolean isTemplate = false;

    @Column(name = "template_name", length = 255)
    private String templateName;

    @Column(name = "template_description", length = 1000)
    private String templateDescription;

    // Prerequisite exams
    @Column(name = "prerequisite_exam_ids", columnDefinition = "TEXT")
    @Convert(converter = UUIDListConverter.class)
    private List<UUID> prerequisiteExamIds;

    // Additional metadata
    @Column(name = "negative_marking")
    private Boolean negativeMarking;

    @Column(name = "negative_marks_per_question")
    private Double negativeMarksPerQuestion;

    @Column(name = "auto_submit")
    @Builder.Default
    private Boolean autoSubmit = true;

    @Column(name = "webcam_required")
    @Builder.Default
    private Boolean webcamRequired = false;

    @Column(name = "full_screen_required")
    @Builder.Default
    private Boolean fullScreenRequired = false;

    @Column(name = "randomize_question_order")
    @Builder.Default
    private Boolean randomizeQuestionOrder = false;

    @Column(name = "show_question_numbers")
    @Builder.Default
    private Boolean showQuestionNumbers = true;

    @Column(name = "allow_question_navigation")
    @Builder.Default
    private Boolean allowQuestionNavigation = true;

    @Column(name = "certificate_enabled")
    @Builder.Default
    private Boolean certificateEnabled = false;

    @Column(name = "certificate_template_id")
    private UUID certificateTemplateId;
}
