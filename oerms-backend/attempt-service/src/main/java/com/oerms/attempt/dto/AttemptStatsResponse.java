package com.oerms.attempt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttemptStatsResponse {
    private Long totalAttempts;
    private Long completedAttempts;
    private Long inProgressAttempts;
    private Double averageScore;
    private Integer averageTimeTaken;
    private List<AttemptSummary> recentAttempts;
}
