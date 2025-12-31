package com.oerms.attempt.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptAnalyticsDTO {
    private UUID examId;
    private Long totalAttempts;
    private Long completedAttempts;
    private Long inProgressAttempts;
    private Double averageCompletionTime;
    private Double averageTabSwitches;
    private Double averageWebcamViolations;
}
