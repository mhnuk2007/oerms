

package com.oerms.exam.entity;

import com.oerms.common.entity.BaseEntity;
import com.oerms.common.enums.ExamStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "exams")
@Builder
@NoArgsConstructor
@AllArgsConstructor


public class Exam extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "teacher_id", nullable = false)
    private UUID teacherId;

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

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "allow_multiple_attempts")
    private Boolean allowMultipleAttempts = false;

    @Builder.Default
    @Column(name = "max_attempts")
    private Integer maxAttempts = 1;

    @Builder.Default
    @Column(name = "shuffle_questions")
    private Boolean shuffleQuestions = false;

    @Builder.Default
    @Column(name = "show_results_immediately")
    private Boolean showResultsImmediately = false;

    @Column(name = "instructions", length = 5000)
    private String instructions;
}
