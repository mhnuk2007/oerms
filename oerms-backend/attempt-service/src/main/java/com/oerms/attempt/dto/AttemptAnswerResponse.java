package com.oerms.attempt.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptAnswerResponse {

    private UUID questionId;
    private Integer questionOrder;

    private Set<String> selectedOptions;
    private String answerText;

    private Integer marksAllocated;
    private Integer timeSpentSeconds;

    private Boolean flagged;
    private LocalDateTime answeredAt;
}
