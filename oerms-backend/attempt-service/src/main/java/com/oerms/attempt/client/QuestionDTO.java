package com.oerms.attempt.client;

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
    private String questionType; // Renamed from 'type' to 'questionType'
    private Integer marks;
    private Integer orderIndex;
    private List<String> options; // For MCQ/MULTIPLE_SELECT
    private String correctAnswer; // Stores correct answer(s)
    private String difficultyLevel; // EASY, MEDIUM, HARD
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
