package com.oerms.attempt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    /** Average time spent in minutes */
    private Double averageTimeSpent;

    private Long passedCount;
    private Long failedCount;
}
