package com.oerms.attempt.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAttemptStatistics {

    private UUID examId;
    private String examTitle;

    private Long totalAttempts;
    private Long completedAttempts;
    private Long inProgressAttempts;
    private Long autoSubmittedAttempts;

    private Double averageScore;
    private Double highestScore;
    private Double lowestScore;

    private Double averageTimeSpentMinutes;

    private Long passedCount;
    private Long failedCount;
}
