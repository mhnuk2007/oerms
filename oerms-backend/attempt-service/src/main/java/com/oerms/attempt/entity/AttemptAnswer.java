package com.oerms.attempt.entity;

import com.oerms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "attempt_answers", indexes = {
    @Index(name = "idx_attempt_answer_attempt_id", columnList = "attempt_id"),
    @Index(name = "idx_attempt_answer_question_id", columnList = "question_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptAnswer extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;
    
    @Column(name = "question_id", nullable = false)
    private UUID questionId;
    
    @Column(name = "question_order")
    private Integer questionOrder;
    
    @ElementCollection
    @CollectionTable(
        name = "attempt_selected_options",
        joinColumns = @JoinColumn(name = "attempt_answer_id")
    )
    @Column(name = "option_id")
    private Set<UUID> selectedOptions = new HashSet<>();
    
    @Column(name = "answer_text", length = 5000)
    private String answerText;
    
    @Column(name = "is_correct")
    private Boolean isCorrect;
    
    @Column(name = "marks_obtained")
    private Double marksObtained;
    
    @Column(name = "marks_allocated")
    private Integer marksAllocated;
    
    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;
    
    @Column(name = "flagged")
    @Builder.Default
    private Boolean flagged = false;
    
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        if (getUpdatedAt() == null) {
            setUpdatedAt(LocalDateTime.now());
        }
        if (answeredAt == null && (answerText != null || !selectedOptions.isEmpty())) {
            answeredAt = LocalDateTime.now();
        }
    }
    
    public boolean isAnswered() {
        return (answerText != null && !answerText.trim().isEmpty()) || 
               !selectedOptions.isEmpty();
    }
}