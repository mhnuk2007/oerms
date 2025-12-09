package com.oerms.question.entity;

import com.oerms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question extends BaseEntity {

    @Column(name = "exam_id", nullable = false)
    private UUID examId;

    @Column(name = "question_text", nullable = false, length = 5000)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(nullable = false)
    private Integer marks;

    @Column(name = "order_index")
    private Integer orderIndex;

    @ElementCollection
    @CollectionTable(
            name = "question_options",
            joinColumns = @JoinColumn(name = "question_id")
    )
    @Column(name = "option_text", length = 1000)
    @OrderColumn(name = "option_order")
    private List<String> options;

    @Column(name = "correct_answer", length = 5000)
    private String correctAnswer;

    @Column(length = 2000)
    private String explanation;

    @Column(name = "difficulty_level")
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;

    @Column(name = "image_url")
    private String imageUrl;
}
