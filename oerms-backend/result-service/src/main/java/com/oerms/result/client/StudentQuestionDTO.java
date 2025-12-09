package com.oerms.result.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO for questions shown to students during exam
 * Does NOT include correctAnswer to prevent cheating
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuestionDTO {
    private UUID id;
    private UUID examId;
    private String questionText;
    private String type; // MCQ, MULTIPLE_SELECT, TRUE_FALSE, SHORT_ANSWER, ESSAY
    private Integer marks;
    private Integer orderIndex;
    private List<String> options; // For MCQ/MULTIPLE_SELECT
    private String explanation; // May be shown after submission
    private String difficultyLevel; // EASY, MEDIUM, HARD
    private String imageUrl;
    
    // NOTE: correctAnswer is intentionally excluded for security
}