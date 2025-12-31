package com.oerms.result.dto;

import lombok.*;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptAnswerDTO {
    private UUID questionId;
    private Integer questionOrder;
    private String answerText;
    private Set<String> selectedOptions;
    private Boolean flagged;
    private Long timeSpentSeconds;
    private Integer marksAllocated;
}
