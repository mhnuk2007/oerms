package com.oerms.question.dto;

import com.oerms.question.entity.DifficultyLevel;
import com.oerms.question.entity.QuestionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class UpdateQuestionRequest {

    @Size(max = 5000, message = "Question text must not exceed 5000 characters")
    private String questionText;
    
    private QuestionType type;
    
    @Min(value = 1, message = "Marks must be at least 1")
    private Integer marks;
    
    private Integer orderIndex;
    
    private List<String> options;
    
    private String correctAnswer;
    
    @Size(max = 2000, message = "Explanation must not exceed 2000 characters")
    private String explanation;
    
    private DifficultyLevel difficultyLevel;
    
    private String imageUrl;
}