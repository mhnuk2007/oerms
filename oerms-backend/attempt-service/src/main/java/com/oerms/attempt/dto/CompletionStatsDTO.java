package com.oerms.attempt.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletionStatsDTO {
    private UUID examId;
    private Long totalAttempts;
    private Long completedCount;
    private Long autoSubmittedCount;
    private Long abandonedCount;
    private Double completionRate;
}
