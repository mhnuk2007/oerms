package com.oerms.question.dto;

import com.oerms.question.entity.DifficultyLevel;
import com.oerms.question.entity.QuestionType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CreateQuestionRequest {

    @NotNull(message = "Exam ID is required")
    private UUID examId;
    
    @NotBlank(message = "Question text is required")
    @Size(max = 5000, message = "Question text must not exceed 5000 characters")
    private String questionText;
    
    @NotNull(message = "Question type is required")
    private QuestionType type;
    
    @NotNull(message = "Marks is required")
    @Min(value = 1, message = "Marks must be at least 1")
    private Integer marks;
    
    private Integer orderIndex;
    
    private List<String> options;
    
    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;
    
    @Size(max = 2000, message = "Explanation must not exceed 2000 characters")
    private String explanation;
    
    private DifficultyLevel difficultyLevel;
    
    private String imageUrl;
}