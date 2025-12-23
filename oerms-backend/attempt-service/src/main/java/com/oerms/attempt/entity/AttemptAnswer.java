package com.oerms.attempt.entity;

import com.oerms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

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
@EqualsAndHashCode(callSuper = true)
@SQLDelete(sql = "UPDATE attempt_answers SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
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
    @Column(name = "option_value") // Changed column name to reflect String values
    @Builder.Default
    private Set<String> selectedOptions = new HashSet<>(); // Changed type from UUID to String

    @Column(name = "answer_text", length = 5000)
    private String answerText;

    @Column(name = "marks_allocated")
    private Integer marksAllocated;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;

    @Column(name = "flagged")
    @Builder.Default
    private Boolean flagged = false;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

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