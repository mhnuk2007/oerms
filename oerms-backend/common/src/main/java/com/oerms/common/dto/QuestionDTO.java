package com.oerms.common.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    @JsonProperty("type")
    private String type; // Keep it simple as 'type'
    
    private Integer marks;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private String difficultyLevel;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
