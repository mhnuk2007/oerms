package com.oerms.result.entity;

import com.oerms.common.entity.BaseEntity;
import com.oerms.result.enums.ResultStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "results", indexes = {
    @Index(name = "idx_result_student_id", columnList = "student_id"),
    @Index(name = "idx_result_exam_id", columnList = "exam_id"),
    @Index(name = "idx_result_attempt_id", columnList = "attempt_id"),
    @Index(name = "idx_result_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true) // Added to address equals/hashCode warning
public class Result extends BaseEntity {
    
    @Column(name = "attempt_id", nullable = false, unique = true)
    private UUID attemptId;
    
    @Column(name = "exam_id", nullable = false)
    private UUID examId;
    
    @Column(name = "exam_title")
    private String examTitle;
    
    @Column(name = "student_id", nullable = false)
    private UUID studentId;
    
    @Column(name = "student_name")
    private String studentName;
    
    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks;
    
    @Column(name = "obtained_marks", nullable = false)
    private Double obtainedMarks;
    
    @Column(name = "percentage", nullable = false)
    private Double percentage;
    
    @Column(name = "passing_marks")
    private Integer passingMarks;
    
    @Column(name = "passed", nullable = false)
    @Builder.Default
    private Boolean passed = false;
    
    @Column(name = "grade", length = 2)
    private String grade;
    
    @Column(name = "rank")
    private Integer rank;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ResultStatus status = ResultStatus.DRAFT;
    
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;
    
    @Column(name = "correct_answers")
    private Integer correctAnswers;
    
    @Column(name = "wrong_answers")
    private Integer wrongAnswers;
    
    @Column(name = "unanswered")
    private Integer unanswered;
    
    @Column(name = "time_taken_seconds")
    private Long timeTakenSeconds;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
    
    @Column(name = "graded_by")
    private UUID gradedBy;
    
    @Column(name = "graded_by_name")
    private String gradedByName;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "published_by")
    private UUID publishedBy;
    
    @Column(name = "teacher_comments", length = 2000)
    private String teacherComments;
    
    @Column(name = "attempt_number")
    private Integer attemptNumber;
    
    @Column(name = "auto_submitted")
    private Boolean autoSubmitted;
    
    @Column(name = "auto_graded")
    @Builder.Default
    private Boolean autoGraded = false;
    
    @Column(name = "requires_manual_grading")
    @Builder.Default
    private Boolean requiresManualGrading = false;
    
    @Column(name = "objective_marks")
    private Double objectiveMarks;
    
    @Column(name = "subjective_marks")
    private Double subjectiveMarks;
    
    @Column(name = "tab_switches")
    @Builder.Default
    private Integer tabSwitches = 0;
    
    @Column(name = "webcam_violations")
    @Builder.Default
    private Integer webcamViolations = 0;
    
    @Column(name = "suspicious_activity")
    @Builder.Default
    private Boolean suspiciousActivity = false;
    
    public void calculateGrade() {
        if (percentage == null) return;
        
        if (percentage >= 90) this.grade = "A+";
        else if (percentage >= 85) this.grade = "A";
        else if (percentage >= 80) this.grade = "A-";
        else if (percentage >= 75) this.grade = "B+";
        else if (percentage >= 70) this.grade = "B";
        else if (percentage >= 65) this.grade = "B-";
        else if (percentage >= 60) this.grade = "C+";
        else if (percentage >= 55) this.grade = "C";
        else if (percentage >= 50) this.grade = "C-";
        else if (percentage >= 45) this.grade = "D";
        else this.grade = "F";
    }
    
    public void determinePassFail() {
        if (passingMarks != null && obtainedMarks != null) {
            this.passed = obtainedMarks >= passingMarks;
        }
    }
    
    public boolean hasSuspiciousActivity() {
        return Boolean.TRUE.equals(suspiciousActivity) || 
               tabSwitches > 5 || 
               webcamViolations > 3;
    }
}
