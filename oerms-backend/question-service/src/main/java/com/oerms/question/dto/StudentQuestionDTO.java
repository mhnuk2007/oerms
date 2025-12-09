package com.oerms.question.dto;

import com.oerms.question.entity.DifficultyLevel;
import com.oerms.question.entity.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuestionDTO {
  private UUID id;
  private String questionText;
  private QuestionType type;
  private Integer marks;
  private Integer orderIndex;
  private List<String> options;
  private DifficultyLevel difficultyLevel;
  private String imageUrl;
}