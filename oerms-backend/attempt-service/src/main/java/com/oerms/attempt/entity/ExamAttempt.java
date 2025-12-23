package com.oerms.attempt.entity;

import com.oerms.common.entity.BaseEntity;
import com.oerms.common.enums.AttemptStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "exam_attempts", indexes = {
        @Index(name = "idx_attempt_student_id", columnList = "student_id"),
        @Index(name = "idx_attempt_exam_id", columnList = "exam_id"),
        @Index(name = "idx_exam_student_status", columnList = "exam_id, student_id, status")
        // Removed the unique constraint - now handled by partial index in database
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SQLDelete(sql = "UPDATE exam_attempts SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
public class ExamAttempt extends BaseEntity {

    @Column(name = "exam_id", nullable = false)
    private UUID examId;

    @Column(name = "exam_title")
    private String examTitle;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "answered_questions")
    @Builder.Default
    private Integer answeredQuestions = 0;

    @Column(name = "flagged_questions")
    @Builder.Default
    private Integer flaggedQuestions = 0;

    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @Column(name = "exam_duration_in_minutes")
    private Integer examDurationInMinutes;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "browser_info", length = 200)
    private String browserInfo;

    @Column(name = "tab_switches")
    @Builder.Default
    private Integer tabSwitches = 0;

    @Column(name = "webcam_violations")
    @Builder.Default
    private Integer webcamViolations = 0;

    @Column(name = "copy_paste_count")
    @Builder.Default
    private Integer copyPasteCount = 0;

    @Column(name = "auto_submitted")
    @Builder.Default
    private Boolean autoSubmitted = false;

    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AttemptAnswer> answers = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    // Helper methods
    public void addAnswer(AttemptAnswer answer) {
        answers.add(answer);
        answer.setAttempt(this);
    }
    
    public void incrementTabSwitches() {
        this.tabSwitches++;
    }
    
    public void incrementWebcamViolations() {
        this.webcamViolations++;
    }
    
    public void incrementCopyPaste() {
        this.copyPasteCount++;
    }
    
    public void updateAnsweredCount() {
        this.answeredQuestions = (int) answers.stream()
            .filter(a -> a.getAnswerText() != null || (a.getSelectedOptions() != null && !a.getSelectedOptions().isEmpty()))
            .count();
    }
    
    public void updateFlaggedCount() {
        this.flaggedQuestions = (int) answers.stream()
            .filter(AttemptAnswer::getFlagged)
            .count();
    }
    
    public Integer calculateTimeTaken() {
        if (startedAt != null && submittedAt != null) {
            return (int) java.time.Duration.between(startedAt, submittedAt).getSeconds();
        }
        return null;
    }
    
    public boolean hasViolations() {
        return tabSwitches > 0 || webcamViolations > 0 || copyPasteCount > 5;
    }
    
    /**
     * Check if the attempt is in a final state (cannot be modified)
     */
    public boolean isFinalState() {
        return status == AttemptStatus.SUBMITTED || 
               status == AttemptStatus.AUTO_SUBMITTED || 
               status == AttemptStatus.COMPLETED;
    }
    
    /**
     * Check if the attempt can be submitted
     */
    public boolean canBeSubmitted() {
        return status == AttemptStatus.IN_PROGRESS;
    }
}