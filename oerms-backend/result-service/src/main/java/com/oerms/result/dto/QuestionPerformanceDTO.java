package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionPerformanceDTO {
    private UUID questionId;
    private String questionText;
    private Integer totalAttempts;
    private Integer correctAnswers;
    private Double accuracyRate;
    private Double averageTimeSeconds;
    private String difficulty;
}
