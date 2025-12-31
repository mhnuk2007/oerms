package com.oerms.attempt.dto;

import lombok.*;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveAnswerRequest {
    private UUID questionId;
    private String answerText;
    private Set<String> selectedOptions;
    private Boolean flagged;
    private Long timeSpentSeconds;
}
