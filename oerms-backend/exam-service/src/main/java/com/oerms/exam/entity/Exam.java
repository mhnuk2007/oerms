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

    public Exam() {
        // Default constructor for JPA/Jackson
    }
    
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