package com.oerms.attempt.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptProgressDTO {
    private UUID attemptId;
    private Integer totalQuestions;
    private Integer answeredQuestions;
    private Integer unansweredQuestions;
    private Integer flaggedQuestions;
    private Double completionPercentage;
}
