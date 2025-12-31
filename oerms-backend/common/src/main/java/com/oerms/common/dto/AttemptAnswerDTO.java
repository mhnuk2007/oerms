package com.oerms.common.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptAnswerDTO {
    private UUID id;
    private UUID questionId;
    private Integer questionOrder;
    private String answerText;
    private Set<String> selectedOptions;
    private Boolean flagged;
    private Long timeSpentSeconds;
    private Integer marksAllocated;
    private LocalDateTime answeredAt;
}
