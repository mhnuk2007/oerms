package com.oerms.question.dto;

import com.oerms.question.entity.DifficultyLevel;
import com.oerms.question.entity.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
private UUID id;
private UUID examId;
private String questionText;
private QuestionType type;
private Integer marks;
private Integer orderIndex;
private List<String> options;
private String correctAnswer;
private String explanation;
private DifficultyLevel difficultyLevel;
private String imageUrl;
private String createdBy;
private LocalDateTime createdAt;
private LocalDateTime updatedAt;
}