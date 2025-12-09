package com.oerms.attempt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttemptAnswerResponse {
    private UUID id;
    private UUID questionId;
    private Integer questionOrder;
    private Set<UUID> selectedOptions;
    private String answerText;
    private Boolean isCorrect;
    private Double marksObtained;
    private Integer marksAllocated;
    private Integer timeSpentSeconds;
    private Boolean flagged;
    private LocalDateTime answeredAt;
}
